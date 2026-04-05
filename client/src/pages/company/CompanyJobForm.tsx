import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2, ArrowLeft, Briefcase } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";

type RoundDraft = {
  roundNumber: number;
  type: string;
  difficulty: string;
  topic: string;
  duration: number;
  notes: string;
};

const fieldClass =
  "rounded-lg border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-blue-500/30 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-50 dark:placeholder:text-stone-500";

const cardShell =
  "rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#1e293b]";

const CompanyJobForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [rounds, setRounds] = useState<RoundDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const addRound = () => {
    setRounds((prev) => [
      ...prev,
      {
        roundNumber: prev.length + 1,
        type: "technical",
        difficulty: "medium",
        topic: "",
        duration: 30,
        notes: "",
      },
    ]);
  };

  const updateRound = <K extends keyof RoundDraft>(
    index: number,
    field: K,
    value: RoundDraft[K]
  ) => {
    setRounds((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeRound = (index: number) => {
    setRounds((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((r, i) => ({ ...r, roundNumber: i + 1 }))
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing fields",
        description: "Add a job title and description before publishing.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        "/jobs",
        { title, description, skills, rounds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Job published",
        description: "Your opening is live on the jobs board.",
      });
      navigate("/company/jobs");
    } catch (err) {
      console.error("Error creating job:", err);
      toast({
        title: "Could not create job",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
      <Navigation />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/company/jobs")}
            className="mb-2 -ml-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to job openings
          </Button>
          <h1 className="flex flex-wrap items-center gap-3 text-3xl font-extrabold tracking-wide text-slate-900 dark:text-white">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
              <Briefcase className="h-7 w-7" />
            </span>
            New job opening
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
            Describe the role, required skills, and interview rounds so
            candidates know what to expect.
          </p>
        </div>

        <Card className={cardShell}>
          <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Job details
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Required information for your listing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="job-title" className="text-stone-900 dark:text-stone-50">
                Job title *
              </Label>
              <Input
                id="job-title"
                className={fieldClass}
                placeholder="e.g. Senior Software Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-desc" className="text-stone-900 dark:text-stone-50">
                Description *
              </Label>
              <Textarea
                id="job-desc"
                className={fieldClass}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Responsibilities, team, stack, and what success looks like."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills" className="text-stone-900 dark:text-stone-50">
                Skills (comma-separated)
              </Label>
              <Input
                id="skills"
                className={fieldClass}
                placeholder="React, TypeScript, Node.js"
                value={skills.join(", ")}
                onChange={(e) =>
                  setSkills(
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
              />
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-6 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Label className="text-stone-900 dark:text-stone-50">
                    Interview rounds
                  </Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Optional—add stages candidates will go through
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRound}
                  className="rounded-xl border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:bg-slate-800/80"
                >
                  <PlusCircle className="mr-2 size-4" />
                  Add round
                </Button>
              </div>

              {rounds.map((round, index) => (
                <Card
                  key={index}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700/80 dark:bg-slate-900/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Round {round.roundNumber}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRound(index)}
                      className="shrink-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      aria-label={`Remove round ${round.roundNumber}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-stone-900 dark:text-stone-50">Type</Label>
                      <Select
                        value={round.type}
                        onValueChange={(v) => updateRound(index, "type", v)}
                      >
                        <SelectTrigger className={fieldClass}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-[#1e293b]">
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="behavioral">Behavioral</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-stone-900 dark:text-stone-50">
                        Difficulty
                      </Label>
                      <Select
                        value={round.difficulty}
                        onValueChange={(v) => updateRound(index, "difficulty", v)}
                      >
                        <SelectTrigger className={fieldClass}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-[#1e293b]">
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-stone-900 dark:text-stone-50">Topic</Label>
                      <Input
                        className={fieldClass}
                        placeholder="Focus area"
                        value={round.topic}
                        onChange={(e) =>
                          updateRound(index, "topic", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-stone-900 dark:text-stone-50">
                        Duration (minutes)
                      </Label>
                      <Input
                        type="number"
                        min={5}
                        className={fieldClass}
                        value={round.duration}
                        onChange={(e) =>
                          updateRound(
                            index,
                            "duration",
                            Math.max(0, parseInt(e.target.value, 10) || 0)
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label className="text-stone-900 dark:text-stone-50">Notes</Label>
                    <Textarea
                      className={fieldClass}
                      placeholder="Internal notes or instructions for this round"
                      value={round.notes}
                      onChange={(e) =>
                        updateRound(index, "notes", e.target.value)
                      }
                      rows={2}
                    />
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-sky-600 text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl disabled:opacity-60 dark:from-blue-600 dark:to-sky-700"
              >
                {submitting ? "Publishing…" : "Publish job"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-slate-200 text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800/80"
                onClick={() => navigate("/company/jobs")}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyJobForm;
