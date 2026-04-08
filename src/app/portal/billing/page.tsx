import PortalBillingContent from "@/components/portal/PortalBillingContent";
import PortalPageFrame from "@/components/portal/PortalPageFrame";

export const metadata = { title: "Billing — Nexius Portal" };

export default function Page() {
  return (
    <PortalPageFrame
      heroTitle="Billing"
      heroDescription="View subscription state, plan cost, and billing-linked onboarding progress for your account."
      shellTitle="Billing"
    >
      <PortalBillingContent />
    </PortalPageFrame>
  );
}
