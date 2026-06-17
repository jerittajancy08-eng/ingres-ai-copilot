import { Card } from "@/components/ui/card";
import { RoleGuard } from "@/lib/auth-context";

export default function SettingsPage() {
  return (
    <RoleGuard minRole="super_admin">
      <section className="p-4 md:p-6">
        <Card className="p-5">
          <h1 className="text-base font-semibold">System Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">Super admin configuration area.</p>
        </Card>
      </section>
    </RoleGuard>
  );
}
