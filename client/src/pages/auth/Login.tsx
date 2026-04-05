import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Building, Mail, Lock, Eye, EyeOff } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";

const Login = () => {
  const [role, setRole] = useState<"student" | "company" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      toast({
        title: "Role Required",
        description: "Please select whether you are a Student or Company",
        variant: "destructive",
      });
      return;
    }

    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await axiosInstance.post("/auth/login", {
        email,
        password,
        role,
      });

      setLoading(false);

      toast({
        title: "Login Successful",
        description: "Welcome back to Intervion!",
      });

      // Save token in localStorage (optional)
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      navigate(
        res.data.role === "student"
          ? "/student/dashboard"
          : "/company/dashboard"
      );
    } catch (err: any) {
      setLoading(false);

      toast({
        title: "Login Failed",
        description: err.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleOAuthLogin = (provider: "google" | "linkedin") => {
    if (!role) {
      toast({
        title: "Role Required",
        description: "Please select your role before continuing with OAuth",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `${provider} Login`,
      description: "OAuth integration coming soon!",
    });
  };

  return (
    <AuthPageLayout>
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-600 shadow-lg shadow-blue-500/25 dark:shadow-blue-900/40">
            <span className="text-2xl font-bold text-white">IV</span>
          </div>
          <h1 className="bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-400 dark:to-sky-400">
            Intervion
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Sign in and pick up where you left off
          </p>
        </div>

        <Card className="rounded-2xl border border-stone-200/80 bg-white/90 shadow-2xl shadow-stone-900/10 backdrop-blur-xl dark:border-stone-700/60 dark:bg-[#1e293b]/92 dark:shadow-black/40">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-center text-2xl text-stone-900 dark:text-stone-50">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-stone-600 dark:text-stone-400">
              Choose your role, then sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-stone-900 dark:text-stone-50">
                I am a:
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={role === "student" ? "default" : "outline"}
                  className={`h-16 flex-col space-y-2 rounded-xl border-stone-200 dark:border-stone-600 ${
                    role === "student"
                      ? "border-transparent bg-blue-500 text-white shadow-md shadow-blue-500/20 dark:bg-blue-600"
                      : "bg-stone-100 text-stone-800 dark:bg-stone-800/80 dark:text-stone-100"
                  }`}
                  onClick={() => setRole("student")}
                >
                  <User size={20} />
                  <span>Student</span>
                </Button>
                <Button
                  type="button"
                  variant={role === "company" ? "default" : "outline"}
                  className={`h-16 flex-col space-y-2 rounded-xl border-stone-200 dark:border-stone-600 ${
                    role === "company"
                      ? "border-transparent bg-sky-600 text-white shadow-md shadow-sky-600/20 dark:bg-sky-600"
                      : "bg-stone-100 text-stone-800 dark:bg-stone-800/80 dark:text-stone-100"
                  }`}
                  onClick={() => setRole("company")}
                >
                  <Building size={20} />
                  <span>Company</span>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-stone-900 dark:text-stone-50"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400 dark:text-stone-500"
                    aria-hidden
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-stone-200 bg-white/90 pl-10 text-stone-900 placeholder:text-stone-400 focus-visible:ring-blue-500/30 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-50 dark:placeholder:text-stone-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-stone-900 dark:text-stone-50"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400 dark:text-stone-500"
                    aria-hidden
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-stone-200 bg-white/90 pl-10 pr-10 text-stone-900 placeholder:text-stone-400 focus-visible:ring-blue-500/30 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-50 dark:placeholder:text-stone-500"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 p-0 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-sky-600 text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl dark:from-blue-600 dark:to-sky-700 dark:shadow-blue-900/30"
                size="lg"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <Separator />

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl border-stone-200 bg-stone-50/90 text-stone-800 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800/60 dark:text-stone-100 dark:hover:bg-stone-800"
                onClick={() => handleOAuthLogin("google")}
                disabled={!role}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl border-stone-200 bg-stone-50/90 text-stone-800 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800/60 dark:text-stone-100 dark:hover:bg-stone-800"
                onClick={() => handleOAuthLogin("linkedin")}
                disabled={!role}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Continue with LinkedIn
              </Button>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 underline-offset-4 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Create one
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthPageLayout>
  );
};

export default Login;
