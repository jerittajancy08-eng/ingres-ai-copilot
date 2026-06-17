import { GroundwaterDashboard } from "@/components/dashboard/groundwater-dashboard";
import { RoleGuard } from "@/lib/auth-context";

export default function DashboardPage() {
  return (
    <RoleGuard minRole="admin">
      <GroundwaterDashboard />
    </RoleGuard>
  );
}
