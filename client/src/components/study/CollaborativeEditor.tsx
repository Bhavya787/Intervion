import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import axiosInstance from "@/utils/axiosInstance";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  FileQuestion,
  Loader2,
  Play,
  RefreshCcw,
  Send,
  Sparkles,
} from "lucide-react";

type SupportedLanguage = "javascript" | "python" | "java" | "cpp";
type Difficulty = "Easy" | "Medium" | "Hard" | "Expert";

type CodingQuestion = {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  topic: string;
  constraints: string[];
  sampleInput: string;
  sampleOutput: string;
  starterCode?: Partial<Record<SupportedLanguage, string>>;
};

type ExecutionResult = {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  status?: { id?: number; description?: string };
};

type SubmissionResult = {
  allPassed: boolean;
  results: Array<{ input: string; passed: boolean }>;
};

type CodeSessionUpdate = {
  questions?: CodingQuestion[];
  currentQuestionIndex?: number;
  questionTopic?: string;
  questionDifficulty?: Difficulty;
};

type CollaborativeEditorProps = {
  roomId: string;
  socket: Socket | null;
  initialCode?: string;
  initialLanguage?: SupportedLanguage;
  initialQuestions?: CodingQuestion[];
  initialCurrentQuestionIndex?: number;
  initialQuestionTopic?: string;
  initialQuestionDifficulty?: Difficulty;
  defaultTopic?: string;
  onStateChange?: (hasChanges: boolean) => void;
};

const LANGUAGE_MAP: Record<SupportedLanguage, { label: string; defaultCode: string }> = {
  javascript: {
    label: "JavaScript",
    defaultCode: "// Start coding together...\nfunction solution() {\n  \n}\n",
  },
  python: {
    label: "Python",
    defaultCode: "# Start coding together...\ndef solution():\n    pass\n",
  },
  java: {
    label: "Java",
    defaultCode:
      "public class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n",
  },
  cpp: {
    label: "C++",
    defaultCode:
      "#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n",
  },
};

function normalizeLanguage(language?: string): SupportedLanguage {
  return language === "python" ||
    language === "java" ||
    language === "cpp" ||
    language === "javascript"
    ? language
    : "javascript";
}

function clampIndex(index: number, count: number) {
  if (count <= 0) return 0;
  return Math.min(Math.max(index, 0), count - 1);
}

function starterFor(
  question: CodingQuestion | null,
  language: SupportedLanguage
) {
  return question?.starterCode?.[language] ?? LANGUAGE_MAP[language].defaultCode;
}

const CollaborativeEditor = ({
  roomId,
  socket,
  initialCode,
  initialLanguage = "javascript",
  initialQuestions = [],
  initialCurrentQuestionIndex = 0,
  initialQuestionTopic = "",
  initialQuestionDifficulty = "Medium",
  defaultTopic = "",
  onStateChange,
}: CollaborativeEditorProps) => {
  const { toast } = useToast();
  const normalizedInitialLanguage = normalizeLanguage(initialLanguage);
  const [language, setLanguage] =
    useState<SupportedLanguage>(normalizedInitialLanguage);
  const [questions, setQuestions] = useState<CodingQuestion[]>(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    clampIndex(initialCurrentQuestionIndex, initialQuestions.length)
  );
  const [questionTopic, setQuestionTopic] = useState(initialQuestionTopic || defaultTopic);
  const [questionDifficulty, setQuestionDifficulty] =
    useState<Difficulty>(initialQuestionDifficulty);
  const [code, setCode] = useState(
    initialCode ||
      starterFor(
        initialQuestions[clampIndex(initialCurrentQuestionIndex, initialQuestions.length)] ??
          null,
        normalizedInitialLanguage
      )
  );
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  const codeRef = useRef(code);
  const languageRef = useRef(language);
  const questionsRef = useRef(questions);
  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  const questionTopicRef = useRef(questionTopic);
  const questionDifficultyRef = useRef(questionDifficulty);

  const currentQuestion =
    questions[clampIndex(currentQuestionIndex, questions.length)] ?? null;

  useEffect(() => {
    codeRef.current = code;
    languageRef.current = language;
    questionsRef.current = questions;
    currentQuestionIndexRef.current = currentQuestionIndex;
    questionTopicRef.current = questionTopic;
    questionDifficultyRef.current = questionDifficulty;
  }, [code, currentQuestionIndex, language, questionDifficulty, questionTopic, questions]);

  useEffect(() => {
    setQuestions(initialQuestions);
    setCurrentQuestionIndex(
      clampIndex(initialCurrentQuestionIndex, initialQuestions.length)
    );
    setQuestionTopic(initialQuestionTopic || defaultTopic);
    setQuestionDifficulty(initialQuestionDifficulty);
    setLanguage(normalizeLanguage(initialLanguage));
    setCode(
      initialCode ||
        starterFor(
          initialQuestions[clampIndex(initialCurrentQuestionIndex, initialQuestions.length)] ??
            null,
          normalizeLanguage(initialLanguage)
        )
    );
  }, [
    defaultTopic,
    initialCode,
    initialCurrentQuestionIndex,
    initialLanguage,
    initialQuestionDifficulty,
    initialQuestionTopic,
    initialQuestions,
  ]);

  useEffect(() => {
    if (!socket) return;

    const handleCodeUpdate = (data: {
      code?: string;
      language?: SupportedLanguage;
    }) => {
      if (data.code !== undefined && data.code !== codeRef.current) {
        setCode(data.code);
      }
      if (data.language && data.language !== languageRef.current) {
        setLanguage(data.language);
      }
    };

    const handleSessionUpdate = (session: CodeSessionUpdate) => {
      if (session.questions) {
        setQuestions(session.questions);
      }
      if (typeof session.currentQuestionIndex === "number") {
        setCurrentQuestionIndex(
          clampIndex(
            session.currentQuestionIndex,
            session.questions?.length ?? questionsRef.current.length
          )
        );
      }
      if (typeof session.questionTopic === "string") {
        setQuestionTopic(session.questionTopic);
      }
      if (session.questionDifficulty) {
        setQuestionDifficulty(session.questionDifficulty);
      }
      setExecutionResult(null);
      setSubmissionResult(null);
    };

    const handleClear = (data: { defaultCode?: string }) => {
      const nextCode =
        data.defaultCode ||
        starterFor(
          questionsRef.current[
            clampIndex(currentQuestionIndexRef.current, questionsRef.current.length)
          ] ?? null,
          languageRef.current
        );
      setCode(nextCode);
      setExecutionResult(null);
      setSubmissionResult(null);
    };

    socket.on("code-update", handleCodeUpdate);
    socket.on("code-session-update", handleSessionUpdate);
    socket.on("clear-code-editor", handleClear);

    return () => {
      socket.off("code-update", handleCodeUpdate);
      socket.off("code-session-update", handleSessionUpdate);
      socket.off("clear-code-editor", handleClear);
    };
  }, [socket]);

  useEffect(() => {
    const roomWindow = window as Window & {
      getCurrentCodeState?: () => {
        code: string;
        language: SupportedLanguage;
        questions: CodingQuestion[];
        currentQuestionIndex: number;
        questionTopic: string;
        questionDifficulty: Difficulty;
      };
      clearCodeEditor?: () => void;
    };

    roomWindow.getCurrentCodeState = () => ({
      code: codeRef.current,
      language: languageRef.current,
      questions: questionsRef.current,
      currentQuestionIndex: currentQuestionIndexRef.current,
      questionTopic: questionTopicRef.current,
      questionDifficulty: questionDifficultyRef.current,
    });

    roomWindow.clearCodeEditor = () => {
      const nextCode = starterFor(
        questionsRef.current[
          clampIndex(currentQuestionIndexRef.current, questionsRef.current.length)
        ] ?? null,
        languageRef.current
      );
      setCode(nextCode);
      socket?.emit("code-update", {
        roomId,
        code: nextCode,
        language: languageRef.current,
      });
      setExecutionResult(null);
      setSubmissionResult(null);
      onStateChange?.(true);
    };

    return () => {
      delete roomWindow.getCurrentCodeState;
      delete roomWindow.clearCodeEditor;
    };
  }, [onStateChange, roomId, socket]);

  const broadcastSession = (
    nextQuestions: CodingQuestion[],
    nextIndex: number,
    nextTopic: string,
    nextDifficulty: Difficulty
  ) => {
    socket?.emit("code-session-update", {
      roomId,
      session: {
        questions: nextQuestions,
        currentQuestionIndex: nextIndex,
        questionTopic: nextTopic,
        questionDifficulty: nextDifficulty,
      },
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    setCode(value);
    socket?.emit("code-update", { roomId, code: value, language });
    onStateChange?.(true);
  };

  const handleLanguageChange = (value: string) => {
    const nextLanguage = value as SupportedLanguage;
    const nextCode = starterFor(currentQuestion, nextLanguage);
    setLanguage(nextLanguage);
    setCode(nextCode);
    setExecutionResult(null);
    setSubmissionResult(null);
    socket?.emit("code-update", { roomId, code: nextCode, language: nextLanguage });
    onStateChange?.(true);
  };

  const handleQuestionSelect = (index: number) => {
    const nextQuestion = questions[index] ?? null;
    const nextCode = starterFor(nextQuestion, language);
    setCurrentQuestionIndex(index);
    setCode(nextCode);
    setExecutionResult(null);
    setSubmissionResult(null);
    socket?.emit("code-update", { roomId, code: nextCode, language });
    broadcastSession(questions, index, questionTopic, questionDifficulty);
    onStateChange?.(true);
  };

  const handleResetCode = () => {
    const nextCode = starterFor(currentQuestion, language);
    setCode(nextCode);
    setExecutionResult(null);
    setSubmissionResult(null);
    socket?.emit("code-update", { roomId, code: nextCode, language });
    onStateChange?.(true);
  };

  const handleGenerateQuestions = async () => {
    const trimmedTopic = questionTopic.trim();

    if (!trimmedTopic) {
      toast({
        title: "Topic needed",
        description: "Add a topic before generating coding questions.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingQuestions(true);
    setExecutionResult(null);
    setSubmissionResult(null);

    try {
      const existingRes = await axiosInstance.get(
        `/coding/questions?topic=${encodeURIComponent(
          trimmedTopic
        )}&difficulty=${questionDifficulty}`
      );
      let nextQuestions = Array.isArray(existingRes.data) ? existingRes.data : [];

      if (nextQuestions.length < 2) {
        const generatedRes = await axiosInstance.post("/coding/generate", {
          topic: trimmedTopic,
          difficulty: questionDifficulty,
          count: 3,
        });
        nextQuestions = Array.isArray(generatedRes.data)
          ? generatedRes.data
          : [generatedRes.data];
      }

      if (nextQuestions.length === 0) {
        throw new Error("No coding questions returned.");
      }

      const nextCode = starterFor(nextQuestions[0] ?? null, language);
      setQuestions(nextQuestions);
      setCurrentQuestionIndex(0);
      setCode(nextCode);
      socket?.emit("code-update", { roomId, code: nextCode, language });
      broadcastSession(nextQuestions, 0, trimmedTopic, questionDifficulty);
      onStateChange?.(true);

      toast({
        title: "Questions loaded",
        description: `Loaded ${nextQuestions.length} shared coding questions.`,
      });
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "response" in error
          ? (
              error as {
                response?: { data?: { error?: string } };
              }
            ).response?.data?.error
          : undefined;

      toast({
        title: "Question generation failed",
        description: message || "The room could not load coding questions.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  useEffect(() => {
    if (questions.length > 0 || isGeneratingQuestions) return;
    if (!questionTopic.trim()) return;

    handleGenerateQuestions();
    // We only want the initial room bootstrap behavior here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRunCode = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    setSubmissionResult(null);

    try {
      const response = await axiosInstance.post("/coding/run", {
        source_code: code,
        language,
        stdin: currentQuestion?.sampleInput || "",
      });
      setExecutionResult(response.data);
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "response" in error
          ? (
              error as {
                response?: { data?: { error?: string } };
              }
            ).response?.data?.error
          : undefined;

      toast({
        title: "Execution failed",
        description:
          message || "The online compiler could not run this code right now.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!currentQuestion?._id) {
      toast({
        title: "Pick a question",
        description: "Generate or select a question before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);
    setSubmissionResult(null);

    try {
      const response = await axiosInstance.post("/coding/submit", {
        questionId: currentQuestion._id,
        source_code: code,
        language,
      });
      setSubmissionResult(response.data);
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "response" in error
          ? (
              error as {
                response?: { data?: { error?: string; message?: string } };
              }
            ).response?.data?.error ||
            (
              error as {
                response?: { data?: { error?: string; message?: string } };
              }
            ).response?.data?.message
          : undefined;

      toast({
        title: "Submission failed",
        description:
          message || "The online compiler could not evaluate this submission.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="grid h-[720px] grid-cols-1 overflow-hidden bg-[#0b1220] xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col border-b border-slate-800 bg-[#111827] xl:border-b-0 xl:border-r">
        <div className="space-y-4 border-b border-slate-800 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Coding Room
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                Shared Questions
              </h3>
            </div>
            <Badge className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              Live
            </Badge>
          </div>

          <Input
            value={questionTopic}
            onChange={(event) => setQuestionTopic(event.target.value)}
            placeholder="Question topic, e.g. Graphs"
            className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
          />

          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
            <Select
              value={questionDifficulty}
              onValueChange={(value) => setQuestionDifficulty(value as Difficulty)}
            >
              <SelectTrigger className="border-slate-700 bg-slate-950 text-slate-100">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleGenerateQuestions}
              disabled={isGeneratingQuestions}
              className="gap-2 bg-sky-600 text-white hover:bg-sky-500"
            >
              {isGeneratingQuestions ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {questions.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-6 text-center">
              <FileQuestion className="mb-3 h-8 w-8 text-slate-600" />
              <p className="text-sm font-medium text-slate-200">No questions yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Generate shared problems and solve them together.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {questions.map((question, index) => (
                <button
                  key={question._id || `${question.title}-${index}`}
                  type="button"
                  onClick={() => handleQuestionSelect(index)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition",
                    index === currentQuestionIndex
                      ? "border-sky-500/40 bg-sky-500/10"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                  )}
                >
                  <p className="truncate text-sm font-semibold text-slate-100">
                    {question.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <span>{question.topic}</span>
                    <span>-</span>
                    <span>{question.difficulty}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      <section className="grid min-h-0 grid-cols-1 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="flex min-h-0 flex-col border-b border-slate-800 bg-[#0f172a] xl:border-b-0 xl:border-r">
          <div className="border-b border-slate-800 px-5 py-4">
            {currentQuestion ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border border-sky-500/30 bg-sky-500/10 text-sky-200">
                    {currentQuestion.topic}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
                <h2 className="mt-3 text-xl font-semibold text-white">
                  {currentQuestion.title}
                </h2>
              </>
            ) : (
              <h2 className="text-xl font-semibold text-white">
                Generate a challenge to start coding
              </h2>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {currentQuestion ? (
              <div className="space-y-6 text-sm text-slate-200">
                <div className="prose prose-invert prose-slate max-w-none prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white">
                  <ReactMarkdown>{currentQuestion.description || ""}</ReactMarkdown>
                </div>

                {currentQuestion.constraints?.length > 0 && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Constraints
                    </p>
                    <ul className="space-y-2 text-slate-300">
                      {currentQuestion.constraints.map((constraint, index) => (
                        <li key={`${constraint}-${index}`} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-400" />
                          <span>{constraint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Sample Input
                    </p>
                    <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm text-sky-200">
                      {currentQuestion.sampleInput || "N/A"}
                    </pre>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Sample Output
                    </p>
                    <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm text-emerald-200">
                      {currentQuestion.sampleOutput || "N/A"}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-slate-500">
                Question details will appear here once the room loads a challenge.
              </div>
            )}
          </div>
        </div>

        <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_260px] bg-[#020617]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="h-9 w-[150px] border-slate-700 bg-slate-950 text-slate-100">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LANGUAGE_MAP).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={handleResetCode}
                className="gap-2 border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-900"
              >
                <RefreshCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                variant="outline"
                onClick={handleRunCode}
                disabled={isExecuting}
                className="gap-2 border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-900"
              >
                {isExecuting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
                Run
              </Button>
              <Button
                onClick={handleSubmitCode}
                disabled={isExecuting || !currentQuestion}
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500"
              >
                <Send className="h-4 w-4" />
                Submit
              </Button>
            </div>
          </div>

          <div className="min-h-0">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={code}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>

          <div className="overflow-y-auto border-t border-slate-800 bg-[#020817] p-4">
            {!executionResult && !submissionResult && !isExecuting && (
              <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 text-center">
                <Play className="mb-3 h-8 w-8 text-slate-600" />
                <p className="text-sm font-medium text-slate-200">
                  Compiler output will appear here
                </p>
              </div>
            )}

            {isExecuting && (
              <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/40 text-sky-300">
                <Loader2 className="mb-3 h-8 w-8 animate-spin" />
                <p className="text-sm font-medium">Executing code</p>
              </div>
            )}

            {executionResult && !isExecuting && (
              <div className="space-y-4">
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-4",
                    executionResult.status?.id === 3
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-200"
                  )}
                >
                  {executionResult.status?.id === 3 ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span className="text-sm font-medium">
                    {executionResult.status?.description || "Completed"}
                  </span>
                </div>

                {executionResult.stdout && (
                  <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-200">
                    {executionResult.stdout}
                  </pre>
                )}

                {(executionResult.stderr || executionResult.compile_output) && (
                  <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-100">
                    {executionResult.stderr || executionResult.compile_output}
                  </pre>
                )}
              </div>
            )}

            {submissionResult && !isExecuting && (
              <div className="space-y-4">
                <div
                  className={cn(
                    "rounded-3xl border p-6 text-center",
                    submissionResult.allPassed
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-rose-500/30 bg-rose-500/10"
                  )}
                >
                  <p className="text-2xl font-semibold text-white">
                    {submissionResult.allPassed ? "Accepted" : "Needs work"}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    {
                      submissionResult.results.filter((result) => result.passed)
                        .length
                    }{" "}
                    / {submissionResult.results.length} test cases passed
                  </p>
                </div>

                <div className="space-y-3">
                  {submissionResult.results.map((result, index) => (
                    <div
                      key={`${result.input}-${index}`}
                      className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                    >
                      <span className="text-sm text-slate-200">
                        Test case {index + 1}: {result.input}
                      </span>
                      <Badge
                        className={cn(
                          "border",
                          result.passed
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-200"
                        )}
                      >
                        {result.passed ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CollaborativeEditor;
