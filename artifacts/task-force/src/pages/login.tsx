import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Bot } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isLoading && user) setLocation("/");
  }, [user, isLoading, setLocation]);

  const loginMutation = useLogin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/");
      },
      onError: () => {
        setErrorMsg("Invalid username or password. Try alice, bob, or charlie with password: test123");
      },
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Please enter both username and password.");
      return;
    }
    loginMutation.mutate({ data: { username: username.trim(), password } });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="w-8 h-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4">

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <Bot className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Jarvis</h1>
        </div>
        <p className="text-slate-400 text-sm">Plan. Collaborate. Achieve.</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Welcome back</h2>
        <p className="text-sm text-slate-400 mb-6">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-sm font-medium text-slate-700">Username</label>
            <input
              id="username"
              placeholder="e.g. alice"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-full transition-colors flex items-center justify-center gap-2"
          >
            {loginMutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in…
              </>
            ) : "Sign in"}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center font-medium mb-2">Demo credentials</p>
          <div className="grid grid-cols-3 gap-2">
            {["alice", "bob", "charlie"].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => { setUsername(name); setPassword("test123"); }}
                className="text-xs py-1.5 px-2 rounded-full bg-slate-50 hover:bg-teal-50 hover:text-teal-700 transition-colors text-slate-500 border border-slate-100"
              >
                {name}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center mt-2">password: test123</p>
        </div>
      </div>
    </div>
  );
}
