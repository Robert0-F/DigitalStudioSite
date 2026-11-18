import { redirect } from "next/navigation";

/** Старый статичный роут кейсов → канон /portfolio/[slug] */
export default async function LegacyCaseRedirect({ params }) {
  const { slug } = await params;
  redirect(`/portfolio/${slug}`);
}
