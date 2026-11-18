/** Build multipart payload for portfolio create/update. */
export function appendPortfolioFormData(fd, values) {
  fd.append("title", values.title || "");
  if (values.slug) fd.append("slug", values.slug);
  if (values.subtitle) fd.append("subtitle", values.subtitle);
  if (values.client_industry) fd.append("client_industry", values.client_industry);
  if (values.project_type) fd.append("project_type", values.project_type);
  if (values.live_url) fd.append("live_url", values.live_url);
  fd.append("video_url", values.video_url || "");
  fd.append("home_filter", values.home_filter || "");
  fd.append("published", values.published ? "true" : "false");
  fd.append("show_on_home", values.show_on_home ? "true" : "false");
  fd.append("sort_order", String(values.sort_order ?? 0));

  const pages = Array.isArray(values.service_pages) ? values.service_pages : [];
  for (const s of pages) {
    fd.append("service_pages", s);
    fd.append("category_slugs", s);
  }
  fd.append("_set_categories", "1");

  fd.append("overview", values.overview || "");
  fd.append("problem", values.problem || "");
  fd.append("solution", values.solution || "");
  fd.append("process", values.process || "");
  fd.append("results", values.results || "");
  fd.append("technologies", values.technologies || "");
  fd.append("final", values.final || "");

  const heroFile = values.heroImageFile?.[0] ?? null;
  if (heroFile) fd.append("heroImageFile", heroFile);
  const caseHeroFile = values.caseHeroImageFile?.[0] ?? null;
  if (caseHeroFile) fd.append("caseHeroImageFile", caseHeroFile);
  if (values.clear_case_hero) fd.append("clear_case_hero", "true");
  return fd;
}
