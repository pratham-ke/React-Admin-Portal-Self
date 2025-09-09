import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { login } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux state for login
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // 🔹 Custom form validation
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await dispatch(login({ email, password }));

    if (login.fulfilled.match(result)) {
      navigate("/dashboard"); // ✅ redirect on success
    }
  };

  return (
    <div
      className="min-h-screen w-screen relative flex items-center justify-center overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/group-bg.png')" }}
    >
      {/* Left & Right Decorative Images */}
      <img
        src="/login-left.png"
        alt="left"
        className="hidden md:block absolute left-0 top-0 h-5/6 object-contain pointer-events-none"
      />
      <img
        src="/login-right.png"
        alt="right"
        className="hidden md:block absolute right-0 top-0 h-1/3 object-contain pointer-events-none"
      />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Logo + Heading */}
        <div className="flex flex-col items-center">
          <img
            src="/kernel-logo.png"
            alt="KernelEquity"
            className="w-52 mb-4"
          />
          <h2 className="text-center text-gray-800 font-semibold text-xl md:text-2xl">
            Welcome To Kernelequity
          </h2>
          <div className="w-16 h-1 bg-green-700 rounded mt-2"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Username</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded px-4 py-2 focus:outline-none focus:ring-2 text-gray-700 ${
                errors.email || error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-green-700"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded px-4 py-2 pr-10 focus:outline-none focus:ring-2 text-gray-700 ${
                  errors.password || error
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-700"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Error from backend */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Remember Me + Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-700"
              />
              <span className="text-gray-600">Remember Me</span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-gray-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-700 text-white h-12 font-semibold shadow-md hover:bg-green-800 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
