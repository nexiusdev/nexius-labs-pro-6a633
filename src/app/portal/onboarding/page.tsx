import PortalOnboardingContent from "@/components/portal/PortalOnboardingContent";
import PortalPageFrame from "@/components/portal/PortalPageFrame";

export const metadata = { title: "Onboarding — Nexius Portal" };

export default function Page() {
  return (
    <PortalPageFrame
      heroTitle="Onboarding"
      heroDescription="Follow provisioning and package lifecycle progress from payment confirmation to active service."
      shellTitle="Onboarding Center"
    >
      <PortalOnboardingContent />
    </PortalPageFrame>
  );
}
