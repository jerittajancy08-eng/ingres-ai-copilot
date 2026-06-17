import { AdminAnalytics } from "@/components/dashboard/admin-analytics";
import { RoleGuard } from "@/lib/auth-context";

export default function AnalyticsPage() {
  return (
    <RoleGuard minRole="admin">
      <AdminAnalytics />
    </RoleGuard>
  );
}
