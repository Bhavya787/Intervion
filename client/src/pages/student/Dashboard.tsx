import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart,
  Play,
  TrendingUp,
  Clock,
  Briefcase,
  Users,
  ChevronRight,
  Plus,
  MoreVertical,
  Check,
  CalendarDays,
  Brain,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const [intRes, meRes] = await Promise.all([
        axiosInstance.get("/interview/mine", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (Array.isArray(intRes.data)) {
        setInterviews(intRes.data);
      } else if (Array.isArray(intRes.data.data)) {
        setInterviews(intRes.data.data);
      }
      
      setUserName(meRes.data?.user?.fullName || "Student");
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
      fetchData(); // Refresh data
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

  // 📊 Stats
  const total = interviews.length;
  const passed = interviews.filter((i) => i.result === "success").length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const pending = interviews.filter((i) => !i.result || i.result === "Quit").length;

  const upcomingInterviews = interviews.filter(i => 
    i.scheduledAt && new Date(i.scheduledAt) > new Date()
  ).sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());

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
        {/* 👋 Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              👋 Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{userName}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Here's what's happening with your interview preparations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/student/practice">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 gap-2">
                <Play className="h-4 w-4 fill-current" />
                Practice Interview
              </Button>
            </Link>
          </div>
        </div>

        {/* 📊 Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="border-none shadow-sm bg-white dark:bg-[#161B2C]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Interviews</p>
                  <p className="text-3xl font-bold mt-1 dark:text-white">{total}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <BarChart size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-[#161B2C]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pass Rate</p>
                  <p className="text-3xl font-bold mt-1 text-green-600 dark:text-green-400">{passRate}%</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                  <TrendingUp size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-[#161B2C]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg Score</p>
                  <p className="text-3xl font-bold mt-1 text-blue-600 dark:text-blue-400">82%</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <CheckCircle size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-[#161B2C]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending</p>
                  <p className="text-3xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">{pending}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                  <Clock size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ⏰ Upcoming Schedule */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Upcoming Schedule (Next 7 days)
              </h2>
            </div>
            
            <div className="space-y-4">
              {upcomingInterviews.length > 0 ? upcomingInterviews.map((interview) => (
                <Card key={interview._id} className="border-none shadow-sm bg-white dark:bg-[#161B2C]">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400">
                          <span className="text-[10px] font-bold uppercase">
                            {new Date(interview.scheduledAt!).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-lg font-extrabold leading-none">
                            {new Date(interview.scheduledAt!).toLocaleDateString('en-US', { day: '2-digit' })}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                              {new Date(interview.scheduledAt!).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <Badge variant="outline" className="text-[10px] h-5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border-none">
                              {interview.type === "company" ? "Live Interview" : "Practice"}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-slate-900 dark:text-white mt-0.5">
                            {interview.role || "Technical Interview"} @ {interview.companyName || "Intervion"}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          className="bg-indigo-600 hover:bg-indigo-700 h-8 px-4 text-xs font-bold shadow-md shadow-indigo-500/10"
                          onClick={() => navigate(interview.type === 'company' ? `/interview/${interview._id}` : `/student/practice`)}
                        >
                          Join
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-3 text-xs font-bold border-slate-200 dark:border-slate-700"
                          onClick={() => {
                            setSelectedInterview(interview);
                            setNewScheduleDate(new Date(interview.scheduledAt!).toISOString().slice(0, 16));
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
                <div className="text-center py-10 bg-white dark:bg-[#161B2C] rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No interviews scheduled for the next 7 days.</p>
                  <Link to="/student/practice">
                    <Button variant="link" className="text-indigo-600 text-xs font-bold mt-1">
                      Start a practice session
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* 🚀 Quick Actions */}
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4 dark:text-white">🚀 Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/student/practice" className="block">
                  <Card className="border-none shadow-sm bg-white dark:bg-[#161B2C] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center p-6">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-3">
                      <Play size={20} className="fill-current" />
                    </div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">AI Interview</span>
                  </Card>
                </Link>
                <Link to="/student/mcq" className="block">
                  <Card className="border-none shadow-sm bg-white dark:bg-[#161B2C] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center p-6">
                    <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-3">
                      <Brain size={20} />
                    </div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">MCQ Practice</span>
                  </Card>
                </Link>
                <Link to="/student/rooms" className="block">
                  <Card className="border-none shadow-sm bg-white dark:bg-[#161B2C] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center p-6">
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center mb-3">
                      <Users size={20} />
                    </div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Study Room</span>
                  </Card>
                </Link>
                <Link to="/student/jobs" className="block">
                  <Card className="border-none shadow-sm bg-white dark:bg-[#161B2C] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center p-6">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
                      <Briefcase size={20} />
                    </div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">View Jobs</span>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Notification Center */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4 dark:text-white">🔔 Recent Alerts</h2>
              <div className="space-y-3">
                {interviews.length > 0 ? (
                  <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1 uppercase tracking-tighter">System</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      You have completed <span className="font-bold">{interviews.length}</span> total practice sessions. Keep it up!
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-tighter">Activity</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">Welcome to Intervion! Start your first AI practice session today.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 📋 Recent Interviews Side List */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold dark:text-white">📋 Recent Activity</h2>
              <Button variant="link" size="sm" className="text-indigo-600 p-0 h-auto font-semibold">
                See all
              </Button>
            </div>
            <Card className="border-none shadow-sm bg-white dark:bg-[#161B2C]">
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {interviews.slice(0, 5).map((i) => (
                    <div 
                      key={i._id} 
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-center justify-between"
                      onClick={() => navigate("/student/practice-result", { state: { interview: i } })}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          i.result === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400' :
                          i.result === 'failure' ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400'
                        }`}>
                          {i.result === 'success' ? <CheckCircle size={16} /> : 
                           i.result === 'failure' ? <XCircle size={16} /> : 
                           <AlertCircle size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                            {i.type === 'practice' ? 'Practice Session' : 'Company Interview'}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tight mt-0.5">
                            {new Date(i.createdAt).toLocaleDateString()} • {i.difficulty}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                    </div>
                  ))}
                  {interviews.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-sm text-slate-500 italic">No recent activity yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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

export default StudentDashboard;
