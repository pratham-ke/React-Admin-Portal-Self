import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // 🔒 Redux + API call will come later
    console.log("Forgot password email submitted:", email);
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

      {/* Forgot Password Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Logo + Heading */}
        <div className="flex flex-col items-center">
          <img
            src="/kernel-logo.png"
            alt="KernelEquity"
            className="w-52 mb-4"
          />
          <h2 className="text-center text-gray-800 font-semibold text-xl md:text-2xl">
            Forgot Password
          </h2>
          <div className="w-16 h-1 bg-green-700 rounded mt-2"></div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded border px-4 py-2 focus:outline-none focus:ring-2 text-gray-700
                ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-700"
                }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-green-700 text-white h-12 font-semibold shadow-md hover:bg-green-800 transition"
          >
            Send Reset Link
          </button>
        </form>

        {/* Back to Login */}
        <p className="text-sm text-gray-600 text-center mt-4">
          Remembered your password?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-green-700 hover:underline"
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
