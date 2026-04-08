"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Mail, Phone, Loader2, CheckCircle2 } from "lucide-react";
import Button from "./ui/Button";
import { fadeInUp, staggerContainer } from "@/lib/motion";

async function submitContact(data) {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      contact: data.contact,
      description: data.message || "",
      projectType: "Контактная форма",
    }),
  });
  if (!res.ok) throw new Error("Form submit failed");
}

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [status, setStatus] = useState("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", contact: "", message: "" },
  });

  const onSubmit = async (data) => {
    setStatus("loading");
    try {
      await submitContact(data);
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="scroll-mt-24 border-t border-white/[0.04] bg-[#050508] py-24 sm:py-32"
      aria-labelledby="contact-heading"
    >
      <div className="section-padding">
        <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <motion.p
              variants={fadeInUp}
              className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]"
            >
              Контакт
            </motion.p>
            <motion.h2
              id="contact-heading"
              variants={fadeInUp}
              className="heading-lg mb-6 font-display font-bold text-white"
            >
              Начните с диалога
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mb-10 max-w-md text-lg font-light leading-relaxed text-[#9ca3af]"
            >
              Кратко опишите задачу и оставьте контакт (email / телефон / Telegram).
              Персональный ответ — в течение одного рабочего дня. NDA по запросу.
            </motion.p>
            <motion.div variants={fadeInUp} className="space-y-4">
              <a
                href="mailto:hello@tagirov.studio"
                className="flex items-center gap-3 text-white hover:text-[var(--accent-hover)] transition-colors group"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl glass border border-white/10 group-hover:border-[var(--accent)]/30">
                  <Mail className="h-5 w-5 text-[var(--accent)]" aria-hidden />
                </span>
                <span>
                  <span className="block text-xs text-[var(--text-muted)] uppercase tracking-wider">
                    Email
                  </span>
                  hello@tagirov.studio
                </span>
              </a>
              <a
                href="tel:+15551234567"
                className="flex items-center gap-3 text-white hover:text-[var(--accent-hover)] transition-colors group"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl glass border border-white/10 group-hover:border-[var(--accent)]/30">
                  <Phone className="h-5 w-5 text-[var(--accent)]" aria-hidden />
                </span>
                <span>
                  <span className="block text-xs text-[var(--text-muted)] uppercase tracking-wider">
                    Телефон
                  </span>
                  +1 (555) 123-4567
                </span>
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="glass-luxury rounded-3xl border border-white/[0.08] p-8 sm:p-10"
          >
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
                role="status"
              >
                <CheckCircle2 className="h-16 w-16 text-[var(--accent)] mx-auto mb-6" />
                <h3 className="font-display font-bold text-2xl text-white mb-3">
                  Сообщение отправлено
                </h3>
                <p className="text-[var(--text-muted)] mb-8 max-w-sm mx-auto">
                  Спасибо! Мы свяжемся с вами в ближайшее время.
                </p>
                <Button type="button" onClick={() => setStatus("idle")}>
                  Отправить ещё одно сообщение
                </Button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
              >
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-display font-semibold text-white mb-2"
                  >
                    Имя
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    autoComplete="name"
                    className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
                    placeholder="Ваше имя"
                    aria-invalid={errors.name ? "true" : "false"}
                    {...register("name", {
                      required: "Обязательное поле",
                      minLength: { value: 2, message: "Имя слишком короткое" },
                    })}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-sm text-red-400" role="alert">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="contact-input"
                    className="block text-sm font-display font-semibold text-white mb-2"
                  >
                    Контакт
                  </label>
                  <input
                    id="contact-input"
                    type="text"
                    autoComplete="off"
                    className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
                    placeholder="Email, телефон или Telegram"
                    aria-invalid={errors.contact ? "true" : "false"}
                    {...register("contact", {
                      required: "Обязательное поле",
                    })}
                  />
                  {errors.contact && (
                    <p className="mt-1.5 text-sm text-red-400" role="alert">
                      {errors.contact.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-display font-semibold text-white mb-2"
                  >
                    Описание проекта
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors resize-y min-h-[120px]"
                    placeholder="Что делаем? Сроки, объём, ссылки…"
                    aria-invalid={errors.message ? "true" : "false"}
                    {...register("message", {
                      required: "Обязательное поле",
                    })}
                  />
                  {errors.message && (
                    <p className="mt-1.5 text-sm text-red-400" role="alert">
                      {errors.message.message}
                    </p>
                  )}
                </div>
                {status === "error" && (
                  <p className="text-sm text-red-400" role="alert">
                    Что-то пошло не так. Напишите нам на почту или попробуйте
                    снова.
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                      Отправляем…
                    </>
                  ) : (
                    "Отправить"
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
