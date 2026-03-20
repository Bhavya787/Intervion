import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowLeft, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MCQTest from "@/components/study/MCQTest";

const MCQPractice = () => {
  const [topic, setTopic] = useState("");
  const [started, setStarted] = useState(false);
  const navigate = useNavigate();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      setStarted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]">
      <Navigation />
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => started ? setStarted(false) : navigate("/student/dashboard")} 
            className="gap-2 text-slate-500 hover:text-indigo-600"
          >
            <ArrowLeft size={18} />
            {started ? "Change Topic" : "Back to Dashboard"}
          </Button>
          
          {!started && (
            <Badge className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border-none px-3 py-1">
              <Sparkles size={14} className="mr-1.5" />
              AI Powered Practice
            </Badge>
          )}
        </div>

        {!started ? (
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3">
              <div className="h-20 w-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-500/20 mb-6">
                <Brain size={40} />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                MCQ Practice <span className="text-indigo-600">Sessions</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">
                Enter any technical topic, and Gemini will generate a custom multiple-choice test just for you.
              </p>
            </div>

            <Card className="border-none shadow-2xl bg-white dark:bg-[#161B2C] p-2">
              <CardContent className="p-6">
                <form onSubmit={handleStart} className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Search size={20} />
                    </div>
                    <Input 
                      placeholder="e.g. React Hooks, System Design, Python Basics..." 
                      className="h-14 pl-12 pr-4 text-lg rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Generate Test
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['JavaScript', 'Data Structures', 'Cloud Computing', 'Database', 'React', 'Node.js'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setTopic(suggestion)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B2C] text-sm font-bold text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <MCQTest topic={topic} />
          </div>
        )}
      </main>
    </div>
  );
};

export default MCQPractice;
