"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BarChart3, Bot, Droplets, Files, LogOut, Map, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearToken } from "@/lib/auth";

const nav = [
  { href: "/chat", label: "Copilot", icon: Bot },
  { href: "/documents", label: "Documents", icon: Files },
  { href: "/dashboard", label: "Dashboard", icon: Droplets },
  { href: "/map", label: "Map", icon: Map },
  { href: "/admin", label: "Admin", icon: BarChart3 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  function signOut() {
    clearToken();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card p-4 lg:block">
        <Link href="/chat" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">INGRES AI</p>
            <p className="text-xs text-muted-foreground">Groundwater Copilot</p>
          </div>
        </Link>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => (
            <Button key={item.href} variant="ghost" asChild className="w-full justify-start">
              <Link href={item.href}>
                <item.icon className="size-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
        <Button variant="ghost" className="absolute bottom-4 left-4 right-4 justify-start" onClick={signOut}>
          <LogOut className="size-4" />
          Sign out
        </Button>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-card/95 px-4 backdrop-blur">
          <Link href="/chat" className="text-sm font-semibold">INGRES AI Copilot</Link>
          <div className="flex gap-1 lg:hidden">
            {nav.map((item) => (
              <Button key={item.href} variant="ghost" asChild className="px-2" aria-label={item.label}>
                <Link href={item.href}>
                  <item.icon className="size-4" />
                </Link>
              </Button>
            ))}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
