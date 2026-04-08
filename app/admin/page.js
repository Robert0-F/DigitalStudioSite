import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminPasswordGate from "@/components/admin/AdminPasswordGate";

export default async function AdminPage() {
  const c = (await cookies()).get("admin_session");
  if (!c?.value) {
    return (
      <main className="min-h-screen bg-[#050508] pt-28 pb-24">
        <AdminPasswordGate />
      </main>
    );
  }

  // Old legacy admin UI is intentionally removed.
  // Route `/admin` now forwards to the portfolio admin.
  redirect("/admin/portfolio");
}

