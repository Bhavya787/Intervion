import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  FileText,
  Play,
  Pause,
  Mic,
  MicOff,
  Send,
  Camera,
  CameraOff,
} from "lucide-react";
import ChatWindow from "./ChatWindow";

const cardClass =
  "rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#1e293b]";

const textareaClass =
  "resize-none rounded-lg border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-blue-500/30 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-50 dark:placeholder:text-stone-500";

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult:
    | ((e: { resultIndex: number; results: SpeechRecognitionResultList }) => void)
    | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type InterviewState = {
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number;
  isRecording: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  answer: string;
  question: string;
  chatHistory: {
    type: "question" | "answer";
    content: string;
    timestamp: string;
  }[];
};

type PracticeInterviewProps = {
  setupData: { role: string; roundType: string; topic?: string };
  interviewState: InterviewState;
  setInterviewState: React.Dispatch<React.SetStateAction<InterviewState>>;
  handleAnswerSubmit: () => void | Promise<void>;
  formatTime: (seconds: number) => string;
  toast: (props: {
    title?: string;
    description?: string;
    variant?: "default" | "destructive";
  }) => void;
};

const PracticeInterview = ({
  setupData,
  interviewState,
  setInterviewState,
  handleAnswerSubmit,
  formatTime,
  toast,
}: PracticeInterviewProps) => {
  const currentQuestion = interviewState.question;
  const isLastQuestion =
    interviewState.currentQuestion > interviewState.totalQuestions;
  const [fullTranscript, setFullTranscript] = useState("");
  const [speaking, setSpeaking] = useState({
    ai: false,
    candidate: false,
  });

  const SR =
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance })
      .SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance })
      .webkitSpeechRecognition;

  let recognition: SpeechRecognitionInstance | null = null;

  if (SR) {
    recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
  }

  const toggleMic = () => {
    if (!recognition) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not available in this browser.",
        variant: "destructive",
      });
      return;
    }

    if (interviewState.isMicOn) {
      recognition.stop();

      setInterviewState((prev) => ({
        ...prev,
        isMicOn: false,
        answer: fullTranscript.trim(),
      }));

      if (fullTranscript.trim()) {
        handleAnswerSubmit();
      }

      setFullTranscript("");
    } else {
      setFullTranscript("");
      recognition.start();

      recognition.onresult = (event) => {
        let newTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            newTranscript += event.results[i][0].transcript;
          }
        }

        if (newTranscript) {
          setFullTranscript((prev) => (prev + " " + newTranscript).trim());
          setInterviewState((prev) => ({
            ...prev,
            answer: (prev.answer + " " + newTranscript).trim(),
          }));
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        toast({
          title: "Mic error",
          description: event.error,
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        if (interviewState.isMicOn) recognition?.start();
      };

      setInterviewState((prev) => ({ ...prev, isMicOn: true }));
    }
  };

  useEffect(() => {
    if (interviewState.question) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(interviewState.question);
      utterance.lang = "en-US";
      utterance.rate = 1;
      utterance.pitch = 1.2;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find((v) =>
        v.name.toLowerCase().includes("female")
      );
      if (femaleVoice) utterance.voice = femaleVoice;

      utterance.onstart = () => setSpeaking((prev) => ({ ...prev, ai: true }));
      utterance.onend = () => setSpeaking((prev) => ({ ...prev, ai: false }));

      window.speechSynthesis.speak(utterance);
    }
  }, [interviewState.question]);

  useEffect(() => {
    if (interviewState.isMicOn) {
      setSpeaking((prev) => ({ ...prev, candidate: true }));
    } else {
      setSpeaking((prev) => ({ ...prev, candidate: false }));
    }
  }, [interviewState.isMicOn]);

  return (
    <div className="w-full pb-8">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid min-h-[calc(100vh-6rem)] grid-cols-1 gap-4 lg:grid-cols-12">
          <Card className={`${cardClass} lg:col-span-3`}>
            <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Role
                </Label>
                <p className="text-sm text-slate-900 dark:text-white">
                  {setupData.role}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Round
                </Label>
                <Badge
                  variant="secondary"
                  className="mt-1 border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  {setupData.roundType}
                </Badge>
              </div>
              <Separator className="bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Progress
                  </Label>
                  <span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">
                    {Math.min(
                      interviewState.currentQuestion,
                      interviewState.totalQuestions
                    )}
                    /{interviewState.totalQuestions}
                  </span>
                </div>
                <Progress
                  value={
                    (Math.min(
                      interviewState.currentQuestion,
                      interviewState.totalQuestions
                    ) /
                      interviewState.totalQuestions) *
                    100
                  }
                  className="h-2 bg-blue-100 dark:bg-blue-950/50 [&>div]:bg-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-blue-600 dark:text-blue-400" />
                <span className="font-mono text-sm text-slate-900 dark:text-white">
                  {formatTime(interviewState.timeRemaining)}
                </span>
              </div>
              <Separator className="bg-slate-200 dark:bg-slate-800" />
              <div>
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Current prompt
                </Label>
                <div className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-slate-200/80 bg-slate-50/80 p-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100">
                  {isLastQuestion ? "Wrapping up…" : currentQuestion}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 lg:col-span-6">
            <Card className={cardClass}>
              <CardContent className="grid grid-cols-1 justify-items-center gap-6 p-4 sm:grid-cols-2">
                <div
                  className={`flex flex-col items-center rounded-xl border-2 p-2 transition-all ${
                    speaking.ai
                      ? "border-blue-500 shadow-lg shadow-blue-500/20"
                      : "border-transparent"
                  }`}
                >
                  <div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-xl bg-slate-200 shadow-inner dark:bg-slate-800">
                    <img
                      src="https://images.unsplash.com/photo-1698047681452-08eba22d0c64?w=600&auto=format&fit=crop&q=60"
                      alt="AI interviewer"
                      className="size-full object-cover"
                    />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                    AI interviewer
                  </p>
                </div>

                <div
                  className={`flex flex-col items-center rounded-xl border-2 p-2 transition-all ${
                    speaking.candidate
                      ? "border-sky-500 shadow-lg shadow-sky-500/20"
                      : "border-transparent"
                  }`}
                >
                  <div className="relative flex h-48 w-48 items-center justify-center overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
                    {interviewState.isCameraOn ? (
                      <video
                        autoPlay
                        muted
                        className="size-full object-cover"
                        ref={(el) => {
                          if (
                            el &&
                            interviewState.isCameraOn &&
                            navigator.mediaDevices
                          ) {
                            navigator.mediaDevices
                              .getUserMedia({ video: true })
                              .then((stream) => {
                                el.srcObject = stream;
                              })
                              .catch(() => {});
                          }
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        <CameraOff className="mx-auto mb-2 size-8 text-slate-400 dark:text-slate-500" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Camera off
                        </p>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-2 right-2 rounded-lg border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
                      onClick={() =>
                        setInterviewState((prev) => ({
                          ...prev,
                          isCameraOn: !prev.isCameraOn,
                        }))
                      }
                    >
                      {interviewState.isCameraOn ? (
                        <CameraOff className="size-3.5" />
                      ) : (
                        <Camera className="size-3.5" />
                      )}
                    </Button>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                    You
                  </p>
                </div>
              </CardContent>
            </Card>

            {!isLastQuestion && (
              <Card className={cardClass}>
                <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
                  <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-base font-semibold text-slate-900 dark:text-white">
                    <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <FileText className="size-5" />
                      Your answer
                    </span>
                    <Button
                      variant={
                        interviewState.isRecording ? "destructive" : "outline"
                      }
                      size="sm"
                      className="rounded-lg"
                      onClick={() =>
                        setInterviewState((prev) => ({
                          ...prev,
                          isRecording: !prev.isRecording,
                        }))
                      }
                    >
                      {interviewState.isRecording ? (
                        <Pause className="mr-1 size-3.5" />
                      ) : (
                        <Play className="mr-1 size-3.5" />
                      )}
                      {interviewState.isRecording ? "Recording" : "Record"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <Textarea
                    placeholder="Type your answer or use the microphone…"
                    value={interviewState.answer}
                    onChange={(e) =>
                      setInterviewState((prev) => ({
                        ...prev,
                        answer: e.target.value,
                      }))
                    }
                    rows={6}
                    className={textareaClass}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
                        onClick={toggleMic}
                      >
                        {interviewState.isMicOn ? (
                          <Mic className="size-3.5" />
                        ) : (
                          <MicOff className="size-3.5" />
                        )}
                      </Button>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Mic {interviewState.isMicOn ? "on" : "off"}
                      </span>
                    </div>
                    <Button
                      onClick={handleAnswerSubmit}
                      className="rounded-xl bg-gradient-to-r from-blue-500 to-sky-600 text-white shadow-md shadow-blue-500/20 dark:from-blue-600 dark:to-sky-700"
                      disabled={!interviewState.answer.trim()}
                    >
                      <Send className="mr-2 size-3.5" />
                      Submit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <ChatWindow chatHistory={interviewState.chatHistory} />
        </div>
      </div>
    </div>
  );
};

export default PracticeInterview;
