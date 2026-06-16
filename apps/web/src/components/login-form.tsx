"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("officer@ingres.ai");
  const [password, setPassword] = useState("password123");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(undefined);
    try {
      if (mode === "register") {
        await api.register(email, password, "officer");
      }
      const token = await api.login(email, password);
      setToken(token.access_token);
      router.push("/chat");
    } catch {
      setError(mode === "login" ? "Sign in failed. Register the account first or check credentials." : "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">INGRES AI Copilot</h1>
          <p className="mt-1 text-sm text-muted-foreground">Secure access for citizens, field teams, and administrators.</p>
        </div>
        <form className="space-y-4" onSubmit={(event) => void submit(event)}>
          <Input type="email" placeholder="Email address" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={isLoading}>
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <Button className="mt-3 w-full" variant="ghost" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Create an officer account" : "Use existing account"}
        </Button>
      </Card>
    </main>
  );
}
