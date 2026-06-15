import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
      // The context handles navigation on success and toast on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Left side: Premium Image/Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800/80 to-slate-900 z-10 opacity-90"></div>
        <img
          src="/premium_abstract_bg.png"
          alt="Abstract Background"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
        />
        <div className="relative z-20 p-12 text-center text-white flex flex-col items-center">
          <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(0,200,155,0.4)]">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to Cholo Admin</h1>
          <p className="text-slate-300 text-lg max-w-md">Manage your transit operations securely and efficiently from one powerful dashboard.</p>
        </div>
      </div>

      {/* Right side: Modern Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white/50 backdrop-blur-3xl">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className="lg:hidden w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Sign in</h2>
            <p className="text-slate-500 mt-2">Enter your details to access the dashboard.</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Email address</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_4px_14px_0_rgba(0,200,155,0.39)] text-base font-semibold text-white bg-black hover:bg-black/80 hover:shadow-[0_6px_20px_rgba(0,200,155,0.23)] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
