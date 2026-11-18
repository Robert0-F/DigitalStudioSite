import ServicePageTemplate from "@/components/services/ServicePageTemplate";
import { getServiceOffer } from "@/lib/serviceOffers";

const service = getServiceOffer("django");

export const metadata = {
  title: service.title,
  description: service.heroText,
};

export default function DjangoServicePage() {
  return <ServicePageTemplate service={service} />;
}
