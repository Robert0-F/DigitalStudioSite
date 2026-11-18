import ServicePageTemplate from "@/components/services/ServicePageTemplate";
import { getServiceOffer } from "@/lib/serviceOffers";

const service = getServiceOffer("telegram");

export const metadata = {
  title: service.title,
  description: service.heroText,
};

export default function TelegramServicePage() {
  return <ServicePageTemplate service={service} />;
}
