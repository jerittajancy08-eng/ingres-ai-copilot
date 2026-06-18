"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { FileText, MessageSquare, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Analytics } from "@/types/api";

const fallback: Analytics = {
  total_users: 0,
  admin_count: 0,
  regular_user_count: 0,
  total_conversations: 0,
  total_documents: 0,
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <AdminMetric title="Total Users" value={analytics.total_users} icon={<Users className="size-5" />} />
        <AdminMetric title="Admin Users" value={analytics.admin_count} icon={<Users className="size-5" />} />
        <AdminMetric title="Regular Users" value={analytics.regular_user_count} icon={<Users className="size-5" />} />
        <AdminMetric title="Conversations" value={analytics.total_conversations} icon={<MessageSquare className="size-5" />} />
        <AdminMetric title="Documents" value={analytics.total_documents} icon={<FileText className="size-5" />} />
      </div>
    </section>
  );
}

function AdminMetric({ title, value, icon }: { title: string; value: number | undefined; icon: ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between text-muted-foreground">
        <p className="text-sm">{title}</p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-semibold">{typeof value === "number" ? value.toLocaleString() : "—"}</p>
    </Card>
  );
}
