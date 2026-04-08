"use client";

import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import SectionCard from "./SectionCard";
import { fadeInUp } from "@/lib/motion";
import CaseStudyLightbox from "./CaseStudyLightbox";

export default function CaseStudyVisualShowcase({ caseStudy }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const images = useMemo(() => {
    return Array.isArray(caseStudy?.showcase) ? caseStudy.showcase : [];
  }, [caseStudy?.showcase]);

  const [selectedIndex, setSelectedIndex] = useState(null);

  if (!images.length) return null;

  return (
    <section ref={ref} className="section-padding pt-10">
      <motion.div variants={fadeInUp} initial="hidden" animate={inView ? "visible" : "hidden"}>
        <SectionCard className="p-0 overflow-hidden">
          <div className="p-6 sm:p-8">
            <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
              Визуальная витрина
            </p>
            <h2 className="font-display font-bold text-white text-lg mb-6">
              Скриншоты и ключевые детали
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img, i) => (
                <button
                  key={img.src || `${i}`}
                  type="button"
                  onClick={() => setSelectedIndex(i)}
                  className={`thumbnailButton text-left rounded-2xl border border-white/[0.06] bg-[#0c0c12] overflow-hidden group`}
                  aria-label="Открыть изображение проекта"
                >
                  <div
                    className="relative w-full"
                    style={{ aspectRatio: img.aspectRatio || "16/10" }}
                  >
                    {img.src ? (
                      <Image
                        src={img.src}
                        alt={img.alt || "Скриншот проекта"}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                        sizes="(max-width: 1024px) 50vw, 320px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-white/[0.03]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                    <div className="absolute left-3 bottom-3 rounded-full bg-black/40 border border-white/10 px-3 py-1 text-xs font-display font-semibold text-white">
                      Смотреть
                    </div>
                  </div>

                  {img.caption ? (
                    <div className="p-4">
                      <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                        {img.caption}
                      </p>
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>
      </motion.div>

      <CaseStudyLightbox
        images={images}
        selectedIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onChangeIndex={setSelectedIndex}
      />
    </section>
  );
}

