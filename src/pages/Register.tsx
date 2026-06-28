import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { Shield, Mail, Lock, User as UserIcon, AlertCircle, Loader2, ArrowRight, Check, X } from "lucide-react";
import { motion } from "motion/react";

export default function Register() {
  const { register, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Password Requirements State
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
    setLocalError(null);
  }, []);

  // Update password requirements checks live
  useEffect(() => {
    setPasswordCriteria({
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const calculateStrengthScore = () => {
    let score = 0;
    if (passwordCriteria.length) score += 20;
    if (passwordCriteria.uppercase) score += 20;
    if (passwordCriteria.lowercase) score += 20;
    if (passwordCriteria.number) score += 20;
    if (passwordCriteria.specialChar) score += 20;
    return score;
  };

  const getStrengthLabel = (score: number) => {
    if (score <= 40) return { text: "Weak Password", color: "bg-rose-500", textClass: "text-rose-500" };
    if (score <= 80) return { text: "Medium Security", color: "bg-amber-500", textClass: "text-amber-500" };
    return { text: "Strong Password", color: "bg-emerald-500", textClass: "text-emerald-500" };
  };

  const strength = getStrengthLabel(calculateStrengthScore());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const totalScore = calculateStrengthScore();
    if (totalScore < 100) {
      setLocalError("Please ensure your password satisfies all security requirements.");
      return;
    }

    if (!name || !email || !password) {
      setLocalError("All fields are required.");
      return;
    }

    setLocalLoading(true);
    setLocalError(null);
    clearError();

    try {
      await register(name, email, password, role);
    } catch (err: any) {
      setLocalError(err.response?.data?.error || "Registration failed. Email may already be in use.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left panel (Display info) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-900 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900 z-0"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-lg font-sans">
            <Shield className="w-6 h-6" />
            MERN SecureAuth Pro
          </div>
        </div>

        <div className="relative z-10 max-w-lg mb-12">
          <h2 className="text-4xl font-extrabold font-sans tracking-tight leading-tight">
            Comprehensive Encryption & Validation
          </h2>
          <p className="mt-4 text-slate-400 font-sans leading-relaxed text-sm">
            All passwords undergo a modern 12-round bcrypt hash before storing. Input values are automatically sanitized using robust server-side validators to defend against code injection exploits.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-mono">
          Defense System: Active | Node.js v18+ Compatible
        </div>
      </div>

      {/* Right form container */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 sm:px-12 md:px-20 py-12 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="text-left">
            <div className="flex items-center gap-2 lg:hidden text-indigo-600 font-bold mb-4">
              <Shield className="w-6 h-6" />
              MERN SecureAuth
            </div>
            <h1 className="text-3xl font-extrabold text-slate-950 font-sans tracking-tight">
              Create Account
            </h1>
            <p className="mt-2 text-sm text-slate-500 font-sans">
              Sign up today and experience secure enterprise-level authentication.
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {/* Error Display */}
            {(localError || error) && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-sans"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>{localError || error}</div>
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-900 rounded-xl text-sm font-sans placeholder-slate-400 outline-none transition duration-200 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-900 rounded-xl text-sm font-sans placeholder-slate-400 outline-none transition duration-200 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-900 rounded-xl text-sm font-sans placeholder-slate-400 outline-none transition duration-200 shadow-sm"
                  />
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2.5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-sans">
                      <span className="text-slate-500 font-medium">Password Strength:</span>
                      <span className={`font-semibold ${strength.textClass}`}>{strength.text}</span>
                    </div>
                    {/* Track bar */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${calculateStrengthScore()}%` }}
                      ></div>
                    </div>

                    {/* Requirements checklist */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1.5 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-[10px] font-sans">
                        {passwordCriteria.length ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        )}
                        <span className={passwordCriteria.length ? "text-emerald-700" : "text-slate-500"}>
                          At least 6 characters
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-sans">
                        {passwordCriteria.uppercase ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        )}
                        <span className={passwordCriteria.uppercase ? "text-emerald-700" : "text-slate-500"}>
                          An uppercase letter
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-sans">
                        {passwordCriteria.lowercase ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        )}
                        <span className={passwordCriteria.lowercase ? "text-emerald-700" : "text-slate-500"}>
                          A lowercase letter
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-sans">
                        {passwordCriteria.number ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        )}
                        <span className={passwordCriteria.number ? "text-emerald-700" : "text-slate-500"}>
                          At least one number
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-sans col-span-2">
                        {passwordCriteria.specialChar ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        )}
                        <span className={passwordCriteria.specialChar ? "text-emerald-700" : "text-slate-500"}>
                          A symbol (!@#$%^&* etc.)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select User Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2.5 border rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                      role === "user"
                        ? "bg-indigo-50 border-indigo-600 text-indigo-700 ring-1 ring-indigo-600"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Standard User
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2.5 border rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                      role === "admin"
                        ? "bg-rose-50 border-rose-600 text-rose-700 ring-1 ring-rose-600"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Administrator
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400 leading-normal font-sans">
                  Choose Administrator to test admin features, such as viewing and deleting tasks created by all registered users.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={localLoading}
              className="flex items-center justify-center w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium text-sm rounded-xl transition duration-200 shadow-sm"
            >
              {localLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Hashing Securely...
                </>
              ) : (
                <>
                  Register Securely
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Redirect to Login */}
          <p className="mt-6 text-center text-xs text-slate-500 font-sans">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition"
            >
              Sign in securely
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
