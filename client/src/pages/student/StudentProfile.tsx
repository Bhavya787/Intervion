import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, FileText } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import Navigation from "@/components/Navigation";
import ResumeUploader from "@/components/practice/ResumeUploader";
import ResumeViewer from "@/components/resume/ResumeViewer";

const ProfilePage = () => {
  const [user, setUser] = useState<{
    fullName?: string;
    email?: string;
    role?: string;
    resumeText?: string;
  } | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleResumeTextSave = async (resumeText: string) => {
    try {
      const res = await axiosInstance.post(
        "/resume/update-text",
        {
          resumeText: resumeText,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to save resume text:", err);
      alert("Failed to save resume.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
        <Navigation />
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-slate-600 dark:text-slate-300">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="text-sm">Loading profile…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
      <Navigation />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-wide text-slate-900 dark:text-white">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
              <User className="h-7 w-7" />
            </span>
            Profile
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Your account details and resume used for practice and applications.
          </p>
        </div>

        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#1e293b]">
          <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <dl className="grid gap-4 sm:grid-cols-1">
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Name
                </dt>
                <dd className="mt-1 text-slate-900 dark:text-white">
                  {user.fullName}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Email
                </dt>
                <dd className="mt-1 text-slate-900 dark:text-white">
                  {user.email}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Role
                </dt>
                <dd className="mt-1 capitalize text-slate-900 dark:text-white">
                  {user.role}
                </dd>
              </div>
            </dl>

            <div className="border-t border-slate-100 pt-8 dark:border-slate-800">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Resume
              </h3>

              {user.resumeText ? (
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700/80 dark:bg-slate-900/40">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-white">
                      Stored resume
                    </span>
                  </div>
                  <p className="mb-4 line-clamp-4 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
                    {user.resumeText.slice(0, 280)}
                    {user.resumeText.length > 280 ? "…" : ""}
                  </p>
                  <Button
                    onClick={() => setShowModal(true)}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-sky-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg dark:from-blue-600 dark:to-sky-700"
                  >
                    Preview full resume
                  </Button>

                  {showModal && (
                    <ResumeViewer
                      resumeText={user.resumeText}
                      onClose={() => setShowModal(false)}
                    />
                  )}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-400">
                  No resume uploaded yet. Add one below.
                </p>
              )}

              <div className="mt-6 rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/30">
                <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Upload or update (PDF)
                </p>
                <ResumeUploader dataChanged={handleResumeTextSave} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
