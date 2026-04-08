"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import Button from "@/components/ui/Button";

const blockSizeOptions = [
  { value: "sm", label: "sm (25%)" },
  { value: "md", label: "md (50%)" },
  { value: "lg", label: "lg (75%)" },
  { value: "full", label: "full (100%)" },
];

const objectFitOptions = [
  { value: "cover", label: "cover (crop)" },
  { value: "contain", label: "contain (fit)" },
];

const aspectRatioOptions = [
  { value: "auto", label: "auto" },
  { value: "video", label: "video (16:9)" },
  { value: "square", label: "square (1:1)" },
  { value: "portrait", label: "portrait (9:16)" },
];

export default function ProjectImagesManager({ projectId, initialImages = [] }) {
  const [images, setImages] = useState(initialImages);
  const [loading, setLoading] = useState(!initialImages?.length);
  const [error, setError] = useState("");

  const [pendingUploads, setPendingUploads] = useState([]); // {file, previewUrl, ...fields}
  const [uploading, setUploading] = useState(false);

  const refresh = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/portfolio/${projectId}/images`, { credentials: "include" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load images");
      setImages(json.images ?? []);
    } catch (e) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const sortedImages = useMemo(() => {
    return (images ?? []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [images]);

  const removeImage = async (imageId) => {
    setError("");
    const ok = window.confirm("Remove this image?");
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/portfolio/images/${imageId}/`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Delete failed");
      await refresh();
    } catch (e) {
      setError(e?.message || "Delete failed");
    }
  };

  const updateImage = async (image) => {
    setError("");
    const fd = new FormData();
    fd.append("caption", image.caption || "");
    fd.append("block_size", image.block_size);
    fd.append("object_fit", image.object_fit);
    fd.append("aspect_ratio", image.aspect_ratio);
    fd.append("sort_order", String(image.sort_order ?? 0));

    try {
      const res = await fetch(`/api/admin/portfolio/images/${image.id}/`, {
        method: "PUT",
        body: fd,
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Update failed");
      await refresh();
    } catch (e) {
      setError(e?.message || "Update failed");
    }
  };

  const onChooseFiles = (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;

    const nextSortStart = (sortedImages?.length ? Math.max(...sortedImages.map((i) => i.sort_order ?? 0)) : -1) + 1;
    const next = list.map((file, idx) => {
      const previewUrl = URL.createObjectURL(file);
      return {
        file,
        previewUrl,
        caption: "",
        block_size: "md",
        object_fit: "cover",
        aspect_ratio: "auto",
        sort_order: nextSortStart + idx,
      };
    });

    setPendingUploads((prev) => prev.concat(next));
  };

  const uploadPending = async () => {
    if (!pendingUploads.length) return;
    setError("");
    setUploading(true);

    try {
      // Upload sequentially to simplify debugging and to keep sort_order stable.
      for (const p of pendingUploads) {
        const fd = new FormData();
        fd.append("caption", p.caption || "");
        fd.append("block_size", p.block_size);
        fd.append("object_fit", p.object_fit);
        fd.append("aspect_ratio", p.aspect_ratio);
        fd.append("sort_order", String(p.sort_order ?? 0));
        fd.append("imageFile", p.file);

        const res = await fetch(`/api/admin/portfolio/${projectId}/images`, {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error || "Upload failed");
      }

      setPendingUploads([]);
      await refresh();
    } catch (e) {
      setError(e?.message || "Upload error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-10">
      <div className="mb-5">
        <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
          Images
        </p>
        <h2 className="font-display font-bold text-white text-lg">Project gallery</h2>
        <p className="mt-2 text-sm text-[#9ca3af]">
          Configure each image: caption, block size and object-fit.
        </p>
      </div>

      {error ? <p className="text-sm text-red-400 mb-4">{error}</p> : null}

      <div className="glass-strong rounded-3xl border border-white/[0.06] p-6 sm:p-8">
        <div className="flex flex-col gap-6">
          <section>
            <h3 className="text-sm font-display font-semibold text-white mb-3">Upload new images</h3>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onChooseFiles(e.target.files)}
              className="w-full text-sm text-[#9ca3af]"
              disabled={uploading}
            />

            {pendingUploads.length ? (
              <div className="mt-6 space-y-4">
                {pendingUploads.map((p, idx) => (
                  <div key={`${p.previewUrl}-${idx}`} className="rounded-2xl border border-white/[0.06] bg-[#0c0c12] p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="relative h-24 w-full sm:h-28 sm:w-44 overflow-hidden rounded-xl border border-white/[0.06] bg-[var(--bg-card)]">
                        <Image src={p.previewUrl} alt="Preview" fill className="object-cover" sizes="(max-width: 640px) 100vw, 176px" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-xs text-[#71717a] mb-1">Caption</p>
                          <input
                            className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-2 text-white focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
                            value={p.caption}
                            onChange={(e) => {
                              const v = e.target.value;
                              setPendingUploads((prev) =>
                                prev.map((x, j) => (j === idx ? { ...x, caption: v } : x))
                              );
                            }}
                          />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-[#71717a] mb-1">Block size</p>
                            <select
                              className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-2 text-white focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
                              value={p.block_size}
                              onChange={(e) => {
                                const v = e.target.value;
                                setPendingUploads((prev) =>
                                  prev.map((x, j) => (j === idx ? { ...x, block_size: v } : x))
                                );
                              }}
                            >
                              {blockSizeOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <p className="text-xs text-[#71717a] mb-1">Object fit</p>
                            <select
                              className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-2 text-white focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
                              value={p.object_fit}
                              onChange={(e) => {
                                const v = e.target.value;
                                setPendingUploads((prev) =>
                                  prev.map((x, j) => (j === idx ? { ...x, object_fit: v } : x))
                                );
                              }}
                            >
                              {objectFitOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-[#71717a] mb-1">Aspect ratio</p>
                            <select
                              className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-2 text-white focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
                              value={p.aspect_ratio}
                              onChange={(e) => {
                                const v = e.target.value;
                                setPendingUploads((prev) =>
                                  prev.map((x, j) => (j === idx ? { ...x, aspect_ratio: v } : x))
                                );
                              }}
                            >
                              {aspectRatioOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <p className="text-xs text-[#71717a] mb-1">Sort order</p>
                            <input
                              type="number"
                              className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-2 text-white focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
                              value={p.sort_order}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setPendingUploads((prev) =>
                                  prev.map((x, j) => (j === idx ? { ...x, sort_order: v } : x))
                                );
                              }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setPendingUploads((prev) => prev.filter((_, j) => j !== idx));
                            }}
                          >
                            Remove from queue
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-4 flex justify-end">
              <Button type="button" disabled={!pendingUploads.length || uploading} onClick={uploadPending}>
                {uploading ? "Uploading…" : "Upload"}
              </Button>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-display font-semibold text-white mb-3">Existing images</h3>

            {loading ? (
              <p className="text-sm text-[#9ca3af]">Loading…</p>
            ) : sortedImages.length ? (
              <div className="space-y-4">
                {sortedImages.map((img) => (
                  <div key={img.id} className="rounded-2xl border border-white/[0.06] bg-[#0c0c12] p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                      <div className="relative h-24 w-full lg:h-28 lg:w-44 overflow-hidden rounded-xl border border-white/[0.06] bg-[var(--bg-card)]">
                        {img.image_url ? (
                          <Image
                            src={img.image_url}
                            alt={img.caption || "Image"}
                            fill
                            className="object-cover"
                            sizes="176px"
                          />
                        ) : null}
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-[#71717a] mb-1">Caption</p>
                            <input
                              value={img.caption || ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                setImages((prev) => prev.map((x) => (x.id === img.id ? { ...x, caption: v } : x)));
                              }}
                              className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-2 text-white focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <p className="text-xs text-[#71717a] mb-1">Block size</p>
                            <select
                              value={img.block_size}
                              onChange={(e) => {
                                const v = e.target.value;
                                setImages((prev) => prev.map((x) => (x.id === img.id ? { ...x, block_size: v } : x)));
                              }}
                              className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-2 text-white focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
                            >
                              {blockSizeOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-[#71717a] mb-1">Object fit</p>
                            <select
                              value={img.object_fit}
                              onChange={(e) => {
                                const v = e.target.value;
                                setImages((prev) => prev.map((x) => (x.id === img.id ? { ...x, object_fit: v } : x)));
                              }}
                              className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-2 text-white focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
                            >
                              {objectFitOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <p className="text-xs text-[#71717a] mb-1">Aspect ratio</p>
                            <select
                              value={img.aspect_ratio}
                              onChange={(e) => {
                                const v = e.target.value;
                                setImages((prev) => prev.map((x) => (x.id === img.id ? { ...x, aspect_ratio: v } : x)));
                              }}
                              className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-2 text-white focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
                            >
                              {aspectRatioOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-[#71717a] mb-1">Sort order</p>
                            <input
                              type="number"
                              value={img.sort_order ?? 0}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setImages((prev) =>
                                  prev.map((x) => (x.id === img.id ? { ...x, sort_order: v } : x))
                                );
                              }}
                              className="w-full rounded-xl bg-[var(--bg-card)] border border-white/10 px-4 py-2 text-white focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-colors"
                            />
                          </div>
                          <div className="flex items-end justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={() => updateImage(img)}>
                              Save
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => removeImage(img.id)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#9ca3af]">No images yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

