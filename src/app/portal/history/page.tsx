import PortalHistoryContent from "@/components/portal/PortalHistoryContent";
import PortalPageFrame from "@/components/portal/PortalPageFrame";

export const metadata = { title: "History — Nexius Portal" };

export default function Page() {
  return (
    <PortalPageFrame
      heroTitle="History"
      heroDescription="Audit onboarding, activation changes, and key portal actions across your customer lifecycle."
      shellTitle="Install & Activation History"
    >
      <PortalHistoryContent />
    </PortalPageFrame>
  );
}
