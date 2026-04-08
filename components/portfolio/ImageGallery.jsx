import Image from "next/image";

function aspectRatioClass(aspectRatio) {
  switch (aspectRatio) {
    case "square":
      return "aspect-square";
    case "portrait":
      return "aspect-[9/16]";
    case "video":
      return "aspect-[16/9]";
    default:
      return "aspect-[4/3]";
  }
}

function blockSpanClass(blockSize) {
  // Mobile: колонки не важны, всё во всю ширину.
  const map = {
    sm: "sm:col-span-1",
    md: "sm:col-span-2",
    lg: "sm:col-span-3",
    full: "sm:col-span-4",
  };
  return map[blockSize] || "sm:col-span-2";
}

export default function ImageGallery({ images, projectTitle }) {
  const list = Array.isArray(images) ? images.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) : [];
  if (!list.length) return null;

  return (
    <div className="grid grid-cols-4 gap-4">
      {list.map((img) => {
        const objectClass = img.object_fit === "contain" ? "object-contain" : "object-cover";
        const colSpan = blockSpanClass(img.block_size);
        const aspect = aspectRatioClass(img.aspect_ratio);

        if (!img.image_url) return null;

        return (
          <figure key={img.id} className={`col-span-4 ${colSpan}`}>
            <div className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c12] ${aspect}`}>
              <Image
                src={img.image_url}
                alt={img.caption || projectTitle || "Изображение проекта"}
                fill
                className={`${objectClass} transition-transform duration-500 hover:scale-[1.03]`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="lazy"
              />
            </div>
            {img.caption ? (
              <figcaption className="mt-3 text-xs text-[#71717a]">{img.caption}</figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}

