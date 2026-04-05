import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle,
  BarChart,
  Play,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { QuickActionsSection } from "@/components/dashboard/QuickActionsSection";
import {
  collectDashboardActivityDates,
  type HeatmapRange,
  type RoomForActivity,
} from "@/components/dashboard/activityUtils";

type Interview = {
  _id: string;
  result: "success" | "failure" | "Quit";
  difficulty: string;
  type: "practice" | "company";
  createdAt: string;
  companyName?: string;
  role?: string;
  scheduledAt?: string;
};

const StudentDashboard = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null
  );
  const [newScheduleDate, setNewScheduleDate] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [heatmapRange, setHeatmapRange] = useState<HeatmapRange>("year");
  const [applications, setApplications] = useState<{ createdAt?: string }[]>(
    []
  );
  const [rooms, setRooms] = useState<RoomForActivity[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      const [intRes, appsRes, roomsRes, meRes] = await Promise.all([
        axiosInstance.get("/interview/mine", auth).catch(() => ({ data: [] })),
        axiosInstance.get("/applications/mine", auth).catch(() => ({ data: [] })),
        axiosInstance.get("/rooms", auth).catch(() => ({ data: [] })),
        axiosInstance.get("/auth/me", auth),
      ]);

      const intData = intRes.data;
      if (Array.isArray(intData)) setInterviews(intData);
      else if (Array.isArray(intData?.data)) setInterviews(intData.data);
      else setInterviews([]);

      const appData = appsRes.data;
      setApplications(Array.isArray(appData) ? appData : []);

      const roomData = roomsRes.data;
      setRooms(Array.isArray(roomData) ? roomData : []);

      const user = meRes.data?.user;
      setUserName(user?.fullName || "Student");
      setCurrentUserId(user?._id ? String(user._id) : null);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReschedule = async () => {
    if (!selectedInterview || !newScheduleDate) return;

    setRescheduling(true);
    try {
      await axiosInstance.patch(`/interview/${selectedInterview._id}/reschedule`, {
        scheduledAt: new Date(newScheduleDate).toISOString(),
      });

      toast({
        title: "Success",
        description: "Interview rescheduled successfully",
      });

      setRescheduleDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Reschedule error:", error);
      toast({
        title: "Error",
        description: "Failed to reschedule interview",
        variant: "destructive",
      });
    } finally {
      setRescheduling(false);
    }
  };

  const total = interviews.length;
  const passed = interviews.filter((i) => i.result === "success").length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const pending = interviews.filter(
    (i) => !i.result || i.result === "Quit"
  ).length;

  const graded = interviews.filter(
    (i) => i.result === "success" || i.result === "failure"
  );
  const avgOutcome =
    graded.length > 0
      ? Math.round((graded.filter((i) => i.result === "success").length / graded.length) * 100)
      : 0;

  const activityDates = useMemo(
    () =>
      collectDashboardActivityDates(
        currentUserId,
        interviews,
        applications,
        rooms
      ),
    [currentUserId, interviews, applications, rooms]
  );

  const monthlySessions = useMemo(() => {
    const now = new Date();
    const rows: { name: string; sessions: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("en-US", { month: "short" });
      const y = d.getFullYear();
      const m = d.getMonth();
      const count = activityDates.filter((iso) => {
        const x = new Date(iso);
        return x.getFullYear() === y && x.getMonth() === m;
      }).length;
      rows.push({ name: label, sessions: count });
    }
    return rows;
  }, [activityDates]);

  const upcomingInterviews = interviews
    .filter(
      (i) => i.scheduledAt && new Date(i.scheduledAt) > new Date()
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()
    );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-wide text-slate-900 dark:text-white">
              Welcome back, {" "}
              <span className="text-blue-600 dark:text-blue-400">
                {userName}
              </span>
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Track sessions, streaks, and outcomes—then jump into practice.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/student/practice">
              <Button className="gap-2 bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700">
                <Play className="h-4 w-4 fill-current" />
                Practice interview
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Sessions",
              value: total,
              icon: BarChart,
              iconClass:
                "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
              valueClass: "dark:text-white",
            },
            {
              label: "Pass rate",
              value: `${passRate}%`,
              icon: TrendingUp,
              iconClass:
                "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
              valueClass: "text-green-600 dark:text-green-400",
            },
            {
              label: "Outcome score",
              value: graded.length ? `${avgOutcome}%` : "—",
              sub: graded.length ? "of graded sessions" : "Complete sessions",
              icon: CheckCircle,
              iconClass:
                "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
              valueClass: "text-blue-600 dark:text-blue-400",
            },
            {
              label: "Pending",
              value: pending,
              icon: Clock,
              iconClass:
                "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400",
              valueClass: "text-yellow-600 dark:text-yellow-400",
            },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-none bg-white shadow-sm dark:bg-[#1e293b]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {s.label}
                      </p>
                      <p
                        className={`mt-1 text-3xl font-bold ${s.valueClass}`}
                      >
                        {s.value}
                      </p>
                      {"sub" in s && s.sub ? (
                        <p className="mt-0.5 text-xs text-slate-400">{s.sub}</p>
                      ) : null}
                    </div>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.iconClass}`}
                    >
                      <s.icon size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <ActivityHeatmap
            activityDates={activityDates}
            range={heatmapRange}
            onRangeChange={setHeatmapRange}
          />
        </motion.div>

        <div className="mb-10 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          <Card className="border border-slate-200/80 bg-white dark:border-white/[0.08] dark:bg-[#1e293b]">
            <CardContent className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
                Activity per month (last 6)
              </h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlySessions}
                    margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 11,
                        fill: "hsl(var(--muted-foreground, 148 163 184))",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 11,
                        fill: "hsl(var(--muted-foreground, 148 163 184))",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ReTooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid rgba(148,163,184,0.25)",
                        background: "rgba(15,23,42,0.95)",
                        color: "#f8fafc",
                      }}
                      labelStyle={{ color: "#94a3b8" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      name="Activities"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{
                        fill: "#2563eb",
                        strokeWidth: 0,
                        r: 4,
                      }}
                      activeDot={{ r: 6, fill: "#38bdf8" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="flex min-h-[280px] flex-col border border-slate-200/80 bg-white dark:border-white/[0.08] dark:bg-[#1e293b]">
            <CardContent className="flex flex-1 flex-col p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Calendar className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                Upcoming schedule (next 7 days)
              </h3>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
                {upcomingInterviews.length > 0 ? (
                  upcomingInterviews.map((interview) => (
                    <div
                      key={interview._id}
                      className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700/80 dark:bg-slate-900/40"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-400">
                            <span className="text-[9px] font-bold uppercase">
                              {new Date(
                                interview.scheduledAt!
                              ).toLocaleDateString("en-US", { month: "short" })}
                            </span>
                            <span className="text-base font-extrabold leading-none">
                              {new Date(
                                interview.scheduledAt!
                              ).toLocaleDateString("en-US", { day: "2-digit" })}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                {new Date(
                                  interview.scheduledAt!
                                ).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <Badge
                                variant="outline"
                                className="h-5 border-none bg-blue-50 text-[10px] text-blue-600 dark:bg-blue-500/10"
                              >
                                {interview.type === "company"
                                  ? "Live interview"
                                  : "Practice"}
                              </Badge>
                            </div>
                            <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                              {interview.role || "Technical interview"} @{" "}
                              {interview.companyName || "Intervion"}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Button
                            size="sm"
                            className="h-8 bg-blue-600 px-3 text-xs font-bold shadow-md shadow-blue-500/10 hover:bg-blue-700"
                            onClick={() =>
                              navigate(
                                interview.type === "company"
                                  ? `/interview/${interview._id}`
                                  : `/student/practice`
                              )
                            }
                          >
                            Join
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-slate-200 px-2 text-xs font-bold dark:border-slate-700"
                            onClick={() => {
                              setSelectedInterview(interview);
                              setNewScheduleDate(
                                new Date(interview.scheduledAt!)
                                  .toISOString()
                                  .slice(0, 16)
                              );
                              setRescheduleDialogOpen(true);
                            }}
                          >
                            Reschedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-900/30">
                    <Calendar className="mb-2 h-10 w-10 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No interviews scheduled for the next 7 days.
                    </p>
                    <Link to="/student/practice">
                      <Button
                        variant="link"
                        className="text-xs font-bold text-blue-600 dark:text-blue-400"
                      >
                        Start a practice session
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
            <QuickActionsSection />

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4 dark:text-white">🔔 Recent Alerts</h2>
              <div className="space-y-3">
                {interviews.length > 0 ? (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-500/10 dark:bg-blue-500/5">
                    <p className="mb-1 text-xs font-bold uppercase tracking-tighter text-blue-600 dark:text-blue-400">
                      System
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      You have completed{" "}
                      <span className="font-bold">{interviews.length}</span>{" "}
                      total sessions. Keep the streak going.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                    <p className="mb-1 text-xs font-bold uppercase tracking-tighter text-slate-500">
                      Activity
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Welcome to Intervion—start your first AI practice today.
                    </p>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>

      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1e293b] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-white">
              Reschedule interview
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="new-date"
                className="text-sm font-medium dark:text-slate-300"
              >
                New date and time
              </label>
              <input
                id="new-date"
                type="datetime-local"
                className="w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={newScheduleDate}
                onChange={(e) => setNewScheduleDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRescheduleDialogOpen(false)}
              className="dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={rescheduling || !newScheduleDate}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {rescheduling ? "Rescheduling…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
