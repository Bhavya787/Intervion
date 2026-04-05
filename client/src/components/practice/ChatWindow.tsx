import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, User } from "lucide-react";

type ChatEntry = {
  type: "question" | "answer";
  content: string;
  timestamp: string;
};

const ChatWindow = ({ chatHistory }: { chatHistory: ChatEntry[] }) => {
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#1e293b] lg:col-span-3">
      <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
          <span className="text-blue-600 dark:text-blue-400">Transcript</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="custom-scrollbar max-h-[min(500px,55vh)] space-y-3 overflow-y-auto px-4 pb-4 pt-2 lg:h-[500px] lg:max-h-none">
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`rounded-xl border p-3 shadow-sm transition-all ${
                chat.type === "question"
                  ? "border-blue-200/80 bg-blue-50/90 dark:border-blue-900/50 dark:bg-blue-950/20"
                  : "border-sky-200/80 bg-sky-50/80 dark:border-sky-900/40 dark:bg-sky-950/15"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                {chat.type === "question" ? (
                  <MessageCircle className="size-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <User className="size-4 text-sky-700 dark:text-sky-400" />
                )}
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {chat.type === "question" ? "Interviewer" : "You"}
                </span>
                <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                  {chat.timestamp}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                {chat.content}
              </p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
