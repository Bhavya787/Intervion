import Editor from "@monaco-editor/react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Play, Send, RefreshCcw, FileQuestion, Code2 } from "lucide-react";

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

interface CodingEditorProps {
  initialCode?: string;
  language?: string;
  questions?: CodingQuestion[];
  currentQuestionIndex?: number;
  onRun?: (code: string, language: string) => void;
  onSubmit?: (code: string, language: string) => void;
  onReset?: () => void;
  onQuestionChange?: (index: number) => void;
  isExecuting?: boolean;
}

const LANGUAGE_MAP: Record<string, { id: number; name: string; defaultCode: string }> = {
  javascript: {
    id: 63,
    name: "JavaScript",
    defaultCode: "// Write your JavaScript code here\nfunction solution() {\n  \n}"
  },
  python: {
    id: 71,
    name: "Python 3",
    defaultCode: "# Write your Python code here\ndef solution():\n    pass"
  },
  java: {
    id: 62,
    name: "Java",
    defaultCode: "// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}"
  },
  cpp: {
    id: 54,
    name: "C++",
    defaultCode: "// Write your C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}"
  }
};

const CodingEditor = ({ 
  initialCode, 
  language: initialLanguage = "javascript",
  questions = [],
  currentQuestionIndex = 0,
  onRun,
  onSubmit,
  onReset,
  onQuestionChange,
  isExecuting = false
}: CodingEditorProps) => {
  const [code, setCode] = useState(initialCode || LANGUAGE_MAP[initialLanguage].defaultCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [activeTab, setActiveTab] = useState("editor");

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(LANGUAGE_MAP[newLang].defaultCode);
  };

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm min-h-0">
      {/* Header with Tabs and Controls */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Tabs for Editor/Questions */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-shrink-0">
            <TabsList className="bg-slate-200 dark:bg-slate-800 p-1">
              <TabsTrigger value="editor" className="px-3 py-1.5 text-sm rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                <Code2 size={14} className="mr-1" />
                Editor
              </TabsTrigger>
              {questions.length > 0 && (
                <TabsTrigger value="questions" className="px-3 py-1.5 text-sm rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                  <FileQuestion size={14} className="mr-1" />
                  Questions
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {questions.length}
                  </Badge>
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-40 h-9 rounded-lg border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGE_MAP).map(([key, value]) => (
                <SelectItem key={key} value={key}>{value.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset}
            className="h-9 px-3 text-slate-500 hover:text-blue-600 gap-2"
          >
            <RefreshCcw size={14} />
            Reset
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onRun?.(code, language)}
            disabled={isExecuting}
            className="h-9 px-4 border-slate-200 dark:border-slate-800 gap-2 font-bold"
          >
            <Play size={14} className="fill-current" />
            Run
          </Button>
          <Button 
            size="sm" 
            onClick={() => onSubmit?.(code, language)}
            disabled={isExecuting}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold shadow-sm shadow-blue-500/20"
          >
            <Send size={14} />
            Submit
          </Button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Tabs value={activeTab} className="h-full">
          {/* Editor Tab */}
          <TabsContent value="editor" className="h-full mt-0">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(val) => setCode(val || "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                roundedSelection: true,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 }
              }}
            />
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="h-full mt-0 overflow-y-auto p-4">
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div
                  key={question._id}
                  onClick={() => onQuestionChange?.(index)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    index === currentQuestionIndex
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">
                        {question.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <span className={`font-medium ${
                          question.difficulty === 'Easy' ? 'text-green-600 dark:text-green-400' :
                          question.difficulty === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {question.difficulty}
                        </span>
                        <span className="text-slate-500 dark:text-slate-500">•</span>
                        <span className="text-slate-500 dark:text-slate-500">{question.topic}</span>
                      </div>
                    </div>
                    {index === currentQuestionIndex && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 ml-2 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CodingEditor;
