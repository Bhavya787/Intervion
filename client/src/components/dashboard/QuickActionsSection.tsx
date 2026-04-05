import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MonitorPlay,
  ClipboardList,
  Users,
  Briefcase,
  Code2,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Feature = { title: string; description: string };

type Block = {
  id: string;
  title: string;
  summary: string;
  icon: typeof MonitorPlay;
  features: Feature[];
  cta: string;
  to: string;
  image: string;
  imageAlt: string;
};

const BLOCKS: Block[] = [
  {
    id: "ai-interview",
    title: "AI interview",
    summary:
      "Nervous about what to say in your next interview? Run realistic mock sessions with AI—bring your resume, role, and difficulty, then iterate with feedback until you feel ready.",
    icon: MonitorPlay,
    features: [
      {
        title: "Real-time responses",
        description: "Structured answers and follow-ups tailored to your setup.",
      },
      {
        title: "Actionable insights",
        description: "See what landed and what to tighten before the real day.",
      },
      {
        title: "Adaptive rounds",
        description: "Behavioral, technical, or mixed—match the job you want.",
      }
    ],
    cta: "Try it now",
    to: "/student/practice",
    image:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80&auto=format&fit=crop",
    imageAlt: "Professional at a laptop in a video interview setting",
  },
  {
    id: "mcq",
    title: "MCQ practice",
    summary:
      "Build confidence with fast, focused MCQs—pick a topic, set difficulty, and learn from clear explanations so gaps turn into strengths.",
    icon: ClipboardList,
    features: [
      {
        title: "Topic focus",
        description: "Target the skills employers ask about most.",
      },
      {
        title: "Difficulty control",
        description: "Warm up or stress-test with the level you need.",
      },
      {
        title: "Repeatable drills",
        description: "Short sessions you can slot into any study block.",
      },
    ],
    cta: "Try it now",
    to: "/student/mcq",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&q=80&auto=format&fit=crop",
    imageAlt: "Notes and study materials on a desk",
  },
  {
    id: "coding-practice",
    title: "Coding practice",
    summary:
      "Master Data Structures and Algorithms with our interactive code editor—solve problems, run tests, and get AI-powered challenges.",
    icon: Code2,
    features: [
      {
        title: "Monaco Editor",
        description: "The same powerful editor used in VS Code.",
      },
      {
        title: "Real-time execution",
        description: "Run your code against test cases instantly.",
      },
      {
        title: "AI Question Engine",
        description: "Fresh problems generated just for your level.",
      },
    ],
    cta: "Start coding",
    to: "/student/coding",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&q=80&auto=format&fit=crop",
    imageAlt: "Code on a computer screen",
  },
  {
    id: "study-rooms",
    title: "Study rooms",
    summary:
      "Work together without losing momentum—shared rooms for chat, whiteboard, and code so your group stays in sync.",
    icon: Users,
    features: [
      {
        title: "Live collaboration",
        description: "Chat in real time while you prep cases or system design.",
      },
      {
        title: "Shared whiteboard",
        description: "Sketch flows and diagrams everyone can see.",
      },
      {
        title: "Collaborative editor",
        description: "Pair on snippets and pseudo-code in one place.",
      },
      {
        title: "Invite by email",
        description: "Pull classmates in when you’re ready to go deep.",
      },
    ],
    cta: "Try it now",
    to: "/student/rooms",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80&auto=format&fit=crop",
    imageAlt: "Team collaborating around laptops",
  },
  {
    id: "jobs",
    title: "Jobs",
    summary:
      "Move from practice to opportunity—browse openings, align your profile, and apply to roles that fit your skills and goals.",
    icon: Briefcase,
    features: [
      {
        title: "Curated listings",
        description: "Roles posted by companies using Intervion.",
      },
      {
        title: "Simple applications",
        description: "Apply with the context you’ve already prepared.",
      },
      {
        title: "Track your pipeline",
        description: "See where each application stands at a glance.",
      },
      {
        title: "Role context",
        description: "Read details before you invest time in a next round.",
      },
    ],
    cta: "Try it now",
    to: "/student/jobs",
    image:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=900&q=80&auto=format&fit=crop",
    imageAlt: "Laptop on a desk with a focused work setup",
  },
];

function QuickActionBlock({
  block,
  index,
}: {
  block: Block;
  index: number;
}) {
  const Icon = block.icon;
  const reverse = index % 2 === 1;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1e293b] sm:p-8 lg:p-10"
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div className={cn(reverse && "lg:order-2")}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200/60 bg-blue-50 dark:border-blue-500/25 dark:bg-blue-500/10">
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {block.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {block.summary}
              </p>
            </div>
          </div>

          <ul className="mt-8 space-y-5">
            {block.features.map((f) => (
              <li key={f.title} className="flex gap-3">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(99,102,241,0.55)]"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {f.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {f.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Button
              asChild
              className="h-11 gap-2 rounded-xl bg-blue-600 px-6 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
            >
              <Link to={block.to}>
                {block.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className={cn(reverse && "lg:order-1")}>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/80">
            <div className="aspect-[4/3] w-full sm:aspect-[16/10]">
              <img
                src={block.image}
                alt={block.imageAlt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent dark:from-slate-950/50" />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function QuickActionsSection() {
  return (
    <section className="mt-14">
      <div className="mb-10 max-w-2xl">
        <p className="flex items-center gap-2 text-3xl font-bold dark:text-white">
          Quick actions
        </p>
        <h2 className="mt-2 text-2l tracking-tight text-slate-900 dark:text-white sm:text-3l">
          Everything you need in one flow
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Prep, practice, collaborate, and apply in one place—aligned with your Intervion workflow.{" "}
        </p>
      </div>

      <div className="flex flex-col gap-12 lg:gap-16">
        {BLOCKS.map((block, i) => (
          <QuickActionBlock key={block.id} block={block} index={i} />
        ))}
      </div>
    </section>
  );
}
