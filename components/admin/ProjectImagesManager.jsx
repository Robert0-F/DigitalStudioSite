"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import Button from "@/components/ui/Button";
import { adminErrorMessage, parseAdminJson } from "@/lib/adminApi";

const blockSizeOptions = [
  { value: "sm", label: "sm (25%)" },
  { value: "md", label: "md (50%)" },
  { value: "lg", label: "lg (75%)" },
  { value: "full", label: "full (100%)" },
];

const objectFitOptions = [
  { value: "cover", label: "cover (обрезка)" },
  { value: "contain", label: "contain (вписать)" },
];

const aspectRatioOptions = [
  { value: "auto", label: "auto" },
  { value: "video", label: "video (16:9)" },
  { value: "square", label: "square (1:1)" },
  { value: "portrait", label: "portrait (9:16)" },
];

const fieldClass = "field-input py-2";
const labelClass = "mb-1 block text-xs font-semibold text-ink-muted";

export default function ProjectImagesManager({ projectId, initialImages = [] }) {
  const [images, setImages] = useState(initialImages);
  const [loading, setLoading] = useState(!initialImages?.length);
  const [error, setError] = useState("");

  const [pendingUploads, setPendingUploads] = useState([]);
  const [uploading, setUploading] = useState(false);

  const refresh = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/portfolio/${projectId}/images`, { credentials: "include" });
      const parsed = await parseAdminJson(res);
      if (!res.ok) throw new Error(adminErrorMessage(parsed, "Не удалось загрузить изображения", res.status));
      setImages(parsed.data?.images ?? []);
    } catch (e) {
      setError(e?.message || "Ошибка");
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
    const ok = window.confirm("Удалить это изображение?");
    if (!ok) return;
    try {
      const urls = [
        `/api/admin/portfolio/images/${imageId}/`,
        `/api/admin/portfolio/images/${imageId}`,
      ];
      let lastError = "Удаление не удалось";
      for (const url of urls) {
        const res = await fetch(url, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.ok) {
          await refresh();
          return;
        }
        const parsed = await parseAdminJson(res);
        lastError = adminErrorMessage(parsed, "Удаление не удалось", res.status);
        if (res.status === 404) continue;
        break;
      }
      throw new Error(lastError);
    } catch (e) {
      setError(e?.message || "Удаление не удалось");
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
      const parsed = await parseAdminJson(res);
      if (!res.ok) throw new Error(adminErrorMessage(parsed, "Не удалось сохранить", res.status));
      await refresh();
    } catch (e) {
      setError(e?.message || "Не удалось сохранить");
    }
  };

  const onChooseFiles = (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;

    const nextSortStart =
      (sortedImages?.length ? Math.max(...sortedImages.map((i) => i.sort_order ?? 0)) : -1) + 1;
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
        const parsed = await parseAdminJson(res);
        if (!res.ok) throw new Error(adminErrorMessage(parsed, "Загрузка не удалась", res.status));
      }

      setPendingUploads([]);
      await refresh();
    } catch (e) {
      setError(e?.message || "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-10">
      <div className="mb-5">
        <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.18em] text-teal">
          Галерея
        </p>
        <h2 className="font-display text-lg font-bold text-ink">Изображения проекта</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Подпись, размер блока, object-fit и порядок сортировки.
        </p>
      </div>

      {error ? <p className="mb-4 text-sm text-clay">{error}</p> : null}

      <div className="surface-card p-6 sm:p-8">
        <div className="flex flex-col gap-8">
          <section>
            <h3 className="mb-3 text-sm font-display font-semibold text-ink">Загрузить новые</h3>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onChooseFiles(e.target.files)}
              className="w-full text-sm text-ink-muted"
              disabled={uploading}
            />

            {pendingUploads.length ? (
              <div className="mt-6 space-y-4">
                {pendingUploads.map((p, idx) => (
                  <div
                    key={`${p.previewUrl}-${idx}`}
                    className="rounded-[16px] border border-[var(--border-soft)] bg-cream-50 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="relative h-24 w-full overflow-hidden rounded-xl border border-[var(--border-soft)] bg-cream-200 sm:h-28 sm:w-44">
                        <Image
                          src={p.previewUrl}
                          alt="Превью"
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 176px"
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className={labelClass}>Подпись</p>
                          <input
                            className={fieldClass}
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
                            <p className={labelClass}>Размер блока</p>
                            <select
                              className={fieldClass}
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
                            <p className={labelClass}>Object fit</p>
                            <select
                              className={fieldClass}
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
                            <p className={labelClass}>Соотношение сторон</p>
                            <select
                              className={fieldClass}
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
                            <p className={labelClass}>Порядок</p>
                            <input
                              type="number"
                              className={fieldClass}
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

                        <div className="flex justify-end pt-1">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setPendingUploads((prev) => prev.filter((_, j) => j !== idx));
                            }}
                          >
                            Убрать из очереди
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
                {uploading ? "Загрузка…" : "Загрузить"}
              </Button>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-display font-semibold text-ink">Уже загруженные</h3>

            {loading ? (
              <p className="text-sm text-ink-muted">Загрузка…</p>
            ) : sortedImages.length ? (
              <div className="space-y-4">
                {sortedImages.map((img) => (
                  <div
                    key={img.id}
                    className="rounded-[16px] border border-[var(--border-soft)] bg-cream-50 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                      <div className="relative h-24 w-full overflow-hidden rounded-xl border border-[var(--border-soft)] bg-cream-200 lg:h-28 lg:w-44">
                        {img.image_url ? (
                          <Image
                            src={img.image_url}
                            alt={img.caption || "Изображение"}
                            fill
                            className="object-cover"
                            sizes="176px"
                          />
                        ) : null}
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className={labelClass}>Подпись</p>
                            <input
                              value={img.caption || ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                setImages((prev) =>
                                  prev.map((x) => (x.id === img.id ? { ...x, caption: v } : x))
                                );
                              }}
                              className={fieldClass}
                            />
                          </div>
                          <div>
                            <p className={labelClass}>Размер блока</p>
                            <select
                              value={img.block_size}
                              onChange={(e) => {
                                const v = e.target.value;
                                setImages((prev) =>
                                  prev.map((x) => (x.id === img.id ? { ...x, block_size: v } : x))
                                );
                              }}
                              className={fieldClass}
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
                            <p className={labelClass}>Object fit</p>
                            <select
                              value={img.object_fit}
                              onChange={(e) => {
                                const v = e.target.value;
                                setImages((prev) =>
                                  prev.map((x) => (x.id === img.id ? { ...x, object_fit: v } : x))
                                );
                              }}
                              className={fieldClass}
                            >
                              {objectFitOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <p className={labelClass}>Соотношение сторон</p>
                            <select
                              value={img.aspect_ratio}
                              onChange={(e) => {
                                const v = e.target.value;
                                setImages((prev) =>
                                  prev.map((x) => (x.id === img.id ? { ...x, aspect_ratio: v } : x))
                                );
                              }}
                              className={fieldClass}
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
                            <p className={labelClass}>Порядок</p>
                            <input
                              type="number"
                              value={img.sort_order ?? 0}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setImages((prev) =>
                                  prev.map((x) => (x.id === img.id ? { ...x, sort_order: v } : x))
                                );
                              }}
                              className={fieldClass}
                            />
                          </div>
                          <div className="flex items-end justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={() => updateImage(img)}>
                              Сохранить
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => removeImage(img.id)}>
                              Удалить
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Изображений пока нет.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
