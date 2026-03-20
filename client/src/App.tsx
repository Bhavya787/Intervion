import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentDashboard from "./pages/student/Dashboard";
import StudentPractice from "./pages/student/Practice";
import CompanyDashboard from "./pages/company/Dashboard";
import PracticeResultPage from "./pages/student/PracticeResultPage";
import CompanyJobForm from "./pages/company/CompanyJobForm";
import StudentJobsPage from "./pages/student/StudentsJobsPage";
import StudentProfile from "./pages/student/StudentProfile";
import JobDetailPage from "./pages/student/JobDetailPage";
import CompanyJobsPage from "./pages/company/CompanyJobsPage";
import CompanyJobApplicationsPage from "./pages/company/CompanyJobApplicationsPage";
import ApplicationDetailPage from "./pages/company/ApplicationDetailPage";
import StudentApplicationsPage from "./pages/student/StudentApplicationsPage";
import StudentApplicationDetailPage from "./pages/student/StudentApplicationDetailPage";
import StudyRoomsPage from "./pages/student/StudyRoomsPage";
import RoomDetailPage from "./pages/student/RoomDetailPage";
import MCQPractice from "./pages/student/MCQPractice";
import ProtectedRoute from "./components/ProtectedRoute";

// inside <Routes>

const queryClient = new QueryClient();

const App = () => (
  <div className="min-h-screen dark:bg-[#0f172a] dark:text-gray-100">
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="interviewpro-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/practice"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentPractice />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["company"]}>
                    <CompanyDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/practice-result"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PracticeResultPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/job/new"
                element={
                  <ProtectedRoute allowedRoles={["company"]}>
                    <CompanyJobForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/jobs"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/rooms"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudyRoomsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/mcq"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <MCQPractice />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/rooms/:id"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <RoomDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/jobs/:id"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <JobDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/jobs"
                element={
                  <ProtectedRoute allowedRoles={["company"]}>
                    <CompanyJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/job/:id"
                element={
                  <ProtectedRoute allowedRoles={["company"]}>
                    <CompanyJobApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/job/:jobId/:applicationId"
                element={
                  <ProtectedRoute allowedRoles={["company"]}>
                    <ApplicationDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/applications"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/application/:id"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentApplicationDetailPage />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </div>
);

export default App;
