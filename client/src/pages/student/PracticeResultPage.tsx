import { useLocation, useNavigate } from "react-router-dom";
import PracticeResults from "@/components/practice/PracticeResults";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";

const PracticeResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const interview = location.state?.interview as Record<string, unknown> | undefined;

  if (!interview) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-[#0f172a]">
        <Navigation />
        <div className="flex max-w-md flex-col items-center gap-4 py-16">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            No interview data found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Start a practice session from your dashboard to see results here.
          </p>
          <Button
            className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => navigate("/student/dashboard")}
          >
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
      <Navigation />
      <PracticeResults interview={interview} navigate={navigate} />
    </div>
  );
};

export default PracticeResultPage;
