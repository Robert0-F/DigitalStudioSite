import { redirect } from "next/navigation";

/**
 * Next homepage HTML was ~180KB + dozens of scripts — phones hang.
 * smoke.html / m.html (~few KB, no JS) load fine on the same phone.
 * Serve the light static page until a slim Next shell is proven on mobile.
 */
export default function Home() {
  redirect("/m.html");
}
