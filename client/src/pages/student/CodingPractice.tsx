import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, ArrowLeft, Search, Sparkles, Layers, ListOrdered, Play, CheckCircle2, XCircle, AlertCircle, Loader2, ChevronLeft, ChevronRight, FileQuestion } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CodingEditor from "@/components/study/CodingEditor";
import axiosInstance from "@/utils/axiosInstance";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface CodingQuestion {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  topic: string;
  constraints: string[];
  sampleInput: string;
  sampleOutput: string;
  starterCode: Record<string, string>;
}

const CodingPractice = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex] || null;

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setLoading(true);
    setQuestions([]);
    setStarted(false); // Reset started state before loading
    
    try {
      console.log(`Starting practice for ${topic} at ${difficulty} level...`);
      // 1. Fetch from DB
      const res = await axiosInstance.get(`/coding/questions?topic=${encodeURIComponent(topic)}&difficulty=${difficulty}`);
      let questionsList = res.data;

      // 2. Force generation if we have fewer than 2 questions
      if (!Array.isArray(questionsList) || questionsList.length < 2) {
        console.log("No sufficient questions found in DB, generating with AI...");
        const genRes = await axiosInstance.post("/coding/generate", { topic, difficulty, count: 3 });
        
        // The backend returns an array of saved questions
        questionsList = Array.isArray(genRes.data) ? genRes.data : [genRes.data];
      }

      if (!questionsList || questionsList.length === 0) {
        throw new Error("No questions available for this topic yet.");
      }

      console.log("Questions loaded successfully:", questionsList);
      setQuestions(questionsList);
      setCurrentQuestionIndex(0);
      setStarted(true); // ONLY set started to true after questions are confirmed
      
      toast({
        title: "Practice Session Ready",
        description: `Loaded ${questionsList.length} challenges for you.`,
      });
    } catch (err: any) {
      console.error("Coding Practice Error:", err);
      toast({
        title: "Failed to Start Session",
        description: err.response?.data?.error || err.message || "Failed to load coding questions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunCode = async (code: string, language: string) => {
    setIsExecuting(true);
    setExecutionResult(null);
    setSubmissionResult(null);
    try {
      const res = await axiosInstance.post("/coding/run", {
        source_code: code,
        language: language,
        stdin: currentQuestion?.sampleInput || ""
      });
      setExecutionResult(res.data);
    } catch (err) {
      toast({
        title: "Execution Error",
        description: "Failed to execute code. Check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitCode = async (code: string, language: string) => {
    if (!currentQuestion) return;
    setIsExecuting(true);
    setSubmissionResult(null);
    setExecutionResult(null);
    try {
      const res = await axiosInstance.post("/coding/submit", {
        questionId: currentQuestion._id,
        source_code: code,
        language: language
      });
      setSubmissionResult(res.data);
    } catch (err) {
      toast({
        title: "Submission Error",
        description: "Failed to submit code. Check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const resetPractice = () => {
    setStarted(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setExecutionResult(null);
    setSubmissionResult(null);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setExecutionResult(null);
      setSubmissionResult(null);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setExecutionResult(null);
      setSubmissionResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex flex-col overflow-hidden">
      <Navigation />
      
      <main className="flex-1 max-w-[1800px] w-full mx-auto px-4 py-6 flex flex-col min-h-0">
        <div className="mb-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => started ? resetPractice() : navigate("/student/dashboard")} 
              className="gap-2 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
            >
              <ArrowLeft size={18} />
              {started ? "Exit Session" : "Back to Dashboard"}
            </Button>
            
            {started && questions.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={currentQuestionIndex === 0}
                  onClick={handlePrevQuestion}
                  className="h-8 w-8 p-0 rounded-md hover:bg-slate-800 disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </Button>
                <div className="px-3 flex items-center gap-2">
                  <span className="text-xs font-black text-indigo-400">PROBLEM</span>
                  <span className="text-xs font-bold text-slate-500">
                    {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={currentQuestionIndex === questions.length - 1}
                  onClick={handleNextQuestion}
                  className="h-8 w-8 p-0 rounded-md hover:bg-slate-800 disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </div>
          
          {started && currentQuestion && (
            <div className="flex items-center gap-3">
              <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full">
                {currentQuestion.topic}
              </Badge>
              <Badge variant="outline" className="border-slate-800 text-slate-400 font-bold px-3 py-1 rounded-full">
                {currentQuestion.difficulty}
              </Badge>
            </div>
          )}
        </div>

        {!started ? (
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-4">
              <div className="h-24 w-24 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-500/30 mb-8 rotate-3 hover:rotate-0 transition-transform duration-500">
                <Code2 size={48} />
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-white">
                Master <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">Coding</span>
              </h1>
              <p className="text-slate-400 text-xl max-w-md mx-auto leading-relaxed">
                Personalized AI-powered coding challenges designed to level up your skills.
              </p>
            </div>

            <Card className="w-full border-slate-800 shadow-2xl bg-slate-900/50 backdrop-blur-xl p-2 text-left">
              <CardContent className="p-8">
                <form onSubmit={handleStart} className="space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Topic Selection</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                          <Search size={22} />
                        </div>
                        <Input 
                          placeholder="e.g. Dynamic Programming, Trees, Arrays..." 
                          className="h-16 pl-14 pr-6 text-xl rounded-2xl border-slate-800 bg-slate-950/50 text-white placeholder:text-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Challenge Level</label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="h-16 rounded-2xl border-slate-800 bg-slate-950/50 text-white text-lg focus:ring-2 focus:ring-indigo-500/50 transition-all">
                          <div className="flex items-center gap-4 text-slate-300">
                            <Layers size={22} className="text-indigo-400" />
                            <SelectValue placeholder="Select difficulty" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-800 bg-slate-900 text-white">
                          <SelectItem value="Easy" className="text-lg py-3 focus:bg-indigo-500/10 focus:text-indigo-400">Easy</SelectItem>
                          <SelectItem value="Medium" className="text-lg py-3 focus:bg-indigo-500/10 focus:text-indigo-400">Medium</SelectItem>
                          <SelectItem value="Hard" className="text-lg py-3 focus:bg-indigo-500/10 focus:text-indigo-400">Hard</SelectItem>
                          <SelectItem value="Expert" className="text-lg py-3 focus:bg-indigo-500/10 focus:text-indigo-400">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xl font-black shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin h-6 w-6" />
                        <span>AI is generating problems...</span>
                      </div>
                    ) : (
                      "Launch Practice Session"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : questions.length > 0 && currentQuestion ? (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 overflow-hidden">
              {/* Left: Tabs for Problem Statement & Navigation */}
              <div className="flex flex-col min-h-0 bg-[#121212] rounded-2xl border border-slate-800/50 shadow-2xl overflow-hidden">
                <Tabs defaultValue="problem" className="flex-1 flex flex-col h-full overflow-hidden">
                  <TabsList className="flex-shrink-0 grid w-full grid-cols-1 bg-[#1a1a1a] p-1 border-b border-slate-800">
                    <TabsTrigger value="problem" className="rounded-xl py-3 gap-2 font-bold data-[state=active]:bg-slate-800 data-[state=active]:text-white transition-all text-slate-400">
                      <Code2 size={18} className="text-indigo-400" />
                      PROBLEM STATEMENT
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="problem" className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent focus-visible:outline-none h-full">
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                      <h2 className="text-3xl font-black text-white mb-6 leading-tight">{currentQuestion.title}</h2>
                      
                      <div className="prose prose-invert prose-indigo max-w-none mb-10 text-slate-300 text-lg leading-relaxed">
                        <ReactMarkdown>{currentQuestion.description || ""}</ReactMarkdown>
                      </div>
                      
                      {currentQuestion.constraints && currentQuestion.constraints.length > 0 && (
                        <div className="mb-10 bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50">
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-4">Constraints</h3>
                          <ul className="space-y-3">
                            {currentQuestion.constraints.map((c, i) => (
                              <li key={i} className="text-base text-slate-400 flex items-start gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Sample Test Cases</h3>
                        <div className="grid grid-cols-1 gap-6">
                          <div className="group">
                            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 group-hover:border-indigo-500/30 transition-colors">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Input</h4>
                              <pre className="text-sm font-mono text-indigo-300 bg-transparent p-0 m-0 overflow-x-auto selection:bg-indigo-500/30">
                                {currentQuestion.sampleInput || "N/A"}
                              </pre>
                            </div>
                          </div>
                          <div className="group">
                            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 group-hover:border-indigo-500/30 transition-colors">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Output</h4>
                              <pre className="text-sm font-mono text-emerald-400 bg-transparent p-0 m-0 overflow-x-auto selection:bg-emerald-500/30">
                                {currentQuestion.sampleOutput || "N/A"}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>


                </Tabs>
              </div>

              {/* Right: Editor Area */}
              <div className="flex flex-col gap-6 min-h-0 overflow-hidden">
                <div className="flex-1 min-h-0 bg-[#0d0d0d] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
                  <CodingEditor 
                  key={currentQuestion._id}
                  onRun={handleRunCode}
                  onSubmit={handleSubmitCode}
                  isExecuting={isExecuting}
                  initialCode={currentQuestion.starterCode?.javascript}
                  questions={questions}
                  currentQuestionIndex={currentQuestionIndex}
                  onQuestionChange={setCurrentQuestionIndex}
                />
                </div>

                {/* Console / Results Area */}
                <div className="h-1/3 flex-shrink-0 bg-[#121212] rounded-2xl border border-slate-800/50 shadow-2xl overflow-hidden flex flex-col">
                  <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-[#1a1a1a]">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Execution Output</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { setExecutionResult(null); setSubmissionResult(null); }}
                      className="h-7 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white"
                    >
                      Clear Console
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800">
                    {!executionResult && !submissionResult && !isExecuting && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center opacity-50">
                        <Play size={32} className="mb-3 opacity-20" />
                        <p className="text-sm font-medium tracking-wide">Output will appear here after running your code</p>
                      </div>
                    )}

                    {isExecuting && (
                      <div className="h-full flex flex-col items-center justify-center text-indigo-400 gap-4">
                        <Loader2 className="animate-spin h-8 w-8" />
                        <p className="text-xs font-black uppercase tracking-widest">Executing code on server...</p>
                      </div>
                    )}

                    {executionResult && !isExecuting && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className={cn(
                          "p-4 rounded-xl flex items-center gap-3 border",
                          executionResult.status?.id === 3 
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
                            : "bg-rose-500/5 border-rose-500/20 text-rose-400"
                        )}>
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center",
                            executionResult.status?.id === 3 ? "bg-emerald-500/20" : "bg-rose-500/20"
                          )}>
                            {executionResult.status?.id === 3 ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Status</p>
                            <p className="font-black text-sm">{executionResult.status?.description}</p>
                          </div>
                        </div>
                        
                        {executionResult.stdout && (
                          <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Standard Output</p>
                            <pre className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                              {executionResult.stdout}
                            </pre>
                          </div>
                        )}

                        {(executionResult.stderr || executionResult.compile_output) && (
                          <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500/70">Error Details</p>
                            <pre className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 font-mono text-sm text-rose-400 overflow-x-auto whitespace-pre-wrap">
                              {executionResult.stderr || executionResult.compile_output}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {submissionResult && !isExecuting && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <div className={cn(
                          "p-8 rounded-3xl text-center space-y-4 border-2 transition-all",
                          submissionResult.allPassed 
                            ? "bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]" 
                            : "bg-rose-500/5 border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.05)]"
                        )}>
                          <div className={cn(
                            "mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-2",
                            submissionResult.allPassed ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                          )}>
                            {submissionResult.allPassed ? (
                              <CheckCircle2 size={48} className="animate-bounce" />
                            ) : (
                              <XCircle size={48} />
                            )}
                          </div>
                          <div>
                            <h4 className={cn("text-3xl font-black tracking-tighter", submissionResult.allPassed ? "text-emerald-400" : "text-rose-400")}>
                              {submissionResult.allPassed ? "ACCEPTED" : "FAILED"}
                            </h4>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">
                              {submissionResult.results.filter((r: any) => r.passed).length} OF {submissionResult.results.length} TEST CASES PASSED
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {submissionResult.results.map((res: any, idx: number) => (
                            <div key={idx} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-between group hover:border-slate-700 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "h-8 w-8 rounded-lg flex items-center justify-center font-black text-[10px]",
                                  res.passed ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                                )}>
                                  TC {idx + 1}
                                </div>
                                <span className="text-xs font-bold text-slate-400">Input: <span className="text-slate-200 ml-1">{res.input}</span></span>
                              </div>
                              <div className="flex items-center gap-4">
                                {res.passed ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] px-2 font-black">PASSED</Badge>
                                ) : (
                                  <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] px-2 font-black">FAILED</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-900/50 rounded-3xl border border-slate-800 animate-pulse">
              <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
              <h2 className="text-xl font-black text-white">Initializing Practice Environment...</h2>
              <p className="text-slate-500 mt-2">This may take a few seconds if questions are being generated for the first time.</p>
            </div>
          )}
      </main>
    </div>
  );
};

export default CodingPractice;

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
