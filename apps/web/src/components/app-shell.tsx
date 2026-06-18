"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BarChart3, Bot, LogOut, Users, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canAccessRole, useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/types/api";

const baseNav = [
  { href: "/chat", label: "Copilot", icon: Bot, minRole: "user" },
] satisfies Array<{ href: string; label: string; icon: typeof Bot; minRole: UserRole }>;

const adminNav = [
  { href: "/documents", label: "Documents", icon: FileText, minRole: "admin" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, minRole: "admin" },
  { href: "/admin", label: "User Management", icon: Users, minRole: "admin" },
] satisfies Array<{ href: string; label: string; icon: typeof Bot; minRole: UserRole }>;

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoading, logout, user } = useAuth();
  
  // Build nav based on user role
  const nav = user?.role === "admin" ? [...baseNav, ...adminNav] : baseNav;
  const visibleNav = isLoading ? baseNav : nav;

  async function signOut() {
    await logout();
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
          {visibleNav.map((item) => (
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
            {visibleNav.map((item) => (
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
