import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { Briefcase, ChevronDown, ChevronUp } from "lucide-react";

type Application = {
  _id: string;
  jobId: { _id: string; title: string };
  status:
    | "applied"
    | "in-progress"
    | "selected"
    | "final-selected"
    | "rejected";
  createdAt: string;
  currentRound?: number;
};

const statusLabels: Record<Application["status"], string> = {
  applied: "Applied",
  "in-progress": "In progress",
  selected: "Selected",
  "final-selected": "Final selected",
  rejected: "Rejected",
};

const statusColors: Record<Application["status"], string> = {
  applied:
    "border-0 bg-blue-100 text-blue-900 dark:bg-blue-500/15 dark:text-blue-200",
  "in-progress":
    "border-0 bg-yellow-100 text-yellow-900 dark:bg-yellow-500/15 dark:text-yellow-200",
  selected:
    "border-0 bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200",
  "final-selected":
    "border-0 bg-sky-100 text-sky-900 dark:bg-sky-500/15 dark:text-sky-200",
  rejected:
    "border-0 bg-rose-100 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200",
};

const StudentApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/applications/mine", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setApplications(res.data || []);
      } catch (err) {
        console.error("Error fetching applications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const groupedApps: Record<Application["status"], Application[]> = {
    applied: [],
    "in-progress": [],
    selected: [],
    "final-selected": [],
    rejected: [],
  };
  applications.forEach((app) => {
    if (groupedApps[app.status]) {
      groupedApps[app.status].push(app);
    }
  });

  const toggleGroup = (status: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
        <Navigation />
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
      <Navigation />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-2">
          <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-wide text-slate-900 dark:text-white">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
              <Briefcase className="h-7 w-7" />
            </span>
            My applications
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
            Grouped by status—tap a section to expand. Open an application for
            full detail.
          </p>
        </div>

        {Object.entries(groupedApps).map(([status, apps]) => (
          <Card
            key={status}
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#1e293b]"
          >
            <CardHeader
              onClick={() => toggleGroup(status)}
              className="flex cursor-pointer flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4 transition-colors hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/30 dark:hover:bg-slate-900/50"
            >
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                {statusLabels[status as Application["status"]]}
                <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                  {apps.length}
                </span>
              </CardTitle>
              {expandedGroups[status] ? (
                <ChevronUp className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
              )}
            </CardHeader>
            {expandedGroups[status] && (
              <CardContent className="space-y-3 p-6">
                {apps.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No applications in this category.
                  </p>
                ) : (
                  apps.map((app) => (
                    <div
                      key={app._id}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        navigate(`/student/application/${app._id}`)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/student/application/${app._id}`);
                        }
                      }}
                      className="cursor-pointer rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 transition-all hover:border-blue-200 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-900/40 dark:hover:border-blue-500/30"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {app.jobId?.title}
                        </p>
                        <Badge className={statusColors[app.status]}>
                          {statusLabels[app.status]}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Applied{" "}
                        {new Date(app.createdAt).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </p>
                      {app.currentRound !== undefined && (
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                          Current round: {app.currentRound}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentApplicationsPage;
