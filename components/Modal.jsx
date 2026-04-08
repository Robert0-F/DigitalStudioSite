"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { categoryLabels } from "@/lib/data";

export default function Modal({ isOpen, onClose, project }) {
  const handleEscape = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!project) return null;

  const imageSrc = project.image_url || project.image;
  const detailsText = project.details || project.description || project.excerpt;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Закрыть окно"
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="fixed left-1/2 top-1/2 z-[101] w-[min(92vw,560px)] max-h-[85vh] overflow-y-auto glass-strong rounded-2xl p-6 sm:p-8 shadow-card"
            initial={{ opacity: 0, x: "-50%", y: "-48%", scale: 0.96 }}
            animate={{ opacity: 1, x: "-50%", y: "-50%", scale: 1 }}
            exit={{ opacity: 0, x: "-50%", y: "-48%", scale: 0.96 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-[var(--text-muted)] hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-6">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={project.title || "Проект"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 560px) 92vw, 560px"
                />
              ) : (
                <div className="absolute inset-0 bg-white/[0.03]" />
              )}
            </div>
            <p className="mb-2 text-xs font-display font-semibold uppercase tracking-widest text-[#a5b4fc]">
              {categoryLabels[project.category]}
            </p>
            <h2
              id="modal-title"
              className="font-display font-bold text-2xl sm:text-3xl text-white mb-4"
            >
              {project.title}
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed text-base">
              {detailsText}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-8 w-full sm:w-auto rounded-full border border-white/15 px-6 py-3 text-sm font-display font-semibold text-white hover:bg-white/5 transition-colors"
            >
              Закрыть
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
