import ServicePageTemplate from "@/components/services/ServicePageTemplate";
import { getServiceOffer } from "@/lib/serviceOffers";

const service = getServiceOffer("agents");

export const metadata = {
  title: service?.title || "ИИ-агенты",
  description: service?.heroText || "ИИ-агенты и автоматизация бизнеса",
};

export default function AgentsServicePage() {
  return <ServicePageTemplate service={service} />;
}
