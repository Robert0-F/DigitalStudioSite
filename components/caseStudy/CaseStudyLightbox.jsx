"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import styles from "./CaseStudyLightbox.module.css";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

function clampIndex(i, length) {
  if (length <= 0) return 0;
  const mod = ((i % length) + length) % length;
  return mod;
}

export default function CaseStudyLightbox({
  images,
  selectedIndex,
  onClose,
  onChangeIndex,
}) {
  const selected = useMemo(() => {
    if (!Array.isArray(images) || selectedIndex == null) return null;
    return images[selectedIndex] || null;
  }, [images, selectedIndex]);

  useEffect(() => {
    if (selectedIndex == null) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onChangeIndex(clampIndex(selectedIndex - 1, images.length));
      if (e.key === "ArrowRight") onChangeIndex(clampIndex(selectedIndex + 1, images.length));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [images.length, onClose, onChangeIndex, selectedIndex]);

  return (
    <AnimatePresence>
      {selected && selectedIndex != null ? (
        <>
          <motion.button
            type="button"
            aria-label="Закрыть"
            className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="fixed left-1/2 top-1/2 z-[301] w-[min(94vw,980px)] -translate-x-1/2 -translate-y-1/2 glass-strong rounded-3xl border border-white/[0.08] p-4 sm:p-6 shadow-card"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
          >
            <div className="relative">
              <div className={styles.lightboxImageWrap}>
                <div className="relative w-full" style={{ aspectRatio: selected.aspectRatio || "16/9" }}>
                  {selected.src ? (
                    <Image
                      src={selected.src}
                      alt={selected.alt || "Изображение проекта"}
                      fill
                      className={`object-contain ${styles.lightboxImage}`}
                      sizes="(max-width: 980px) 96vw, 980px"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 bg-white/[0.03]" />
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/40 p-2 text-white hover:bg-white/10 transition-colors"
                aria-label="Закрыть окно"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
                <button
                  type="button"
                  className="pointer-events-auto rounded-full border border-white/15 bg-black/40 p-2 text-white hover:bg-white/10 transition-colors"
                  aria-label="Предыдущее изображение"
                  onClick={() => onChangeIndex(clampIndex(selectedIndex - 1, images.length))}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="pointer-events-auto rounded-full border border-white/15 bg-black/40 p-2 text-white hover:bg-white/10 transition-colors"
                  aria-label="Следующее изображение"
                  onClick={() => onChangeIndex(clampIndex(selectedIndex + 1, images.length))}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {selected.caption ? (
              <p className="mt-4 text-center text-[var(--text-muted)] leading-relaxed">
                {selected.caption}
              </p>
            ) : null}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

