import Link from "next/link";
import { ArrowRight, Database, FileSearch, Globe2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </div>
          <span className="font-semibold">INGRES AI Copilot</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/chat">
              Open Copilot
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </header>
      <section className="grid min-h-[calc(100vh-4rem)] items-center gap-8 px-4 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Groundwater intelligence platform</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">INGRES AI Copilot</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            A multilingual AI assistant for citizens, farmers, and government officers to ask groundwater questions,
            retrieve trusted documents, review alerts, and make field decisions faster.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/chat">Start Chat</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4">
          {[
            { title: "RAG With Citations", icon: FileSearch, text: "Answers reference uploaded groundwater advisories and local knowledge." },
            { title: "Multilingual Access", icon: Globe2, text: "Designed for English and Indian-language interactions across user groups." },
            { title: "Operational Data", icon: Database, text: "Dashboards, maps, and analytics support government-grade workflows." },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border bg-card p-5 shadow-sm">
              <item.icon className="size-5 text-primary" />
              <h2 className="mt-3 text-base font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
