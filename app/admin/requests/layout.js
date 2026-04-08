import { cookies } from "next/headers";

import AdminPasswordGate from "@/components/admin/AdminPasswordGate";

export default async function AdminRequestsLayout({ children }) {
  const c = (await cookies()).get("admin_session");

  if (!c?.value) {
    return (
      <main className="min-h-screen bg-[#050508] pt-28 pb-24">
        <AdminPasswordGate />
      </main>
    );
  }

  return children;
}
