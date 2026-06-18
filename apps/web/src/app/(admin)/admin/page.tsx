import { UserManagement } from "@/components/users/user-management";
import { RoleGuard } from "@/lib/auth-context";

export default function AdminPage() {
  return (
    <RoleGuard minRole="admin">
      <UserManagement />
    </RoleGuard>
  );
}
