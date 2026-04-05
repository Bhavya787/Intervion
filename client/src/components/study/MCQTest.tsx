import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle, ArrowRight, RefreshCcw, HelpCircle } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { useToast } from "@/hooks/use-toast";

interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface MCQTestProps {
  topic: string;
  difficulty: string;
  count: number;
}

const MCQTest = ({ topic, difficulty, count }: MCQTestProps) => {
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [testFinished, setShowFinished] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (topic) {
      generateQuestions();
    }
  }, [topic, difficulty, count]);

  const generateQuestions = async () => {
    setLoading(true);
    setQuestions([]);
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setShowFinished(false);

    try {
      const res = await axiosInstance.post("/rooms/mcq", {
        topic,
        difficulty,
        count
      });
      setQuestions(res.data);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (
              err as {
                response?: { data?: { error?: string; message?: string } };
              }
            ).response?.data?.error ||
            (
              err as {
                response?: { data?: { error?: string; message?: string } };
              }
            ).response?.data?.message
          : undefined;

      console.error("Error generating MCQs", err);
      toast({
        title: "Error",
        description: message || "Failed to generate questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (showResult) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    if (selectedOption === questions[currentIdx].correctAnswer) {
      setScore(prev => prev + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setShowFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <h3 className="text-lg font-bold dark:text-white">Preparing your test...</h3>
        <p className="text-slate-500 text-sm mt-2">Generating relevant questions based on "{topic}"</p>
      </div>
    );
  }

  if (testFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card className="max-w-2xl mx-auto mt-8 border-none shadow-md bg-white dark:bg-[#1e293b]">
        <CardContent className="p-10 text-center">
          <div className={`h-20 w-20 rounded-full mx-auto flex items-center justify-center mb-6 ${
            percentage >= 70 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
          }`}>
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-extrabold dark:text-white mb-2">Test Completed!</h2>
          <p className="text-slate-500 mb-8">You've finished the MCQ test on <span className="font-bold text-blue-600">"{topic}"</span></p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Your Score</p>
              <p className="text-2xl font-black dark:text-white">{score} / {questions.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Percentage</p>
              <p className="text-2xl font-black dark:text-white">{percentage}%</p>
            </div>
          </div>

          <Button 
            onClick={generateQuestions} 
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold gap-2"
          >
            <RefreshCcw size={20} />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 bg-slate-50 dark:bg-[#1e293b] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
        <HelpCircle className="h-16 w-16 text-slate-300 mb-4" />
        <h3 className="text-xl font-bold dark:text-white">Ready for a quick test?</h3>
          <p className="text-slate-500 text-sm mt-2 mb-8 max-w-md">
          The system can generate multiple-choice questions specifically for the topic of this study room.
        </p>
        <Button 
          onClick={generateQuestions} 
          className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-lg font-bold shadow-lg shadow-blue-500/20"
        >
          Start MCQ Test
        </Button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto mt-4 space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30">
            Question {currentIdx + 1} of {questions.length}
          </Badge>
          <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700">
            {difficulty}
          </Badge>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">"{topic}"</span>
        </div>
        <div className="text-sm font-bold text-blue-600">
          Score: {score}
        </div>
      </div>

      <Progress value={progress} className="h-2 bg-slate-100 dark:bg-slate-800" />

      <Card className="border-none shadow-md bg-white dark:bg-[#1e293b] overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl leading-relaxed dark:text-white font-bold">
            {currentQ.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQ.options.map((option, idx) => {
            let className = "w-full justify-start text-left h-auto py-4 px-6 text-base font-medium transition-all duration-200 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700";
            
            if (selectedOption === idx) {
              if (showResult) {
                if (idx === currentQ.correctAnswer) {
                  className += " bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-500 text-green-700 dark:text-green-400 shadow-sm";
                } else {
                  className += " bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-500 text-red-700 dark:text-red-400 shadow-sm";
                }
              } else {
                className += " bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-500 text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-blue-500";
              }
            } else if (showResult && idx === currentQ.correctAnswer) {
              className += " bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-500 text-green-700 dark:text-green-400 shadow-sm";
            }

            return (
              <Button
                key={idx}
                variant="ghost"
                className={className}
                onClick={() => handleOptionSelect(idx)}
                disabled={showResult}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                    selectedOption === idx ? 'bg-current text-white border-transparent' : 'border-slate-300 dark:border-slate-700 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="flex-1 whitespace-normal">{option}</span>
                  {showResult && idx === currentQ.correctAnswer && <CheckCircle2 size={20} className="text-green-500" />}
                  {showResult && selectedOption === idx && idx !== currentQ.correctAnswer && <XCircle size={20} className="text-red-500" />}
                </div>
              </Button>
            );
          })}

          {showResult && (
            <div className="mt-6 p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-2">
                <HelpCircle size={18} />
                Explanation
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}

          <div className="pt-6 flex justify-end">
            {!showResult ? (
              <Button 
                onClick={handleSubmit} 
                disabled={selectedOption === null}
                className="bg-blue-600 hover:bg-blue-700 px-8 h-12 font-bold gap-2 shadow-lg shadow-blue-500/20"
              >
                Submit Answer
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 px-8 h-12 font-bold gap-2"
              >
                {currentIdx < questions.length - 1 ? 'Next Question' : 'View Results'}
                <ArrowRight size={20} />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MCQTest;
