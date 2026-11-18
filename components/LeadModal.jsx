"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import Button from "./ui/Button";
import { trackGoal } from "@/components/analytics/YandexMetrika";

const typeOptions = [
  { value: "", label: "Не указывать" },
  { value: "Tilda", label: "Сайт на Tilda" },
  { value: "Django", label: "Система на Django" },
  { value: "Telegram", label: "Telegram-бот" },
  { value: "Маркетинг", label: "Маркетинг / Директ" },
];

const fieldClass = "field-input px-3 py-2.5 text-sm sm:px-4 sm:py-3 sm:text-base";

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
    throw new Error(body?.error || "Ошибка отправки заявки");
  }
  return res.json().catch(() => ({ ok: true }));
}

export default function LeadModal() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");
  const autoCloseTimerRef = useRef(null);
  const scrollYRef = useRef(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", contact: "", description: "", projectType: "" },
  });

  const close = () => setOpen(false);

  useEffect(() => {
    const onOpen = () => {
      setServerError("");
      setStatus("idle");
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      reset();
      setOpen(true);
    };
    window.addEventListener("lead-modal:open", onOpen);
    window.addEventListener("lead-modal:close", close);
    return () => {
      window.removeEventListener("lead-modal:open", onOpen);
      window.removeEventListener("lead-modal:close", close);
    };
  }, [reset]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("lead-modal:state", { detail: { open } }));
  }, [open]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    scrollYRef.current = window.scrollY;
    const prev = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = prev.overflow;
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.width = prev.width;
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
      trackGoal("form_submit");
      setStatus("success");
      autoCloseTimerRef.current = setTimeout(() => setOpen(false), 3200);
    } catch (e) {
      setStatus("error");
      setServerError(e?.message || "Ошибка отправки заявки");
    }
  };

  const modal = (
    <AnimatePresence>
      {open ? (
        <div key="lead-modal-shell" className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-5" role="presentation">
          <motion.button
            type="button"
            aria-label="Закрыть окно"
            className="absolute inset-0 z-0 bg-ink/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-modal-title"
            className="relative z-10 flex max-h-[min(100dvh,100vh)] w-[min(100%,620px)] flex-col overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white p-4 shadow-card sm:max-h-[min(92vh,860px)] sm:p-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={close} className="absolute right-4 top-4 rounded-full p-2 text-ink-muted hover:bg-cream-100 hover:text-ink" aria-label="Закрыть">
              <X className="h-5 w-5" />
            </button>

            {status === "success" ? (
              <div className="flex flex-1 flex-col justify-center py-8 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-teal" />
                <h2 id="lead-modal-title" className="font-display text-2xl font-bold text-ink">
                  Заявка отправлена
                </h2>
                <p className="mt-2 text-ink-muted">Спасибо! Свяжусь с вами в течение рабочего дня.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col gap-4" noValidate>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal">Заявка</p>
                  <h2 id="lead-modal-title" className="font-display text-xl font-bold text-ink sm:text-3xl">
                    Обсудим ваш проект
                  </h2>
                </div>

                <div>
                  <label htmlFor="lead-name" className="mb-1.5 block text-sm font-semibold text-ink">Имя</label>
                  <input id="lead-name" className={fieldClass} placeholder="Как к вам обращаться" {...register("name", { required: "Обязательное поле", minLength: { value: 2, message: "Слишком коротко" } })} />
                  {errors.name ? <p className="mt-1 text-sm text-clay">{errors.name.message}</p> : null}
                </div>

                <div>
                  <label htmlFor="lead-contact" className="mb-1.5 block text-sm font-semibold text-ink">Контакт</label>
                  <input id="lead-contact" className={fieldClass} placeholder="Email, телефон или Telegram" {...register("contact", { required: "Обязательное поле" })} />
                  {errors.contact ? <p className="mt-1 text-sm text-clay">{errors.contact.message}</p> : null}
                </div>

                <div>
                  <label htmlFor="lead-description" className="mb-1.5 block text-sm font-semibold text-ink">Коротко о задаче</label>
                  <textarea id="lead-description" rows={3} className={`${fieldClass} max-h-[28vh] resize-none sm:resize-y`} placeholder="Что нужно сделать?" {...register("description")} />
                </div>

                <div>
                  <label htmlFor="lead-type" className="mb-1.5 block text-sm font-semibold text-ink">Тип проекта</label>
                  <select id="lead-type" className={fieldClass} defaultValue="" {...register("projectType")}>
                    {typeOptions.map((o) => (
                      <option key={o.value || "none"} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {status === "error" ? <p className="text-sm text-clay">{serverError || "Не удалось отправить."}</p> : null}

                <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button type="submit" disabled={status === "loading"} className="w-full sm:w-auto">
                    {status === "loading" ? (<><Loader2 className="h-5 w-5 animate-spin" />Отправляем…</>) : "Отправить заявку"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={close} className="w-full sm:w-auto">Отмена</Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
