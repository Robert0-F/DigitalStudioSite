"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";

async function submitForm(data) {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      contact: data.contact,
      description: data.message || "",
      projectType: data.service || "",
    }),
  });
  if (!res.ok) throw new Error("fail");
}

export default function ServiceBottomForm({ serviceLabel, note }) {
  const [status, setStatus] = useState("idle");
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: "", contact: "", message: "", service: serviceLabel },
  });

  const onSubmit = async (data) => {
    setStatus("loading");
    try {
      await submitForm(data);
      setStatus("success");
      reset({ ...data, message: "", name: "", contact: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="service-contact"
      className="scroll-mt-24 border-t border-white/[0.06] bg-[#050508] py-20 sm:py-28"
      aria-labelledby="service-form-heading"
    >
      <div className="section-padding">
        <div className="mx-auto max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              id="service-form-heading"
              className="mb-3 font-display text-2xl font-bold text-white sm:text-3xl"
            >
              Начать диалог
            </h2>
            <p className="mb-8 text-[#9ca3af]">{note}</p>

            {status === "success" ? (
              <div className="rounded-2xl border border-[#6366f1]/20 bg-[#6366f1]/5 p-10 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-[#818cf8]" />
                <p className="text-lg text-white">Спасибо! Мы свяжемся с вами в ближайшее время.</p>
                <Button type="button" className="mt-6" onClick={() => setStatus("idle")}>
                  Отправить ещё
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <input type="hidden" {...register("service")} value={serviceLabel} />
                <div>
                  <label htmlFor="sf-name" className="mb-2 block text-sm font-medium text-white">
                    Имя
                  </label>
                  <input
                    id="sf-name"
                    className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-4 py-3 text-white outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
                    {...register("name", { required: "Укажите имя" })}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="sf-contact" className="mb-2 block text-sm font-medium text-white">
                    Контакт
                  </label>
                  <input
                    id="sf-contact"
                    type="text"
                    className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-4 py-3 text-white outline-none focus:border-[#6366f1]"
                    placeholder="Email, телефон или Telegram"
                    {...register("contact", { required: "Укажите контакт" })}
                  />
                  {errors.contact && <p className="mt-1 text-sm text-red-400">{errors.contact.message}</p>}
                </div>
                <div>
                  <label htmlFor="sf-msg" className="mb-2 block text-sm font-medium text-white">
                    Сообщение (необязательно)
                  </label>
                  <textarea
                    id="sf-msg"
                    rows={4}
                    className="w-full resize-y rounded-xl border border-white/10 bg-[#0c0c12] px-4 py-3 text-white outline-none focus:border-[#6366f1]"
                    {...register("message")}
                  />
                </div>
                {status === "error" && (
                  <p className="text-sm text-red-400">Ошибка отправки. Напишите на hello@tagirov.studio</p>
                )}
                <Button type="submit" disabled={status === "loading"}>
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Отправка…
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
