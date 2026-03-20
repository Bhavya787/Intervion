import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Users, 
  CheckCircle, 
  XCircle, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Plus, 
  Calendar, 
  Clock, 
  ChevronRight,
  Settings,
  Check
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import axiosInstance from "@/utils/axiosInstance";
import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const CompanyDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [newScheduleDate, setNewScheduleDate] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const [dashRes, meRes] = await Promise.all([
        axiosInstance.get("/company/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);
      
      setStats(dashRes.data.stats);
      setJobs(dashRes.data.jobs);
      setRecentApps(dashRes.data.recentApplications);
      setUpcomingInterviews(dashRes.data.upcomingInterviews || []);
      setCompanyName(meRes.data?.user?.fullName || "Your Company");
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleReschedule = useCallback(async () => {
    if (!selectedInterview || !newScheduleDate) return;
    
    setRescheduling(true);
    try {
      // For applications, we use the /applications/:id/schedule endpoint
      await axiosInstance.patch(`/applications/${selectedInterview._id}/schedule`, {
        scheduledAt: new Date(newScheduleDate).toISOString(),
      });
      
      toast({
        title: "Success",
        description: "Interview rescheduled successfully",
      });
      
      setRescheduleDialogOpen(false);
      fetchDashboardData();
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
  }, [selectedInterview, newScheduleDate, fetchDashboardData, toast]);

  const chartData = [
    { name: "Applied", value: stats?.applied || 0 },
    { name: "Selected", value: stats?.selected || 0 },
    { name: "Rejected", value: stats?.rejected || 0 },
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 🏢 Company Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              🏢 {companyName} <span className="text-indigo-600 dark:text-indigo-400">Dashboard</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage your recruitment pipeline and track candidate progress.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/company/job/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 gap-2">
                <Plus className="h-4 w-4" />
                Post New Job
              </Button>
            </Link>
            <Button variant="outline" size="icon" className="border-slate-200 dark:border-slate-700 text-slate-500">
              <Settings size={18} />
            </Button>
          </div>
        </div>

        {/* 📊 Hiring Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="border-none shadow-sm bg-white dark:bg-[#161B2C] overflow-hidden relative group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Open Roles</p>
                  <p className="text-3xl font-bold mt-1 dark:text-white">{stats?.totalJobs || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Briefcase size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-[#161B2C] overflow-hidden relative group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Candidates</p>
                  <p className="text-3xl font-bold mt-1 dark:text-white">{stats?.totalApplications || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Users size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-[#161B2C] overflow-hidden relative group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Interviews</p>
                  <p className="text-3xl font-bold mt-1 dark:text-white">
                    {upcomingInterviews.length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                  <Calendar size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-[#161B2C] overflow-hidden relative group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Hires (Month)</p>
                  <p className="text-3xl font-bold mt-1 text-green-600 dark:text-green-400">
                    {stats?.finalSelected || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                  <CheckCircle size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ⏰ Today's Interviews */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                <Clock className="h-5 w-5 text-indigo-600" />
                Today's Interviews
              </h2>
              <Button variant="ghost" size="sm" className="text-indigo-600 text-xs font-semibold">
                Full Schedule
              </Button>
            </div>
            
            <div className="space-y-4">
              {upcomingInterviews.length > 0 ? upcomingInterviews.map((interview) => (
                <Card key={interview._id} className="border-none shadow-sm bg-white dark:bg-[#161B2C]">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-6">
                        <div className="text-center min-w-[80px]">
                          <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                            {new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            {new Date(interview.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="h-10 w-[1px] bg-slate-100 dark:bg-slate-800 hidden md:block"></div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            {interview.candidateId?.fullName || "Candidate"}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Interviewing for <span className="font-semibold text-slate-700 dark:text-slate-300">{interview.jobId?.title}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 px-4 text-xs font-bold shadow-md shadow-indigo-500/10">
                          Start Interview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-3 text-xs font-bold border-slate-200 dark:border-slate-700"
                          onClick={() => {
                            setSelectedInterview(interview);
                            setNewScheduleDate(new Date(interview.scheduledAt).toISOString().slice(0, 16));
                            setRescheduleDialogOpen(true);
                          }}
                        >
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="text-center py-10 bg-white dark:bg-[#161B2C] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 italic">No interviews scheduled for today</p>
                </div>
              )}
            </div>

            {/* ⚡ Pipeline Summary */}
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-indigo-600" />
                Pipeline Summary
              </h2>
              <div className="bg-white dark:bg-[#161B2C] p-6 rounded-2xl shadow-sm border-none">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Applied</span>
                    <span className="text-2xl font-bold dark:text-white">{stats?.applied || 0}</span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 hidden sm:block"></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider">In Progress</span>
                    <span className="text-2xl font-bold dark:text-white">{stats?.inProgress || 0}</span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 hidden sm:block"></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Selected</span>
                    <span className="text-2xl font-bold dark:text-white">{stats?.selected || 0}</span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 hidden sm:block"></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Rejected</span>
                    <span className="text-2xl font-bold dark:text-white">{stats?.rejected || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 📋 Recent Activity Side List */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold dark:text-white">📋 Recent Applications</h2>
              <Button variant="link" size="sm" className="text-indigo-600 p-0 h-auto font-semibold">
                See all
              </Button>
            </div>
            <Card className="border-none shadow-sm bg-white dark:bg-[#161B2C]">
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentApps.slice(0, 5).map((app) => (
                    <div 
                      key={app._id} 
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-center justify-between"
                      onClick={() => (window.location.href = `/company/job/${app.jobId._id}/${app._id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xs">
                          {app.candidateId?.fullName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                            {app.candidateId?.fullName || "Candidate"}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tight mt-0.5">
                            {app.jobId?.title || "Job Title"}
                            {app.status && ` • ${app.status}`}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                    </div>
                  ))}
                  {recentApps.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-sm text-slate-500 italic">No applications yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notification Alerts */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4 dark:text-white">🔔 Recent Alerts</h2>
              <div className="space-y-3">
                {recentApps.length > 0 ? (
                  <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1 uppercase tracking-tighter">System</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      You have <span className="font-bold">{recentApps.length}</span> recent applications to review.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-tighter">Activity</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">No new alerts. Post a job to start receiving applications.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#161B2C] border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-white">Reschedule Interview</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="new-date" className="text-sm font-medium dark:text-slate-300">
                New Date and Time
              </label>
              <input
                id="new-date"
                type="datetime-local"
                className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {rescheduling ? "Rescheduling..." : "Confirm Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyDashboard;
