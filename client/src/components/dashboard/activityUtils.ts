/** Local YYYY-MM-DD for heatmap keys */
export function toLocalYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseYMD(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function startOfWeekSunday(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const dow = x.getDay();
  x.setDate(x.getDate() - dow);
  return x;
}

export type HeatmapRange = "year" | "half";

export function getHeatmapWindow(range: HeatmapRange): {
  startSunday: Date;
  endDate: Date;
  weekCount: number;
} {
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);
  const daysBack = range === "year" ? 365 : 180;
  const approxStart = addDays(endDate, -daysBack);
  const startSunday = startOfWeekSunday(approxStart);
  const weekCount = range === "year" ? 53 : 27;
  return { startSunday, endDate, weekCount };
}

export function buildDailyCounts(
  dates: string[],
  range: HeatmapRange
): Map<string, number> {
  const { startSunday, endDate } = getHeatmapWindow(range);
  const map = new Map<string, number>();
  for (const iso of dates) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) continue;
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    if (day < startSunday || day > endDate) continue;
    const key = toLocalYMD(d);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

export type HeatCell = { date: Date; count: number; key: string };

export function buildHeatmapGrid(
  counts: Map<string, number>,
  range: HeatmapRange
): { weeks: HeatCell[][]; monthLabels: { col: number; label: string }[] } {
  const { startSunday, endDate, weekCount } = getHeatmapWindow(range);
  const weeks: HeatCell[][] = [];

  for (let w = 0; w < weekCount; w++) {
    const week: HeatCell[] = [];
    for (let dow = 0; dow < 7; dow++) {
      const date = addDays(startSunday, w * 7 + dow);
      if (date > endDate) {
        week.push({
          date,
          count: -1,
          key: toLocalYMD(date),
        });
        continue;
      }
      const key = toLocalYMD(date);
      week.push({
        date,
        count: counts.get(key) ?? 0,
        key,
      });
    }
    weeks.push(week);
  }

  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const firstFuture = week.every((c) => c.count < 0);
    if (firstFuture) return;
    const d = week.find((c) => c.count >= 0)?.date ?? week[0].date;
    if (d.getMonth() !== lastMonth) {
      lastMonth = d.getMonth();
      monthLabels.push({
        col,
        label: d.toLocaleDateString("en-US", { month: "short" }),
      });
    }
  });

  return { weeks, monthLabels };
}

export function activityStats(
  counts: Map<string, number>,
  rangeStart: Date,
  rangeEnd: Date
): { total: number; activeDays: number; maxStreak: number } {
  let total = 0;
  let activeDays = 0;

  for (const [k, v] of counts) {
    const d = parseYMD(k);
    if (d < rangeStart || d > rangeEnd) continue;
    if (v > 0) {
      total += v;
      activeDays++;
    }
  }

  let maxStreak = 0;
  let cur = 0;
  const cursor = new Date(rangeStart);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(rangeEnd);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const key = toLocalYMD(cursor);
    if ((counts.get(key) ?? 0) > 0) {
      cur++;
      maxStreak = Math.max(maxStreak, cur);
    } else {
      cur = 0;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return { total, activeDays, maxStreak };
}

export function levelForCount(n: number): 0 | 1 | 2 | 3 | 4 {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  if (n === 2) return 2;
  if (n === 3) return 3;
  return 4;
}

export type RoomForActivity = {
  createdAt?: string;
  createdBy?: string | { _id?: string };
  members?: (string | { _id?: string })[];
  messages?: { user?: string; createdAt?: string }[];
};

function idStr(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "object" && v !== null && "_id" in v)
    return String((v as { _id: unknown })._id);
  return String(v);
}

/**
 * ISO timestamps for dashboard heatmap: interviews, job applications,
 * study room creation (if you created the room), and chat messages you sent.
 */
export function collectDashboardActivityDates(
  userId: string | null,
  interviews: { createdAt?: string }[],
  applications: { createdAt?: string }[],
  rooms: RoomForActivity[]
): string[] {
  const out: string[] = [];
  const uid = userId ? String(userId) : "";

  for (const i of interviews) {
    if (i.createdAt) out.push(i.createdAt);
  }
  for (const a of applications) {
    if (a.createdAt) out.push(a.createdAt);
  }

  for (const room of rooms) {
    const memberIds = (room.members ?? []).map(idStr);
    if (!uid || !memberIds.includes(uid)) continue;

    const creator = idStr(room.createdBy);
    if (creator === uid && room.createdAt) out.push(room.createdAt);

    for (const msg of room.messages ?? []) {
      if (!msg?.createdAt) continue;
      if (String(msg.user) !== uid) continue;
      out.push(msg.createdAt);
    }
  }

  return out;
}
