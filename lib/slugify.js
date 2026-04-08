export function slugify(input) {
  const s = String(input ?? "")
    .toLowerCase()
    .trim()
    .replace(/ё/g, "е")
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s;
}

