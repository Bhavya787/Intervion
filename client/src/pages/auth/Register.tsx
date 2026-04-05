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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Building,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";

const Register = () => {
  const [role, setRole] = useState<"student" | "company" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    education: "",
    skills: "",
    industry: "",
    roleOffered: "",
    companySize: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      toast({
        title: "Role Required",
        description: "Please select whether you are a Student or Company",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Please ensure both password fields match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/register", {
        ...formData,
        role,
      });
      const data = res.data;

      // Save token to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);

      toast({
        title: "Registration Successful",
        description: `Welcome to Intervion! Setting up your ${role} account...`,
      });

      navigate(
        role === "student" ? "/student/dashboard" : "/company/dashboard"
      );
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <div className="w-full max-w-2xl space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-600 shadow-lg shadow-blue-500/25 dark:shadow-blue-900/40">
            <span className="text-2xl font-bold text-white">IV</span>
          </div>
          <h1 className="bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-400 dark:to-sky-400">
            Join Intervion
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            One account — practice, apply, and grow
          </p>
        </div>

        <Card className="rounded-2xl border border-stone-200/80 bg-white/90 shadow-2xl shadow-stone-900/10 backdrop-blur-xl dark:border-stone-700/60 dark:bg-[#1e293b]/92 dark:shadow-black/40">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-center text-2xl text-stone-900 dark:text-stone-50">
              Create account
            </CardTitle>
            <CardDescription className="text-center text-stone-600 dark:text-stone-400">
              Pick a role — we&apos;ll tailor your dashboard
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
                  className={`h-20 flex-col space-y-2 rounded-xl border-stone-200 dark:border-stone-600 ${
                    role === "student"
                      ? "border-transparent bg-blue-500 text-white shadow-md shadow-blue-500/20 dark:bg-blue-600"
                      : "bg-stone-100 text-stone-800 dark:bg-stone-800/80 dark:text-stone-100"
                  }`}
                  onClick={() => setRole("student")}
                >
                  <User size={24} />
                  <div className="text-center">
                    <span className="block font-medium">Student</span>
                    <span className="text-xs opacity-90">
                      Looking for opportunities
                    </span>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={role === "company" ? "default" : "outline"}
                  className={`h-20 flex-col space-y-2 rounded-xl border-stone-200 dark:border-stone-600 ${
                    role === "company"
                      ? "border-transparent bg-sky-600 text-white shadow-md shadow-sky-600/20 dark:bg-sky-600"
                      : "bg-stone-100 text-stone-800 dark:bg-stone-800/80 dark:text-stone-100"
                  }`}
                  onClick={() => setRole("company")}
                >
                  <Building size={24} />
                  <div className="text-center">
                    <span className="block font-medium">Company</span>
                    <span className="text-xs opacity-90">Hiring talent</span>
                  </div>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-stone-900 dark:text-stone-50"
                  >
                    {role === "company" ? "Company Name" : "Full Name"}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={
                      role === "company"
                        ? "Enter company name"
                        : "Enter your full name"
                    }
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="rounded-lg border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-blue-500/30 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-50 dark:placeholder:text-stone-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-stone-900 dark:text-stone-50"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400 dark:text-stone-500"
                      aria-hidden
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="rounded-lg border-stone-200 bg-white/90 pl-10 text-stone-900 placeholder:text-stone-400 focus-visible:ring-blue-500/30 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-50 dark:placeholder:text-stone-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="Create password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="rounded-lg border-stone-200 bg-white/90 pl-10 pr-10 text-stone-900 placeholder:text-stone-400 focus-visible:ring-blue-500/30 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-50 dark:placeholder:text-stone-500"
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

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-stone-900 dark:text-stone-50"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400 dark:text-stone-500"
                      aria-hidden
                    />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className="rounded-lg border-stone-200 bg-white/90 pl-10 pr-10 text-stone-900 placeholder:text-stone-400 focus-visible:ring-blue-500/30 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-50 dark:placeholder:text-stone-500"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 p-0 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Role-specific fields */}
              {role === "student" && (
                <div className="space-y-4 rounded-xl border border-blue-200/80 bg-blue-50/90 p-4 dark:border-blue-800/50 dark:bg-blue-950/35">
                  <div className="flex items-center gap-2 font-medium text-blue-800 dark:text-blue-200">
                    <GraduationCap size={16} />
                    Student Information
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="education"
                      className="text-stone-900 dark:text-stone-50"
                    >
                      Education Background
                    </Label>
                    <Input
                      id="education"
                      type="text"
                      placeholder="e.g., Computer Science, Stanford University"
                      value={formData.education}
                      onChange={(e) =>
                        handleInputChange("education", e.target.value)
                      }
                      className="rounded-lg border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-blue-500/30 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-50 dark:placeholder:text-stone-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="skills"
                      className="text-stone-900 dark:text-stone-50"
                    >
                      Skills (Optional)
                    </Label>
                    <Textarea
                      id="skills"
                      placeholder="e.g., React, Node.js, Python, Machine Learning..."
                      value={formData.skills}
                      onChange={(e) =>
                        handleInputChange("skills", e.target.value)
                      }
                      rows={3}
                      className="rounded-lg border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-blue-500/30 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-50 dark:placeholder:text-stone-500"
                    />
                  </div>
                </div>
              )}

              {role === "company" && (
                <div className="space-y-4 rounded-xl border border-sky-200/80 bg-sky-50/90 p-4 dark:border-sky-800/50 dark:bg-sky-950/30">
                  <div className="flex items-center gap-2 font-medium text-sky-900 dark:text-sky-200">
                    <Briefcase size={16} />
                    Company Information
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="industry"
                        className="text-stone-900 dark:text-stone-50"
                      >
                        Industry
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          handleInputChange("industry", value)
                        }
                        required
                      >
                        <SelectTrigger className="rounded-lg border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-blue-500/30 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-50 dark:placeholder:text-stone-500">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="manufacturing">
                            Manufacturing
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="companySize"
                        className="text-stone-900 dark:text-stone-50"
                      >
                        Company Size
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          handleInputChange("companySize", value)
                        }
                        required
                      >
                        <SelectTrigger className="rounded-lg border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-blue-500/30 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-50 dark:placeholder:text-stone-500">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">
                            51-200 employees
                          </SelectItem>
                          <SelectItem value="201-1000">
                            201-1000 employees
                          </SelectItem>
                          <SelectItem value="1000+">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="roleOffered"
                      className="text-stone-900 dark:text-stone-50"
                    >
                      Primary Role You're Hiring For
                    </Label>
                    <Input
                      id="roleOffered"
                      type="text"
                      placeholder="e.g., Software Engineer, Product Manager"
                      value={formData.roleOffered}
                      onChange={(e) =>
                        handleInputChange("roleOffered", e.target.value)
                      }
                      className="rounded-lg border-stone-200 bg-white/90 text-stone-900 placeholder:text-stone-400 focus-visible:ring-blue-500/30 dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-50 dark:placeholder:text-stone-500"
                      required
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-sky-600 text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl disabled:opacity-60 dark:from-blue-600 dark:to-sky-700 dark:shadow-blue-900/30"
                size="lg"
                disabled={loading || !role}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 underline-offset-4 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthPageLayout>
  );
};

export default Register;
