import { DocumentUpload } from "@/components/dashboard/document-upload";
import { RoleGuard } from "@/lib/auth-context";

export default function ReindexPage() {
  return (
    <RoleGuard minRole="admin">
      <DocumentUpload />
    </RoleGuard>
  );
}
