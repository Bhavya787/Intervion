import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Target, Play, CheckCircle, ArrowLeft } from "lucide-react";
import ResumeUploader from "./ResumeUploader";
import type { NavigateFunction } from "react-router-dom";

type SetupData = {
  resume: string;
  role: string;
  difficulty: string;
  roundType: string;
  topic: string;
};

type PracticeSetupProps = {
  setupData: SetupData;
  setSetupData: React.Dispatch<React.SetStateAction<SetupData>>;
  handleSetupSubmit: () => void | Promise<void>;
  navigate: NavigateFunction;
};

const fieldClass =
  "rounded-lg border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-blue-500/30 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-50 dark:placeholder:text-stone-500";

const cardClass =
  "rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#1e293b]";

const PracticeSetup = ({
  setupData,
  setSetupData,
  handleSetupSubmit,
  navigate,
}: PracticeSetupProps) => (
  <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="mb-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/student/dashboard")}
        className="mb-2 -ml-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
      >
        <ArrowLeft className="mr-2 size-4" />
        Back to dashboard
      </Button>
      <h1 className="flex flex-wrap items-center gap-3 text-3xl font-extrabold tracking-wide text-slate-900 dark:text-white">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
          <Target className="h-7 w-7" />
        </span>
        Practice interview
      </h1>
      <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
        Set your role, round type, and difficulty—then start a realistic AI
        session.
      </p>
    </div>
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card className={cardClass}>
        <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Target className="size-5 text-blue-600 dark:text-blue-400" />
            Configuration
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Required fields are marked with *
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <ResumeUploader
            dataChanged={(data) => {
              setSetupData((prev) => ({ ...prev, resume: data }));
            }}
          />
          <div className="space-y-2">
            <Label htmlFor="role" className="text-stone-900 dark:text-stone-50">
              Target role *
            </Label>
            <Input
              id="role"
              placeholder="e.g. Software Engineer, Product Manager"
              value={setupData.role}
              onChange={(e) =>
                setSetupData((prev) => ({ ...prev, role: e.target.value }))
              }
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="difficulty"
              className="text-stone-900 dark:text-stone-50"
            >
              Difficulty *
            </Label>
            <Select
              onValueChange={(value) =>
                setSetupData((prev) => ({ ...prev, difficulty: value }))
              }
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-[#1e293b]">
                <SelectItem value="beginner">Beginner (0–2 years)</SelectItem>
                <SelectItem value="intermediate">
                  Intermediate (2–5 years)
                </SelectItem>
                <SelectItem value="senior">Senior (5+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="roundType"
              className="text-stone-900 dark:text-stone-50"
            >
              Interview round *
            </Label>
            <Select
              onValueChange={(value) =>
                setSetupData((prev) => ({ ...prev, roundType: value }))
              }
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Select round type" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-[#1e293b]">
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="system-design">System design</SelectItem>
                <SelectItem value="coding">Coding</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-stone-900 dark:text-stone-50">
              Focus area (optional)
            </Label>
            <Textarea
              id="topic"
              placeholder="Specific topics or themes to emphasize"
              value={setupData.topic}
              onChange={(e) =>
                setSetupData((prev) => ({ ...prev, topic: e.target.value }))
              }
              rows={3}
              className={fieldClass}
            />
          </div>
          <Button
            onClick={handleSetupSubmit}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-sky-600 text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl dark:from-blue-600 dark:to-sky-700"
            size="lg"
          >
            <Play className="mr-2 size-4" />
            Start interview
          </Button>
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            Tips
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Get the most from this session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-3">
            {[
              {
                title: "Environment",
                desc: "Quiet space, stable connection, minimal distractions.",
              },
              {
                title: "Camera & mic",
                desc: "Test hardware before you begin the live flow.",
              },
              {
                title: "Think out loud",
                desc: "Explain your reasoning like you would to an interviewer.",
              },
              {
                title: "STAR for behavioral",
                desc: "Situation, Task, Action, Result keeps answers tight.",
              },
            ].map((tip) => (
              <div key={tip.title} className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {tip.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {tip.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Separator className="bg-slate-200 dark:bg-slate-800" />
          <div className="rounded-xl border border-blue-200/80 bg-blue-50/90 p-4 dark:border-blue-900/40 dark:bg-blue-950/25">
            <h4 className="mb-2 text-sm font-semibold text-blue-800 dark:text-blue-200">
              What to expect
            </h4>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <li>• Several questions tailored to your selections</li>
              <li>• A full transcript and feedback when you finish</li>
              <li>• Results saved to your dashboard history</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default PracticeSetup;
