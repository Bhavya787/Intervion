import { useState } from "react";
import Navigation from "@/components/Navigation";
import PracticeSetup from "@/components/practice/PracticeSetup";
import PracticeInterview from "@/components/practice/PracticeInterview";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axiosInstance";
import PracticeResults from "@/components/practice/PracticeResults";

type Step = "setup" | "interview" | "results";

const pageShell = "min-h-screen bg-slate-50 dark:bg-[#0f172a]";

const Practice = () => {
  const [currentStep, setCurrentStep] = useState<Step>("setup");
  const [setupData, setSetupData] = useState({
    resume: "",
    role: "",
    difficulty: "",
    roundType: "",
    topic: "",
  });
  const [interviewResults, setInterviewResults] = useState<Record<
    string,
    unknown
  > | null>(null);

  const [interviewState, setInterviewState] = useState({
    currentQuestion: 1,
    totalQuestions: 5,
    timeRemaining: 1800,
    isRecording: false,
    isCameraOn: true,
    isMicOn: false,
    answer: "",
    question: "",
    chatHistory: [] as {
      type: "question" | "answer";
      content: string;
      timestamp: string;
    }[],
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSetupSubmit = async () => {
    if (
      !setupData.role ||
      !setupData.difficulty ||
      !setupData.roundType ||
      !setupData.resume
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await axiosInstance.post("/interview/start", {
        role: setupData.role,
        resume: setupData.resume,
        roundType: setupData.roundType,
        topic: setupData.topic,
        difficulty: setupData.difficulty,
      });

      const firstQuestion = res.data.message;

      setCurrentStep("interview");

      setInterviewState((prev) => ({
        ...prev,
        question: firstQuestion,
        chatHistory: [
          {
            type: "question",
            content: firstQuestion,
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
      }));
    } catch (error: unknown) {
      console.error("Error starting interview:", error);
      const ax = error as {
        response?: { status?: number; data?: { error?: string } };
      };
      const msg =
        ax.response?.data?.error ||
        (ax.response?.status === 429
          ? "Too many requests. Wait a minute and try again."
          : undefined);
      toast({
        title: ax.response?.status === 429 ? "AI rate limit" : "Error",
        description:
          msg || "Failed to start interview. Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  const handleAnswerSubmit = async () => {
    if (!interviewState.answer.trim()) {
      toast({
        title: "Answer Required",
        description: "Please provide an answer before continuing",
        variant: "destructive",
      });
      return;
    }

    const updatedChatHistory = [
      ...interviewState.chatHistory,
      {
        type: "answer" as const,
        content: interviewState.answer,
        timestamp: new Date().toLocaleTimeString(),
      },
    ];

    try {
      if (interviewState.currentQuestion >= interviewState.totalQuestions) {
        const res = await axiosInstance.post(
          "/interview/conclude",
          {
            history: updatedChatHistory,
            resumeText: setupData.resume,
            roleSummary: setupData.role,
            roundType: setupData.roundType,
            customTopic: setupData.topic,
            difficulty: setupData.difficulty,
            typeOfInterview: "practice",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const { interview } = res.data;

        setInterviewResults(interview as Record<string, unknown>);
        setCurrentStep("results");
      } else {
        const res = await axiosInstance.post("/interview/respond", {
          chatHistory: updatedChatHistory,
          answer: interviewState.answer,
          resume: setupData.resume,
          role: setupData.role,
          roundType: setupData.roundType,
          topic: setupData.topic,
          difficulty: setupData.difficulty,
        });

        const nextQuestion = res.data.message;

        updatedChatHistory.push({
          type: "question",
          content: nextQuestion,
          timestamp: new Date().toLocaleTimeString(),
        });

        setInterviewState((prev) => ({
          ...prev,
          chatHistory: updatedChatHistory,
          currentQuestion: prev.currentQuestion + 1,
          question: nextQuestion,
          answer: "",
        }));
      }
    } catch (error: unknown) {
      console.error("Error in interview flow:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (currentStep === "setup") {
    return (
      <div className={pageShell}>
        <Navigation />
        <PracticeSetup
          setupData={setupData}
          setSetupData={setSetupData}
          handleSetupSubmit={handleSetupSubmit}
          navigate={navigate}
        />
      </div>
    );
  }

  if (currentStep === "interview") {
    return (
      <div className={pageShell}>
        <PracticeInterview
          setupData={setupData}
          interviewState={interviewState}
          setInterviewState={setInterviewState}
          handleAnswerSubmit={handleAnswerSubmit}
          formatTime={formatTime}
          toast={toast}
        />
      </div>
    );
  }

  return (
    <div className={pageShell}>
      <Navigation />
      {interviewResults ? (
        <PracticeResults interview={interviewResults} navigate={navigate} />
      ) : (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      )}
    </div>
  );
};

export default Practice;
