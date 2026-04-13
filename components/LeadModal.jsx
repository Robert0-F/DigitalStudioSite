"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import Button from "./ui/Button";

const typeOptions = [
  { value: "", label: "Не указывать" },
  { value: "Веб-сайт", label: "Веб-сайт" },
  { value: "CRM", label: "CRM" },
  { value: "Дизайн", label: "Дизайн" },
  { value: "Брендинг", label: "Брендинг" },
];

function normalizeContact(raw) {
  return String(raw ?? "").trim();
}

async function submitLead(payload) {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.error || "Ошибка отправки заявки";
    throw new Error(message);
  }
  return res.json().catch(() => ({ ok: true }));
}

export default function LeadModal() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [serverError, setServerError] = useState("");
  const autoCloseTimerRef = useRef(null);
  const scrollYRef = useRef(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      contact: "",
      description: "",
      projectType: "",
    },
  });

  const close = () => {
    setOpen(false);
  };

  useEffect(() => {
    const onOpen = () => {
      setServerError("");
      setStatus("idle");
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
      reset();
      setOpen(true);
    };

    const onClose = () => {
      setOpen(false);
    };

    window.addEventListener("lead-modal:open", onOpen);
    window.addEventListener("lead-modal:close", onClose);
    return () => {
      window.removeEventListener("lead-modal:open", onOpen);
      window.removeEventListener("lead-modal:close", onClose);
    };
  }, [reset]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("lead-modal:state", { detail: { open } })
    );
  }, [open]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    scrollYRef.current = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollYRef.current);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const onSubmit = async (data) => {
    setStatus("loading");
    setServerError("");

    try {
      await submitLead({
        name: data.name,
        contact: normalizeContact(data.contact),
        description: data.description ? String(data.description).trim() : "",
        projectType: data.projectType || "",
      });

      setStatus("success");
      autoCloseTimerRef.current = setTimeout(() => {
        setOpen(false);
      }, 3200);
    } catch (e) {
      setStatus("error");
      setServerError(e?.message || "Ошибка отправки заявки");
    }
  };

  const modal = (
    <AnimatePresence>
      {open && (
        <div
          key="lead-modal-shell"
          className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-5"
          role="presentation"
        >
          <motion.button
            type="button"
            aria-label="Закрыть окно"
            className="absolute inset-0 z-0 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-modal-title"
            className="relative z-10 flex max-h-[min(100dvh,100vh)] w-[min(100%,620px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c12] p-4 shadow-card sm:max-h-[min(92vh,860px)] sm:p-8"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 rounded-full p-2 text-[var(--text-muted)] hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>

            {status === "success" ? (
              <div className="flex flex-1 flex-col justify-center py-4 text-center sm:py-6">
                <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-[var(--accent)]" />
                <h2
                  id="lead-modal-title"
                  className="font-display font-bold text-2xl text-white mb-2"
                >
                  Заявка отправлена
                </h2>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  Спасибо! Мы свяжемся с вами в течение 24 часов.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex min-h-0 flex-1 flex-col gap-4 sm:gap-5"
                noValidate
                aria-busy={status === "loading"}
              >
                <div className="shrink-0">
                  <p className="mb-2 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
                    Проектная заявка
                  </p>
                  <h2
                    id="lead-modal-title"
                    className="font-display font-bold text-xl text-white sm:text-3xl"
                  >
                    Обсудим ваш проект
                  </h2>
                  <p className="mt-2 text-xs text-[#71717a] sm:mt-3 sm:text-sm">
                    Заполните форму — подготовим ответ в рабочие часы.
                  </p>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label
                    htmlFor="lead-name"
                    className="block text-sm font-display font-semibold text-white"
                  >
                    Имя
                  </label>
                  <input
                    id="lead-name"
                    type="text"
                    autoComplete="name"
                    className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors sm:px-4 sm:py-3 sm:text-base"
                    placeholder="Как к вам обращаться"
                    aria-invalid={errors.name ? "true" : "false"}
                    {...register("name", {
                      required: "Обязательное поле",
                      minLength: { value: 2, message: "Имя слишком короткое" },
                    })}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-400" role="alert">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="lead-contact"
                    className="block text-sm font-display font-semibold text-white"
                  >
                    Контакт
                  </label>
                  <input
                    id="lead-contact"
                    type="text"
                    autoComplete="email"
                    className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors sm:px-4 sm:py-3 sm:text-base"
                    placeholder="Email или телефон"
                    aria-invalid={errors.contact ? "true" : "false"}
                    {...register("contact", {
                      required: "Обязательное поле",
                      validate: (v) => {
                        const value = normalizeContact(v);
                        if (!value) return "Обязательное поле";
                        return true; // email / phone / Telegram — без формальной валидации
                      },
                    })}
                  />
                  <p className="text-xs text-[#71717a]">
                    Подойдёт email, телефон или Telegram (например: @username).
                  </p>
                  {errors.contact && (
                    <p className="text-sm text-red-400" role="alert">
                      {errors.contact?.message}
                    </p>
                  )}
                </div>

                <div className="min-h-0 flex-1 space-y-1.5 sm:space-y-2">
                  <label
                    htmlFor="lead-description"
                    className="block text-sm font-display font-semibold text-white"
                  >
                    Краткое описание проекта (необязательно)
                  </label>
                  <textarea
                    id="lead-description"
                    rows={3}
                    className="max-h-[28vh] min-h-[72px] w-full resize-none rounded-xl bg-[var(--bg-card)] border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors sm:max-h-none sm:min-h-[110px] sm:resize-y sm:px-4 sm:py-3 sm:text-base"
                    placeholder="Например: задачи, сроки, интеграции…"
                    {...register("description")}
                  />
                </div>

                <div className="grid shrink-0 gap-4 sm:grid-cols-2 sm:gap-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="lead-type"
                      className="block text-sm font-display font-semibold text-white"
                    >
                      Тип проекта (необязательно)
                    </label>
                    <select
                      id="lead-type"
                      className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-3 py-2.5 text-sm text-white focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors sm:px-4 sm:py-3 sm:text-base"
                      defaultValue=""
                      {...register("projectType")}
                    >
                      {typeOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-400" role="alert">
                    {serverError || "Не удалось отправить заявку."}
                  </p>
                )}

                <div className="mt-auto flex shrink-0 flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
                  <Button
                    type="submit"
                    disabled={status === "loading"}
                    className="sm:w-auto w-full"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                        Отправляем…
                      </>
                    ) : (
                      "Отправить заявку"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={close}
                    disabled={status === "loading"}
                    className="sm:w-auto w-full"
                  >
                    Отмена
                  </Button>
                </div>

                <p className="text-[10px] leading-snug text-[#71717a] sm:text-xs">
                  Нажимая кнопку «Отправить заявку», вы соглашаетесь на обработку
                  контактных данных для обратной связи. NDA по запросу.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;

  return createPortal(modal, document.body);
}

