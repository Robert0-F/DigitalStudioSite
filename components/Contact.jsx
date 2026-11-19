"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { CheckCircle2, Loader2, Mail, Phone, Send } from "lucide-react";
import Button from "./ui/Button";
import { brand } from "@/lib/siteContent";
import { enterY, visibleY } from "@/lib/motionSafe";
import { trackGoal } from "@/components/analytics/YandexMetrika";

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

function ContactRow({ href, icon: Icon, label, value, onClick }) {
  return (
    <a href={href} className="flex items-center gap-3 text-ink hover:text-teal" onClick={onClick} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      <span className="icon-box border border-[var(--border-soft)] bg-[var(--bg-card)]">
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <span>
        <span className="block text-xs uppercase tracking-wider text-ink-muted">{label}</span>
        {value}
      </span>
    </a>
  );
}

export default function Contact() {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [status, setStatus] = useState("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { name: "", contact: "", message: "" } });

  const onSubmit = async (data) => {
    setStatus("loading");
    try {
      await submitContact(data);
      trackGoal("form_submit");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" ref={ref} className="section-y scroll-mt-24 bg-cream-100" aria-labelledby="contact-heading">
      <div className="section-padding grid items-start gap-12 lg:grid-cols-2">
        <motion.div
          initial={enterY(reduceMotion, 12)}
          animate={inView || reduceMotion ? visibleY : enterY(false, 12)}
          transition={{ duration: 0.4 }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Заявка</p>
          <h2 id="contact-heading" className="heading-lg text-ink">
            Расскажите задачу — отвечу в рабочие часы
          </h2>
          <p className="mt-4 max-w-md text-ink-muted">
            Имя, удобный контакт и пара предложений о проекте. Или сразу напишите в Telegram.
          </p>

          <div className="mt-8 space-y-4">
            <ContactRow href={`mailto:${brand.email}`} icon={Mail} label="Email" value={brand.email} />
            <ContactRow href={`tel:${brand.phoneTel}`} icon={Phone} label="Телефон" value={brand.phoneDisplay} />
            <ContactRow
              href={brand.telegramUrl}
              icon={Send}
              label="Telegram"
              value={brand.telegramHandle}
              onClick={() => trackGoal("telegram_click")}
            />
          </div>

          <Button
            as="a"
            href={brand.telegramUrl}
            className="mt-8"
            variant="secondary"
            onClick={() => trackGoal("telegram_click")}
          >
            Написать в Telegram
          </Button>
        </motion.div>

        <div className="surface-card p-6 sm:p-8">
          {status === "success" ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-teal" strokeWidth={1.5} />
              <h3 className="font-display text-2xl font-bold text-ink">Заявка отправлена</h3>
              <p className="mt-2 text-ink-muted">Спасибо! Свяжусь с вами в ближайшее время.</p>
              <Button type="button" className="mt-6" onClick={() => setStatus("idle")}>
                Отправить ещё
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div>
                <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-ink">
                  Имя
                </label>
                <input
                  id="contact-name"
                  className="field-input"
                  placeholder="Как к вам обращаться"
                  {...register("name", { required: "Обязательное поле", minLength: { value: 2, message: "Слишком коротко" } })}
                />
                {errors.name ? <p className="mt-1 text-sm text-clay">{errors.name.message}</p> : null}
              </div>
              <div>
                <label htmlFor="contact-input" className="mb-2 block text-sm font-semibold text-ink">
                  Контакт
                </label>
                <input
                  id="contact-input"
                  className="field-input"
                  placeholder="Email, телефон или Telegram"
                  {...register("contact", { required: "Обязательное поле" })}
                />
                {errors.contact ? <p className="mt-1 text-sm text-clay">{errors.contact.message}</p> : null}
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-ink">
                  Коротко о задаче
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  className="field-input min-h-[110px] resize-y"
                  placeholder="Что нужно сделать?"
                  {...register("message")}
                />
              </div>
              {status === "error" ? (
                <p className="text-sm text-clay">Не удалось отправить. Напишите в Telegram или на почту.</p>
              ) : null}
              <Button type="submit" disabled={status === "loading"} className="w-full sm:w-auto">
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Отправляем…
                  </>
                ) : (
                  "Отправить заявку"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
