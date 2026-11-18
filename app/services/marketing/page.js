import ServicePageTemplate from "@/components/services/ServicePageTemplate";
import { getServiceOffer } from "@/lib/serviceOffers";

const service = getServiceOffer("marketing");

export const metadata = {
  title: service.title,
  description: service.heroText,
};

export default function MarketingServicePage() {
  return <ServicePageTemplate service={service} />;
}
