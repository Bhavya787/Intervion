import { cn } from "@/lib/utils";
import {
  type HeatmapRange,
  buildDailyCounts,
  buildHeatmapGrid,
  activityStats,
  getHeatmapWindow,
  levelForCount,
} from "./activityUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";

const LEVEL_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-slate-200/90 dark:bg-slate-800/90",
  1: "bg-emerald-900/90 dark:bg-emerald-900",
  2: "bg-emerald-700 dark:bg-emerald-700",
  3: "bg-emerald-500 dark:bg-emerald-500",
  4: "bg-emerald-400 dark:bg-emerald-400",
};

type Props = {
  activityDates: string[];
  range: HeatmapRange;
  onRangeChange: (r: HeatmapRange) => void;
};

export function ActivityHeatmap({ activityDates, range, onRangeChange }: Props) {
  const counts = buildDailyCounts(activityDates, range);
  const { weeks, monthLabels } = buildHeatmapGrid(counts, range);
  const { startSunday, endDate } = getHeatmapWindow(range);
  const stats = activityStats(counts, startSunday, endDate);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#12121a]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex flex-wrap items-center gap-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            <span>{stats.total}</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {range === "year"
                ? "Recent activity in the year"
                : "Recent activity in the last 6 months"}
            </span>
            <span
              className="inline-flex text-slate-400"
              title="Includes interviews, job applications, study rooms you created, and messages you sent in rooms."
            >
              <Info className="h-4 w-4" />
            </span>
          </p>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Total active days:{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {stats.activeDays}
              </strong>
            </span>
            <span>
              Max streak:{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {stats.maxStreak} day{stats.maxStreak === 1 ? "" : "s"}
              </strong>
            </span>
          </div>
        </div>
        <Select
          value={range}
          onValueChange={(v) => onRangeChange(v as HeatmapRange)}
        >
          <SelectTrigger className="h-9 w-[140px] shrink-0 border-slate-200 bg-slate-50 text-slate-900 dark:border-white/10 dark:bg-[#1a1a24] dark:text-slate-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-[#1a1a24] dark:text-slate-100">
            <SelectItem value="year">Current year</SelectItem>
            <SelectItem value="half">Last 6 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell) => {
                if (cell.count < 0) {
                  return (
                    <div
                      key={cell.key}
                      className="h-[11px] w-[11px] rounded-sm sm:h-3 sm:w-3"
                      aria-hidden
                    />
                  );
                }
                const lv = levelForCount(cell.count);
                const label =
                  cell.count === 0
                    ? `No activity on ${cell.key}`
                    : `${cell.count} activit${cell.count === 1 ? "y" : "ies"} on ${cell.key}`;
                return (
                  <div
                    key={cell.key}
                    title={label}
                    className={cn(
                      "h-[11px] w-[11px] rounded-sm transition-transform hover:scale-110 hover:ring-2 hover:ring-emerald-400/50 sm:h-3 sm:w-3",
                      LEVEL_CLASS[lv]
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-2 flex min-w-max gap-[3px]">
          {weeks.map((_, wi) => {
            const ml = monthLabels.find((m) => m.col === wi);
            return (
              <div
                key={wi}
                className="flex w-[11px] shrink-0 justify-center sm:w-3"
              >
                {ml ? (
                  <span className="text-[9px] font-medium text-slate-500 dark:text-slate-500">
                    {ml.label}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 text-[10px] text-slate-500 dark:text-slate-400">
        <span>Less</span>
        <div className="flex gap-1">
          {([0, 1, 2, 3, 4] as const).map((lv) => (
            <div
              key={lv}
              className={cn("h-3 w-3 rounded-sm", LEVEL_CLASS[lv])}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
