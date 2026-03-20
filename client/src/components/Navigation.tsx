import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import {
  User,
  Building,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  Home,
  FilePlus,
  Briefcase,
  ClipboardList,
  LogIn,
  UserPlus,
  Users,
} from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Just get role + token from localStorage
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    setToken(localStorage.getItem("token"));
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setRole(null);
    setToken(null);
    navigate("/login");
  };

  // 🌐 Non-logged-in nav items
  const publicNavItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Sign In", path: "/login", icon: LogIn },
    { name: "Sign Up", path: "/register", icon: UserPlus },
  ];

  // 🎓 Student nav items
  const studentNavItems = [
    { name: "Dashboard", path: "/student/dashboard", icon: Home },
    { name: "Practice Interview", path: "/student/practice", icon: User },
    { name: "Study Rooms", path: "/student/rooms", icon: Users },
    { name: "Explore Jobs", path: "/student/jobs", icon: Building },
    {
      name: "Applications",
      path: "/student/applications",
      icon: ClipboardList,
    },
    { name: "Profile", path: "/student/profile", icon: User },
  ];

  // 🏢 Company nav items
  const companyNavItems = [
    { name: "Dashboard", path: "/company/dashboard", icon: Home },
    { name: "New Job", path: "/company/job/new", icon: FilePlus },
    { name: "Job Openings", path: "/company/jobs", icon: Briefcase },
    // {
    //   name: "Applications",
    //   path: "/company/applications",
    //   icon: ClipboardList,
    // },
    // { name: "Profile", path: "/company/profile", icon: User },
  ];

  let navItems = publicNavItems;
  if (token && role === "student") navItems = studentNavItems;
  if (token && role === "company") navItems = companyNavItems;

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-[#181A2A] border-b border-gray-200 dark:border-gray-700 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">IV</span>
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Intervion
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActivePath(item.path)
                      ? "bg-indigo-500 dark:bg-indigo-700 text-white shadow"
                      : "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-[#23263A]"
                  }`}
                >
                  <Icon size={16} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </Button>

            {token && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-9 h-9 text-red-500 hover:text-white hover:bg-red-500"
              >
                <LogOut size={16} />
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="w-9 h-9"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-[#181A2A] border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActivePath(item.path)
                      ? "bg-indigo-500 dark:bg-indigo-700 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-[#23263A]"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {token && (
              <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 mt-2 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full text-red-500 hover:text-white hover:bg-red-500"
                >
                  <LogOut size={16} className="mr-2" /> Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
