import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, ArrowLeft, Search, Sparkles, Layers, ListOrdered } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MCQTest from "@/components/study/MCQTest";

const MCQPractice = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState("5");
  const [started, setStarted] = useState(false);
  const navigate = useNavigate();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      setStarted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
      <Navigation />
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => started ? setStarted(false) : navigate("/student/dashboard")} 
            className="gap-2 text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            {started ? "Change Settings" : "Back to Dashboard"}
          </Button>
          
          {!started && (
            <Badge className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-none px-3 py-1">
              <Sparkles size={14} className="mr-1.5" />
              AI Powered Practice
            </Badge>
          )}
        </div>

        {!started ? (
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3">
              <div className="h-20 w-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/20 mb-6">
                <Brain size={40} />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                MCQ Practice <span className="text-blue-600">Sessions</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">
                Customize your practice session and let the system generate a practice test for you.
              </p>
            </div>

            <Card className="border-none shadow-2xl bg-white dark:bg-[#1e293b] p-2 text-left">
              <CardContent className="p-6">
                <form onSubmit={handleStart} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Topic</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                          <Search size={20} />
                        </div>
                        <Input 
                          placeholder="e.g. React Hooks, System Design, Python Basics..." 
                          className="h-14 pl-12 pr-4 text-lg rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Difficulty Level</label>
                        <Select value={difficulty} onValueChange={setDifficulty}>
                          <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500">
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                              <Layers size={18} />
                              <SelectValue placeholder="Select difficulty" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800">
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                            <SelectItem value="Expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Number of Questions</label>
                        <Select value={count} onValueChange={setCount}>
                          <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500">
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                              <ListOrdered size={18} />
                              <SelectValue placeholder="Select count" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800">
                            <SelectItem value="5">5 Questions</SelectItem>
                            <SelectItem value="10">10 Questions</SelectItem>
                            <SelectItem value="15">15 Questions</SelectItem>
                            <SelectItem value="20">20 Questions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
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
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] text-sm font-bold text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <MCQTest 
              topic={topic} 
              difficulty={difficulty} 
              count={parseInt(count)} 
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default MCQPractice;
