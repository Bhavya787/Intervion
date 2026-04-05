// src/pages/student/StudentsJobsPage.tsx
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { Briefcase, Sparkles, Send, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

type Job = {
  _id: string;
  title: string;
  description?: string;
  skills?: string[];
  rounds?: unknown[];
  difficulty?: string;
  createdAt?: string;
  status?: "open" | "closed";
};

type Application = {
  _id: string;
  jobId: Job | string;
  status: string;
  currentRound?: string;
  createdAt?: string;
};

const StudentJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobsRes, appsRes] = await Promise.all([
          axiosInstance.get("/jobs", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axiosInstance.get("/applications/mine", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);
        setJobs(jobsRes.data || []);
        setApplications(appsRes.data || []);
      } catch (err) {
        console.error("Error fetching jobs/apps", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const appliedJobIds = new Set(
    applications.map((a) => {
      const id = (a.jobId as { _id?: string })?._id ?? (a.jobId as string) ?? "";
      return String(id);
    })
  );

  const openJobs = jobs.filter(
    (job) => job.status === "open" && !appliedJobIds.has(String(job._id))
  );
  const closedJobs = jobs.filter((job) => job.status === "closed");
  const appliedJobs = jobs.filter((job) => appliedJobIds.has(String(job._id)));

  const applyJob = async (jobId: string) => {
    setApplyingId(jobId);
    try {
      await axiosInstance.post(
        "/applications",
        { jobId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const appsRes = await axiosInstance.get("/applications/mine", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setApplications(appsRes.data || []);
    } catch (err: unknown) {
      console.error("Apply failed", err);
      const msg =
        (err as { response?: { data?: { msg?: string } } })?.response?.data
          ?.msg ?? "Failed to apply. Please try again.";
      alert(msg);
    } finally {
      setApplyingId(null);
    }
  };

  const sectionBadge = (type: "open" | "closed" | "applied") => {
    if (type === "open")
      return (
        <Badge className="border-0 bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">
          Open
        </Badge>
      );
    if (type === "applied")
      return (
        <Badge className="border-0 bg-sky-100 text-sky-900 dark:bg-sky-500/15 dark:text-sky-200">
          Applied
        </Badge>
      );
    return (
      <Badge className="border-0 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
        Closed
      </Badge>
    );
  };

  const renderJobs = (
    list: Job[],
    label: string,
    type: "open" | "closed" | "applied"
  ) => {
    if (list.length === 0) {
      return (
        <div className="mb-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/30">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No {label.toLowerCase()} jobs right now.
          </p>
        </div>
      );
    }

    return (
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((job) => {
          const alreadyApplied = appliedJobIds.has(String(job._id));

          return (
            <Card
              key={job._id}
              className="rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md dark:border-white/[0.08] dark:bg-[#1e293b] dark:hover:border-blue-500/20"
            >
              <CardHeader className="flex flex-col gap-3 pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <CardTitle
                    className="cursor-pointer text-lg font-semibold text-slate-900 dark:text-white"
                    onClick={() => navigate(`/student/jobs/${job._id}`)}
                  >
                    <span className="hover:text-blue-600 hover:underline dark:hover:text-blue-400">
                      {job.title}
                    </span>
                  </CardTitle>
                  {sectionBadge(type)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                  {job.description || "No description provided."}
                </p>
                {(job.skills?.length ?? 0) > 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Skills:{" "}
                    </span>
                    {(job.skills || []).join(", ")}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {type === "open" && (
                    <Button
                      onClick={() => applyJob(job._id)}
                      disabled={applyingId === job._id || alreadyApplied}
                      className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-sky-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg dark:from-blue-600 dark:to-sky-700"
                    >
                      {alreadyApplied
                        ? "Applied"
                        : applyingId === job._id
                          ? "Applying..."
                          : "Apply"}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="rounded-xl border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:bg-slate-800/80"
                    onClick={() => navigate(`/student/jobs/${job._id}`)}
                  >
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-wide text-slate-900 dark:text-white">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                <Briefcase className="h-7 w-7" />
              </span>
              Job openings
            </h1>
            <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
              Browse roles, apply in one click, and track listings you&apos;ve
              already submitted to.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Sparkles className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            Open roles
          </div>
          {renderJobs(openJobs, "Open", "open")}

          <div className="mb-4 mt-8 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Send className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            You&apos;ve applied
          </div>
          {renderJobs(appliedJobs, "Applied", "applied")}

          <div className="mb-4 mt-8 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Lock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            Closed listings
          </div>
          {renderJobs(closedJobs, "Closed", "closed")}
        </div>
      </div>
    </div>
  );
};

export default StudentJobsPage;
