"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function AdminPasswordGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Неверный пароль");
      }

      // Cookie выставится на сервере; перезагрузим страницу для входа.
      window.location.reload();
    } catch (e) {
      setError(e?.message || "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="mx-auto w-full max-w-md glass-strong rounded-3xl border border-white/[0.06] p-6 sm:p-8">
        <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
          Админ-панель
        </p>
        <h1 className="heading-md mb-6 font-display font-bold text-white">
          Введите пароль
        </h1>
        <form onSubmit={submit} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-display font-semibold text-white mb-2">
              Пароль владельца
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Проверяем…" : "Войти"}
          </Button>
        </form>
      </div>
    </div>
  );
}

