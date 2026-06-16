"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { FileText, MessageSquare, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Analytics } from "@/types/api";

const fallback: Analytics = {
  active_users: 1240,
  conversations: 8950,
  documents_indexed: 312,
  top_languages: [
    { language: "Kannada", count: 4300 },
    { language: "English", count: 2700 },
    { language: "Hindi", count: 1200 },
  ],
};

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(fallback);

  useEffect(() => {
    api.analytics().then(setAnalytics).catch(() => setAnalytics(fallback));
  }, []);

  return (
    <section className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Analytics</h1>
        <p className="text-sm text-muted-foreground">Usage, document coverage, and language adoption across INGRES AI.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <AdminMetric title="Active Users" value={analytics.active_users} icon={<Users className="size-5" />} />
        <AdminMetric title="Conversations" value={analytics.conversations} icon={<MessageSquare className="size-5" />} />
        <AdminMetric title="Documents Indexed" value={analytics.documents_indexed} icon={<FileText className="size-5" />} />
      </div>
      <Card className="p-4">
        <h2 className="mb-4 text-sm font-semibold">Top Languages</h2>
        <div className="space-y-3">
          {analytics.top_languages.map((item) => (
            <div key={item.language}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{item.language}</span>
                <span>{item.count}</span>
              </div>
              <div className="h-2 rounded bg-muted">
                <div className="h-2 rounded bg-primary" style={{ width: `${Math.min(100, item.count / 50)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function AdminMetric({ title, value, icon }: { title: string; value: number; icon: ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between text-muted-foreground">
        <p className="text-sm">{title}</p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-semibold">{value.toLocaleString()}</p>
    </Card>
  );
}
