"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function tabClass(active) {
  return active
    ? "rounded-full bg-teal px-4 py-2 text-sm font-display font-semibold text-white"
    : "rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-display font-semibold text-ink-muted hover:border-teal hover:text-teal";
}

export default function AdminTabs() {
  const pathname = usePathname();
  const isPortfolio = pathname?.startsWith("/admin/portfolio");
  const isRequests = pathname?.startsWith("/admin/requests");
  const isSettings = pathname?.startsWith("/admin/settings");

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <Link href="/admin/portfolio" className={tabClass(isPortfolio)}>
        Кейсы
      </Link>
      <Link href="/admin/requests" className={tabClass(isRequests)}>
        Заявки
      </Link>
      <Link href="/admin/settings" className={tabClass(isSettings)}>
        Главная
      </Link>
    </div>
  );
}
