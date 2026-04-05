import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AUTH_VIDEO =
  "https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-a-laptop-with-coffee-4057-large.mp4";

/** Office / collaboration — static fallback if video fails or while loading */
const AUTH_POSTER =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80";

type AuthPageLayoutProps = {
  children: React.ReactNode;
};

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background: video + overlays (fixed so long register forms scroll over it) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {!videoFailed && (
          <video
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-[0.35] dark:opacity-[0.28]"
            autoPlay
            muted
            loop
            playsInline
            poster={AUTH_POSTER}
            onError={() => setVideoFailed(true)}
          >
            <source src={AUTH_VIDEO} type="video/mp4" />
          </video>
        )}
        {videoFailed && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${AUTH_POSTER})` }}
            aria-hidden
          />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-50/92 via-white/88 to-sky-50/90 dark:from-[#0f172a]/92 dark:via-[#1e293b]/88 dark:to-[#1e3a8a]/90"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f606_1px,transparent_1px),linear-gradient(to_bottom,#3b82f606_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,#000_40%,transparent_100%)] dark:bg-[linear-gradient(to_right,#38bdf80d_1px,transparent_1px),linear-gradient(to_bottom,#38bdf80d_1px,transparent_1px)]"
          aria-hidden
        />
        <div
          className="absolute -left-1/3 top-0 h-[min(70vh,520px)] w-[min(70vw,520px)] rounded-full bg-blue-400/20 blur-[100px] dark:bg-blue-600/15"
          aria-hidden
        />
        <div
          className="absolute -right-1/4 bottom-0 h-[min(60vh,440px)] w-[min(60vw,440px)] rounded-full bg-sky-400/15 blur-[90px] dark:bg-sky-600/12"
          aria-hidden
        />
      </div>

      <Link
        to="/"
        className="fixed left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/80 px-3 py-2 text-sm font-medium text-stone-700 shadow-sm backdrop-blur-md transition-colors hover:bg-white hover:text-blue-700 dark:border-stone-700/80 dark:bg-[#334155]/85 dark:text-stone-200 dark:hover:bg-[#334155] dark:hover:text-blue-300 sm:left-6 sm:top-6"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to home
      </Link>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-14 pt-24 sm:pb-16 sm:pt-28">
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
