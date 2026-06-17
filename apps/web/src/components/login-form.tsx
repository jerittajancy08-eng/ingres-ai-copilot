"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { setToken } from "@/lib/auth";
import { Droplet, ArrowRight, Mail, Lock } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("admin@ingres.ai");
  const [password, setPassword] = useState("AdminPassword123!");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(undefined);
    try {
      if (mode === "register") {
        await api.register(email, password, "viewer");
      }
      const token = await api.login(email, password);
      setToken(token.access_token);
      setUser(token.user);
      router.push("/chat");
    } catch {
      setError(mode === "login" ? "Sign in failed. Register the account first or check credentials." : "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-500/20 to-cyan-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-teal-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden md:flex flex-col justify-center">
            <Link href="/" className="inline-flex items-center gap-3 mb-8 w-fit">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30">
                <Droplet className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-lg">INGRES AI</div>
                <div className="text-xs text-slate-500">Groundwater Copilot</div>
              </div>
            </Link>

            <div className="mt-8">
              <h2 className="text-5xl font-bold text-slate-900 mb-6">
                Groundwater intelligence at your fingertips
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Get instant, AI-powered answers about groundwater levels, recharge cycles, and borewell safety with real-time data and source citations.
              </p>

              <div className="space-y-4">
                {[
                  "AI-powered groundwater insights",
                  "Real-time data and citations",
                  "Multilingual support",
                  "Secure role-based access",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600">
                      <ArrowRight className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Auth Card */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <div className="rounded-2xl border border-white/50 bg-white/30 backdrop-blur-xl p-8 shadow-2xl shadow-slate-500/10">
                {/* Mobile Header */}
                <div className="md:hidden mb-8">
                  <Link href="/" className="inline-flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600">
                      <Droplet className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-bold text-slate-900">INGRES AI</span>
                  </Link>
                </div>

                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {mode === "login" ? "Welcome back" : "Create account"}
                  </h1>
                  <p className="text-slate-600">
                    {mode === "login"
                      ? "Sign in to access the groundwater copilot"
                      : "Join to start asking groundwater questions"}
                  </p>
                </div>

                <form className="space-y-4" onSubmit={(event) => void submit(event)}>
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200/50 bg-white/50 backdrop-blur text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200/50 bg-white/50 backdrop-blur text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="rounded-lg bg-red-50/50 border border-red-200/50 p-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-6 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2.5 text-base font-semibold text-white hover:shadow-lg hover:shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        {mode === "login" ? "Signing in..." : "Creating account..."}
                      </>
                    ) : (
                      <>
                        {mode === "login" ? "Sign in" : "Create account"}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Toggle Mode */}
                <div className="mt-6 text-center">
                  <p className="text-slate-600 text-sm mb-3">
                    {mode === "login"
                      ? "Don't have an account?"
                      : "Already have an account?"}
                  </p>
                  <button
                    onClick={() => {
                      setMode(mode === "login" ? "register" : "login");
                      setError(undefined);
                    }}
                    className="text-teal-600 hover:text-teal-700 font-semibold text-sm transition-colors"
                  >
                    {mode === "login"
                      ? "Create an officer account"
                      : "Use existing account"}
                  </button>
                </div>
              </div>

              {/* Demo Credentials */}
              <div className="mt-6 text-center text-xs text-slate-500">
                <p>Demo credentials:</p>
                <p className="mt-1">
                  <span className="font-mono">admin@ingres.ai</span>
                  <span className="mx-1">/</span>
                  <span className="font-mono">AdminPassword123!</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
