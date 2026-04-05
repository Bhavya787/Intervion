import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  TrendingUp,
  Play,
  Briefcase,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import type { NavigateFunction } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const cardClass =
  "rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#1e293b]";

type ChatEntry = {
  type: string;
  content: string;
  timestamp: string;
};

type PracticeResultsProps = {
  interview: Record<string, unknown>;
  navigate: NavigateFunction;
};

const PracticeResults = ({ interview, navigate }: PracticeResultsProps) => {
  const result = interview.result as string | undefined;
  const isSuccess = result === "success";
  const finalFeedback = (interview.finalFeedback as string) || "";
  const difficulty = (interview.difficulty as string) || "medium";
  const interviewType = interview.type as string | undefined;
  const chatHistory = (interview.chatHistory as ChatEntry[]) || [];
  const feedbacks = (interview.feedbacks as string[]) || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-wide text-slate-900 dark:text-white">
          Interview results
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          {interviewType === "practice"
            ? "Practice session summary"
            : "Session summary"}
        </p>
      </div>

      <Card className={`${cardClass} mb-8`}>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            Final feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300">
            {finalFeedback || "No summary provided."}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className={cardClass}>
          <CardHeader className="border-b border-slate-100 text-center dark:border-slate-800">
            <CardTitle className="flex items-center justify-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <Star className="size-5 text-sky-500 dark:text-sky-400" />
              Outcome
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 text-center">
            <div
              className={`text-4xl font-bold ${
                isSuccess
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {isSuccess ? "Pass" : "Needs work"}
            </div>
            <Badge
              className={
                isSuccess
                  ? "border-0 bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200"
                  : "border-0 bg-rose-100 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200"
              }
            >
              {difficulty.toUpperCase()} level
            </Badge>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Next steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <Button
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-sky-600 text-white shadow-md shadow-blue-500/20 dark:from-blue-600 dark:to-sky-700"
              onClick={() => navigate("/student/practice")}
            >
              <Play className="mr-2 size-4" />
              Practice again
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl border-slate-200 text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800/80"
              onClick={() => navigate("/student/jobs")}
            >
              <Briefcase className="mr-2 size-4" />
              Browse jobs
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
              onClick={() => navigate("/student/dashboard")}
            >
              <ArrowLeft className="mr-2 size-4" />
              Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className={`${cardClass} mt-8`}>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            Transcript
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 space-y-3 overflow-y-auto pt-6">
          {chatHistory.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No messages recorded.
            </p>
          ) : (
            chatHistory.map((entry, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-3 ${
                  entry.type === "question"
                    ? "border-blue-200/80 bg-blue-50/90 text-slate-800 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-slate-100"
                    : "border-emerald-200/80 bg-emerald-50/80 text-slate-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-slate-100"
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <MessageSquare className="size-3.5 opacity-70" />
                  <span className="text-xs opacity-70">{entry.timestamp}</span>
                </div>
                <p className="text-sm">{entry.content}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {feedbacks.length > 0 && (
        <Card className={`${cardClass} mt-8`}>
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-600 dark:text-blue-400">
              <TrendingUp className="size-5" />
              Detailed feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Carousel className="w-full">
              <CarouselContent>
                {feedbacks.map((fb, i) => (
                  <CarouselItem key={i} className="basis-full">
                    <Card className="rounded-xl border border-blue-200/60 bg-blue-50/80 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/25">
                      <CardHeader>
                        <CardTitle className="text-base text-blue-800 dark:text-blue-200">
                          Part {i + 1}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                          {fb}
                        </p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="mt-4 flex justify-center gap-2">
                <CarouselPrevious />
                <CarouselNext />
              </div>
            </Carousel>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PracticeResults;
