"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function tabClass(active) {
  return active
    ? "rounded-full bg-[#6366f1] px-4 py-2 text-sm font-display font-semibold text-white"
    : "rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-display font-semibold text-[#9ca3af] hover:border-[#6366f1]/20 hover:text-white";
}

export default function AdminTabs() {
  const pathname = usePathname();
  const isPortfolio = pathname?.startsWith("/admin/portfolio");
  const isRequests = pathname?.startsWith("/admin/requests");

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <Link href="/admin/portfolio" className={tabClass(isPortfolio)}>
        Кейсы
      </Link>
      <Link href="/admin/requests" className={tabClass(isRequests)}>
        Заявки
      </Link>
    </div>
  );
}
