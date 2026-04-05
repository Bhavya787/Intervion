import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useInView,
  useReducedMotion,
  type TargetAndTransition,
} from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCountUp } from '@/hooks/useCountUp';
import {
  ArrowRight,
  Users,
  Building,
  Target,
  CheckCircle,
  Star,
  TrendingUp,
  Zap,
  Shield,
  Globe,
  BookOpen,
  Sparkles,
  BarChart3,
  Quote,
} from 'lucide-react';

const HERO_VIDEO_PRIMARY =
  'https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-a-laptop-with-coffee-4057-large.mp4';
const HERO_VIDEO_SECONDARY =
  'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-typing-on-a-laptop-keyboard-4342-large.mp4';

const ROTATING_QUOTES = [
  {
    line: 'The offer you want is on the other side of uncomfortable reps.',
    by: '— Intervion mantra',
  },
  {
    line: 'Clarity beats confidence. Confidence follows clarity.',
    by: '— Practice note',
  },
  {
    line: 'Interviewers remember stories, not buzzwords.',
    by: '— Session takeaway',
  },
];

function formatSessionCount(n: number) {
  if (n >= 10000) return '10K+';
  if (n >= 1000) {
    const k = n / 1000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return n.toLocaleString();
}

function formatPartnerCount(n: number) {
  if (n >= 500) return '500+';
  return `${n}+`;
}

const Index = () => {
  const prefersReducedMotion = useReducedMotion();
  const [videoFail, setVideoFail] = useState({ primary: false, secondary: false });
  const statsRef = useRef<HTMLElement | null>(null);
  const statsVisible = useInView(statsRef, { once: true, amount: 0.35 });

  const sessions = useCountUp(10000, 2400, statsVisible);
  const partners = useCountUp(500, 2000, statsVisible);

  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setInterval(
      () => setQuoteIndex((i) => (i + 1) % ROTATING_QUOTES.length),
      6500
    );
    return () => clearInterval(id);
  }, [prefersReducedMotion]);

  const fadeUp: TargetAndTransition = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 24 };
  const fadeUpDelayed: TargetAndTransition = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 28 };
  const fadeSmall: TargetAndTransition = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 16 };
  const fadeTiny: TargetAndTransition = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 12 };

  const features = [
    {
      icon: <Target className="text-blue-500 dark:text-blue-400" size={24} />,
      title: 'Questions that feel like the real room',
      description:
        'Adaptive prompts mirror real screens—behavioral, technical, and role-specific—so nothing on interview day feels foreign.',
    },
    {
      icon: <Users className="text-sky-500 dark:text-sky-400" size={24} />,
      title: 'Feedback you can act on tonight',
      description:
        'Clear, specific notes on clarity, structure, and depth—not generic scores—so you know exactly what to rehearse next.',
    },
    {
      icon: <TrendingUp className="text-green-500 dark:text-green-400" size={24} />,
      title: 'See the curve, not just the score',
      description:
        'Trends over time show whether you are actually improving, not just “doing more reps” without direction.',
    },
    {
      icon: <Building className="text-yellow-500 dark:text-yellow-400" size={24} />,
      title: 'Built for candidates and hiring teams',
      description:
        'Students sharpen their edge; companies get a clearer signal earlier—one platform, two sides of the same table.',
    },
    {
      icon: <Shield className="text-blue-500 dark:text-blue-400" size={24} />,
      title: 'Your practice stays yours',
      description:
        'Sessions and materials are handled with care—so you can be candid in practice without second-guessing privacy.',
    },
    {
      icon: <Globe className="text-sky-500 dark:text-sky-400" size={24} />,
      title: 'Wherever you are on the map',
      description:
        'Remote, hybrid, or on-site—prep that fits your timezone and your ambition, not someone else’s schedule.',
    },
  ];

  const journey = [
    {
      step: '01',
      icon: <BookOpen className="size-6 text-blue-500 dark:text-blue-400" />,
      title: 'Map the terrain',
      text: 'Skim role-specific themes and the “why behind the question” so you are not memorizing—you are understanding.',
    },
    {
      step: '02',
      icon: <Sparkles className="size-6 text-sky-500 dark:text-sky-400" />,
      title: 'Pressure-test out loud',
      text: 'Run timed sessions with AI that pushes back, probes deeper, and mirrors how real conversations actually flow.',
    },
    {
      step: '03',
      icon: <BarChart3 className="size-6 text-green-500 dark:text-green-400" />,
      title: 'Compound the wins',
      text: 'Spot patterns in your answers, fix the weak links, and walk in knowing you have already done the hard part.',
    },
  ];

  const testimonials = [
    {
      name: 'Priya Nair',
      role: 'Backend engineer · offer in 3 weeks',
      content:
        'I used to freeze on system design. Two weeks of structured runs here and I was whiteboarding like it was a normal Tuesday.',
      rating: 5,
    },
    {
      name: 'Jordan Ellis',
      role: 'New grad · first FT role',
      content:
        'The “why did you say that?” style feedback caught habits my friends never noticed. Felt like a coach, not a chatbot.',
      rating: 5,
    },
    {
      name: 'Morgan Reyes',
      role: 'Talent lead · mid-size SaaS',
      content:
        'We send strong candidates through practice tracks before panels. Fewer surprises, better signal, faster closes.',
      rating: 5,
    },
    {
      name: 'Alex Park',
      role: 'PM pivot from consulting',
      content:
        'Switching lanes is scary. Intervion gave me language for product tradeoffs I did not have on day one. Game changer.',
      rating: 5,
    },
  ];

  const q = ROTATING_QUOTES[quoteIndex];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-stone-700/80 dark:bg-[#1e293b]/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-sky-600 shadow-lg">
              <span className="text-sm font-bold text-white">IV</span>
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-xl font-bold text-transparent dark:from-blue-400 dark:to-sky-400">
              Intervion
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-blue-600 dark:text-blue-400">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:shadow-lg dark:from-blue-600 dark:to-sky-600">
                Start free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — dual video backdrop (compact height so following sections sit higher) */}
      <section className="relative overflow-hidden pb-4 pt-2 sm:pb-6 sm:pt-4">
        <div className="absolute inset-0">
          {!videoFail.secondary && (
            <video
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.22] dark:opacity-[0.18]"
              autoPlay
              muted
              loop
              playsInline
              onError={() => setVideoFail((f) => ({ ...f, secondary: true }))}
            >
              <source src={HERO_VIDEO_SECONDARY} type="video/mp4" />
            </video>
          )}
          {!videoFail.primary && (
            <video
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-40 dark:opacity-[0.32]"
              autoPlay
              muted
              loop
              playsInline
              onError={() => setVideoFail((f) => ({ ...f, primary: true }))}
            >
              <source src={HERO_VIDEO_PRIMARY} type="video/mp4" />
            </video>
          )}
          <div
            className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/95 to-sky-50/90 dark:from-[#0f172a] dark:via-[#1e3a5f]/95 dark:to-[#1e3a8a]/90"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#3b82f608_1px,transparent_1px),linear-gradient(to_bottom,#3b82f608_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_40%,#000_50%,transparent_100%)] dark:bg-[linear-gradient(to_right,#38bdf812_1px,transparent_1px),linear-gradient(to_bottom,#38bdf812_1px,transparent_1px)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-1/4 top-1/4 h-[420px] w-[420px] rounded-full bg-blue-500/25 blur-[100px] motion-safe:animate-pulse dark:bg-blue-600/30"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-1/4 bottom-0 h-[380px] w-[380px] rounded-full bg-sky-500/20 blur-[100px] motion-safe:animate-pulse dark:bg-sky-600/25"
            style={{ animationDelay: '1s' }}
            aria-hidden
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
            <motion.div
              className="space-y-6 text-center lg:text-left"
              initial={fadeUp}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Badge
                variant="secondary"
                className="border border-blue-200/80 bg-blue-50/90 text-blue-900 dark:border-blue-800/60 dark:bg-blue-950/80 dark:text-blue-100"
              >
                <Zap size={14} className="mr-1" />
                AI-Powered Interview Platform
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-5xl lg:text-6xl lg:leading-[1.08]">
                Turn interview nerves into{' '}
                <span className="bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-400">
                  calm clarity
                </span>
              </h1>
              <p className="mx-auto max-w-xl text-lg text-stone-600 dark:text-stone-400 lg:mx-0 lg:text-xl">
                Intervion is your rehearsal stage: AI sessions, sharp feedback, and progress you can
                see—so the real conversation feels like round two, not opening night.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:from-blue-600 dark:to-sky-600"
                  >
                    Claim my first free session
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
                  >
                    I already have an account
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-stone-500 dark:text-stone-400 lg:justify-start">
                <span className="flex items-center">
                  <CheckCircle size={16} className="mr-2 text-emerald-500 dark:text-emerald-400" />
                  No credit card to start
                </span>
                <span className="flex items-center">
                  <CheckCircle size={16} className="mr-2 text-emerald-500 dark:text-emerald-400" />
                  Pick up where you left off
                </span>
                <span className="flex items-center">
                  <CheckCircle size={16} className="mr-2 text-emerald-500 dark:text-emerald-400" />
                  Built for deep work blocks
                </span>
              </div>
            </motion.div>

            <motion.div
              className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
              initial={fadeUpDelayed}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative rounded-2xl border border-blue-200/60 bg-white/75 p-1 shadow-2xl backdrop-blur-xl dark:border-blue-500/25 dark:bg-[#334155]/85">
                <div className="rounded-xl bg-gradient-to-br from-blue-500/10 via-transparent to-sky-500/10 p-6 dark:from-blue-500/15 dark:to-sky-500/15">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                      Tonight&apos;s sprint
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                      In progress
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-200/90 dark:bg-stone-700/80">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-500"
                        initial={{ width: '0%' }}
                        animate={{ width: '68%' }}
                        transition={{
                          duration: prefersReducedMotion ? 0 : 1.5,
                          delay: prefersReducedMotion ? 0 : 0.35,
                          ease: 'easeOut',
                        }}
                      />
                    </div>
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      &ldquo;Tell me about a time you disagreed with PM on scope.&rdquo;
                    </p>
                    <div className="flex gap-2">
                      <span className="rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-900 dark:bg-blue-950 dark:text-blue-200">
                        Behavioral
                      </span>
                      <span className="rounded-md bg-sky-100 px-2 py-1 text-xs text-sky-900 dark:bg-sky-950 dark:text-sky-200">
                        ~18 min
                      </span>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 hidden rounded-xl border border-white/50 bg-gradient-to-br from-blue-500 to-sky-600 p-3 text-white shadow-lg sm:block dark:border-blue-400/30">
                  <Sparkles className="size-6" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rotating quotes — engagement strip (pulled up toward hero) */}
      <section className="-mt-2 border-y border-blue-100/80 bg-gradient-to-r from-blue-50/90 via-sky-50/80 to-blue-50/90 py-8 dark:-mt-1 dark:border-blue-950/40 dark:from-[#1e293b] dark:via-[#1e293b] dark:to-[#1e293b] sm:py-9">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 text-center sm:px-6">
          <Quote className="size-8 text-blue-400 opacity-80" aria-hidden />
          <motion.p
            key={quoteIndex}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-lg font-medium text-stone-800 dark:text-stone-200 sm:text-xl"
          >
            {q.line}
          </motion.p>
          <p className="text-sm text-stone-500 dark:text-stone-400">{q.by}</p>
        </div>
      </section>

      {/* Stats — incremental counters for headline metrics */}
      <section
        ref={statsRef}
        className="border-y border-stone-200 bg-blue-50/40 dark:border-stone-800 dark:bg-[#1e293b]/70"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-8 sm:grid-cols-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-3xl font-bold tabular-nums text-blue-600 dark:text-blue-400 sm:text-4xl">
              {formatSessionCount(sessions)}
            </p>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">Practice sessions</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold tabular-nums text-blue-600 dark:text-blue-400 sm:text-4xl">
              {formatPartnerCount(partners)}
            </p>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">Hiring partners</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold tabular-nums text-blue-600 dark:text-blue-400 sm:text-4xl">
              4.5★
            </p>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">Avg. rating</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold tabular-nums text-blue-600 dark:text-blue-400 sm:text-4xl">
              24/7
            </p>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">AI feedback</p>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="py-20 dark:bg-[#0f172a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 lg:text-4xl">
              Three beats. One breakthrough.
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-stone-600 dark:text-stone-400">
              No endless playlists—just a simple loop: understand, stress-test, refine. That&apos;s how
              momentum actually shows up in the room.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {journey.map((item, i) => (
              <motion.div
                key={item.step}
                initial={fadeSmall}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: prefersReducedMotion ? 0 : i * 0.08 }}
              >
                <Card className="h-full border-blue-100 bg-white shadow-lg transition-shadow hover:shadow-xl dark:border-blue-950/50 dark:bg-[#334155]">
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-blue-500 dark:text-blue-400">
                        {item.step}
                      </span>
                      <div className="rounded-lg bg-blue-100/90 p-2 dark:bg-blue-950/80">
                        {item.icon}
                      </div>
                    </div>
                    <CardTitle className="text-lg text-stone-900 dark:text-stone-50">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-stone-600 dark:text-stone-400">
                      {item.text}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20 dark:bg-[#1e293b]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-stone-900 dark:text-stone-50 lg:text-4xl">
              Everything in one warm-up space
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-stone-600 dark:text-stone-400">
              Less tab-hopping, more reps. The boring stuff is automated so your brain can focus on
              sounding like you—on your best day.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-[#334155]"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg text-stone-900 dark:text-stone-50">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-stone-600 dark:text-stone-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 dark:bg-[#0f172a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-stone-900 dark:text-stone-50 lg:text-4xl">
              Voices from the waiting room—and the other side
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-400">
              Students, career switchers, and hiring leads share what shifted for them.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={fadeTiny}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: prefersReducedMotion ? 0 : index * 0.06 }}
              >
                <Card className="h-full bg-white shadow-lg dark:bg-[#334155]">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="fill-current text-sky-400 dark:text-sky-400"
                          size={16}
                        />
                      ))}
                    </div>
                    <p className="mb-4 text-stone-600 dark:text-stone-400">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div>
                      <p className="font-medium text-stone-900 dark:text-stone-50">{testimonial.name}</p>
                      <p className="text-sm text-stone-500 dark:text-stone-400">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-500 to-sky-600 py-20 dark:from-blue-600 dark:to-sky-700">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-white lg:text-4xl">
            Ready to Crack Your Next Interview?
          </h2>
          <p className="mb-8 text-xl text-white/95">
            One focused session tonight beats ten vague articles. Give yourself the unfair advantage of
            having already heard the hard questions out loud.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/register">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-700 shadow-lg hover:bg-blue-50 dark:bg-[#334155] dark:text-blue-300 dark:hover:bg-stone-800"
              >
                Create free account
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-12 dark:border-stone-800 dark:bg-[#1e293b]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-sky-600 dark:from-blue-600 dark:to-sky-700">
                <span className="text-sm font-bold text-white">IV</span>
              </div>
              <span className="text-xl font-bold text-blue-700 dark:text-blue-300">Intervion</span>
            </div>
            <p className="mb-6 text-stone-600 dark:text-stone-400">
              Where ambitious people rehearse the conversations that change their trajectory.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-stone-500 dark:text-stone-400">
              <a href="#" className="transition-colors hover:text-blue-700 dark:hover:text-blue-400">
                Privacy
              </a>
              <a href="#" className="transition-colors hover:text-blue-700 dark:hover:text-blue-400">
                Terms
              </a>
              <a href="#" className="transition-colors hover:text-blue-700 dark:hover:text-blue-400">
                Contact
              </a>
              <a href="#" className="transition-colors hover:text-blue-700 dark:hover:text-blue-400">
                Help
              </a>
            </div>
            <div className="mt-8 border-t border-stone-200 pt-8 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
              © {new Date().getFullYear()} Intervion. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
