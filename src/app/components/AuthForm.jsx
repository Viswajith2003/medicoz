"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Sparkles } from "lucide-react";

/* ── animation variants ─────────────────────────────────────────────── */
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const slideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const formVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: (dir) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeIn" },
  }),
};

/* ── reusable input field ─────────────────────────────────────────────── */
const InputField = ({ label, type, placeholder, value, onChange, icon: Icon }) => {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === "password";

  return (
    <motion.div
      className="flex flex-col gap-1"
      whileFocus={{ scale: 1.01 }}
    >
      {label && (
        <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#6ee867] transition-colors duration-200"
          />
        )}
        <input
          type={isPassword ? (showPass ? "text" : "password") : type}
          className="w-full bg-[#0d0e11] border border-gray-700/60 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm
                     focus:outline-none focus:border-[#6ee867]/60 focus:ring-1 focus:ring-[#6ee867]/30
                     transition-all duration-200 group-hover:border-gray-600"
          style={{ paddingLeft: Icon ? "2.5rem" : "1rem" }}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </motion.div>
  );
};

/* ── main component ──────────────────────────────────────────────────── */
const AuthPage = ({ onSignIn }) => {
  const [isLogin, setIsLogin] = useState(false); // false = Sign In, true = Create Account
  const [direction, setDirection] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const switchMode = (to) => {
    if (to === isLogin) return;
    setDirection(to ? 1 : -1);
    setIsLogin(to);
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000"}/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        onSignIn();
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000"}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, lastName, email, password }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setError("");
        alert(data.message);
        switchMode(false);
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-[#0d0e11] flex flex-col lg:flex-row items-center justify-center overflow-auto"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Left Panel ── */}
      <motion.div
        className="w-full lg:w-1/2 flex flex-col items-center lg:items-start justify-center
                   px-6 sm:px-12 lg:px-20 xl:px-28 py-10 lg:py-0 lg:min-h-screen"
        variants={slideUp}
      >
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 bg-[#6ee867]/10 border border-[#6ee867]/30 rounded-full px-4 py-1.5 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Sparkles size={14} className="text-[#6ee867]" />
          <span className="text-[#6ee867] text-xs font-semibold tracking-wide">
            AI-Powered Healthcare
          </span>
        </motion.div>

        <h1 className="text-white text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold
                       leading-tight text-center lg:text-left mb-4">
          AI Enhanced{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6ee867] to-[#3dd68c]">
            Medical
          </span>
          <br />
          ChatBot
        </h1>

        <p className="text-gray-400 text-sm sm:text-base text-center lg:text-left mb-8 max-w-md leading-relaxed">
          <span className="text-[#6ee867] font-semibold">MediCoz:</span> Your
          Trusted Partner in Smart,{" "}
          <br className="hidden sm:block" />
          Seamless Healthcare.
        </p>

        {/* Feature chips */}
        <motion.div
          className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {["24/7 Support", "Symptom Analysis", "Medication Guide", "Health Tracking"].map(
            (tag) => (
              <span
                key={tag}
                className="text-xs text-gray-400 bg-gray-800/60 border border-gray-700/50 rounded-full px-3 py-1"
              >
                {tag}
              </span>
            )
          )}
        </motion.div>

        <motion.div
          className="w-full max-w-sm lg:max-w-md"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <img
            src="/welcome.png"
            className="w-full h-auto object-contain drop-shadow-[0_0_40px_rgba(110,232,103,0.15)]"
            alt="Medicine Illustration"
          />
        </motion.div>
      </motion.div>

      {/* ── Right Panel (Auth Card) ── */}
      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center
                   px-4 sm:px-8 py-10 lg:min-h-screen"
        variants={fadeIn}
      >
        <div className="w-full max-w-md">
          {/* Glassmorphism card */}
          <motion.div
            className="relative bg-[#131619]/80 backdrop-blur-xl border border-gray-700/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            {/* Subtle glow orb */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#6ee867]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[#6ee867]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Logo */}
            <motion.div
              className="flex justify-center items-center gap-2 mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <img src="/logo.png" alt="Logo" className="w-9 h-9" />
              <span className="text-white text-xl font-bold tracking-tight">
                MediCoz
              </span>
            </motion.div>

            {/* Tab switcher */}
            <div className="flex bg-[#0d0e11] rounded-xl p-1 mb-6 relative">
              <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-[#6ee867]/80 to-[#3dd68c]/80 rounded-lg shadow-lg"
                animate={{ left: isLogin ? "calc(50% + 2px)" : "4px" }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
              {[
                { label: "Sign In", value: false },
                { label: "Create Account", value: true },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  className={`relative z-10 flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors duration-200
                              ${isLogin === value ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                  onClick={() => switchMode(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Animated form */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                {isLogin ? (
                  /* ── Register Form ── */
                  <motion.form
                    key="register"
                    custom={direction}
                    variants={formVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-4"
                    onSubmit={handleRegister}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InputField
                        label="First name"
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        icon={User}
                      />
                      <InputField
                        label="Last name"
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        icon={User}
                      />
                    </div>
                    <InputField
                      label="Email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      icon={Mail}
                    />
                    <InputField
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      icon={Lock}
                    />
                    <label className="flex items-start gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="mt-0.5 rounded border-gray-600 bg-[#0d0e11] accent-[#6ee867]"
                      />
                      <span className="text-gray-400 text-xs leading-relaxed group-hover:text-gray-300 transition-colors">
                        I agree to the{" "}
                        <span className="text-[#6ee867] underline underline-offset-2">
                          Terms & Conditions
                        </span>{" "}
                        and{" "}
                        <span className="text-[#6ee867] underline underline-offset-2">
                          Privacy Policy
                        </span>
                      </span>
                    </label>

                    {error && (
                      <motion.p
                        className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {error}
                      </motion.p>
                    )}

                    <motion.button
                      className="w-full bg-gradient-to-r from-[#6ee867] to-[#3dd68c] text-[#0d0e11] font-semibold
                                 rounded-xl py-3 text-sm shadow-lg shadow-[#6ee867]/20
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02, shadow: "0 0 30px rgba(110,232,103,0.3)" }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Creating account…
                        </span>
                      ) : (
                        "Create Free Account"
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  /* ── Sign In Form ── */
                  <motion.form
                    key="signin"
                    custom={direction}
                    variants={formVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-4"
                    onSubmit={handleLogin}
                  >
                    {/* Social buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { img: "/google.png", label: "Google" },
                        { img: "/apple.png", label: "Apple" },
                      ].map(({ img, label }) => (
                        <motion.button
                          key={label}
                          type="button"
                          className="flex items-center justify-center gap-2 bg-[#0d0e11] border border-gray-700/60
                                     text-white text-sm rounded-xl py-2.5 px-3
                                     hover:border-gray-500 hover:bg-gray-800/40 transition-all duration-200"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <img src={img} alt={label} className="w-5 h-5 object-contain" />
                          <span className="text-sm">{label}</span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="relative flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-700/50" />
                      <span className="text-gray-500 text-xs">or sign in with email</span>
                      <div className="flex-1 h-px bg-gray-700/50" />
                    </div>

                    <InputField
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      icon={Mail}
                    />
                    <InputField
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      icon={Lock}
                    />

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-[#6ee867] text-xs hover:underline underline-offset-2 transition-all"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {error && (
                      <motion.p
                        className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {error}
                      </motion.p>
                    )}

                    <motion.button
                      className="w-full bg-gradient-to-r from-[#6ee867] to-[#3dd68c] text-[#0d0e11] font-semibold
                                 rounded-xl py-3 text-sm shadow-lg shadow-[#6ee867]/20
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Signing in…
                        </span>
                      ) : (
                        "Sign In With MediCoz"
                      )}
                    </motion.button>

                    <p className="text-gray-500 text-xs text-center leading-relaxed">
                      By signing in, you agree to our{" "}
                      <span className="text-gray-400 underline underline-offset-2 cursor-pointer hover:text-[#6ee867] transition-colors">
                        Terms of Service
                      </span>{" "}
                      and{" "}
                      <span className="text-gray-400 underline underline-offset-2 cursor-pointer hover:text-[#6ee867] transition-colors">
                        Privacy Policy
                      </span>
                      .
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Bottom note */}
          <motion.p
            className="text-center text-gray-600 text-xs mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            © 2025 MediCoz — Empowering smarter healthcare
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthPage;
