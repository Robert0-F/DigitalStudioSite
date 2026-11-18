"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function AdminPasswordGate() {
  const [username, setUsername] = useState("admin");
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
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Неверный логин или пароль");
      }

      window.location.reload();
    } catch (err) {
      setError(err?.message || "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-[var(--border-soft)] bg-white p-6 shadow-soft sm:p-8">
        <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-teal">
          Админ-панель
        </p>
        <h1 className="heading-md mb-2 font-display font-bold text-ink">Вход</h1>
        <p className="mb-6 text-sm text-ink-muted">
          Логин Django User (рекомендуется) или пароль из `ADMIN_PASSWORD`.
        </p>
        <form onSubmit={submit} className="space-y-5" noValidate>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Логин</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              autoComplete="username"
              className="field-input"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Пароль</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              className="field-input"
              placeholder="••••••••"
            />
          </div>
          {error ? (
            <p className="text-sm text-clay" role="alert">
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
