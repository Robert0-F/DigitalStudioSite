import ServicePageTemplate from "@/components/services/ServicePageTemplate";
import { getServiceOffer } from "@/lib/serviceOffers";

const service = getServiceOffer("tilda");

export const metadata = {
  title: service.title,
  description: service.heroText,
};

export default function TildaServicePage() {
  return <ServicePageTemplate service={service} />;
}
