"use client";

import { useEffect, useRef, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [serverError, setServerError] = useState("");
  const autoCloseTimerRef = useRef(null);

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
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
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

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Закрыть окно"
            className="fixed inset-0 z-[200] bg-black/78"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-modal-title"
            className="fixed left-1/2 top-1/2 z-[201] w-[min(92vw,620px)] max-h-[86vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0c0c12]/95 p-6 sm:p-8 shadow-card"
            initial={{ opacity: 0, y: "-48%", x: "-50%" }}
            animate={{ opacity: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, y: "-48%", x: "-50%" }}
            transition={{ duration: 0.18, ease: "easeOut" }}
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
              <div className="py-6 text-center">
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
                className="space-y-6"
                noValidate
                aria-busy={status === "loading"}
              >
                <div className="mb-2">
                  <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
                    Проектная заявка
                  </p>
                  <h2
                    id="lead-modal-title"
                    className="font-display font-bold text-2xl sm:text-3xl text-white"
                  >
                    Обсудим ваш проект
                  </h2>
                  <p className="mt-3 text-sm text-[#71717a]">
                    Заполните форму — подготовим ответ в рабочие часы.
                  </p>
                </div>

                <div className="space-y-2">
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
                    className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
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
                    className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
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

                <div className="space-y-2">
                  <label
                    htmlFor="lead-description"
                    className="block text-sm font-display font-semibold text-white"
                  >
                    Краткое описание проекта (необязательно)
                  </label>
                  <textarea
                    id="lead-description"
                    rows={4}
                    className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors resize-y min-h-[110px]"
                    placeholder="Например: задачи, сроки, интеграции…"
                    {...register("description")}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="lead-type"
                      className="block text-sm font-display font-semibold text-white"
                    >
                      Тип проекта (необязательно)
                    </label>
                    <select
                      id="lead-type"
                      className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
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

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
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

                <p className="text-xs text-[#71717a]">
                  Нажимая кнопку «Отправить заявку», вы соглашаетесь на обработку
                  контактных данных для обратной связи. NDA по запросу.
                </p>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

