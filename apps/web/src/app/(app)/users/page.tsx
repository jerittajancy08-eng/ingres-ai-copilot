import { RoleGuard } from "@/lib/auth-context";
import { UserManagement } from "@/components/users/user-management";

export default function UsersPage() {
  return (
    <RoleGuard minRole="admin">
      <UserManagement />
    </RoleGuard>
  );
}
