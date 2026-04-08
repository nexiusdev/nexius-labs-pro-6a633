import PortalAgentContent from "@/components/portal/PortalAgentContent";
import PortalPageFrame from "@/components/portal/PortalPageFrame";

export const metadata = { title: "Agent — Nexius Portal" };

export default function Page() {
  return (
    <PortalPageFrame
      heroTitle="Agent Settings"
      heroDescription="Configure agent behavior, execution preferences, and safeguards for your live workspace."
      shellTitle="Agent Settings"
    >
      <PortalAgentContent />
    </PortalPageFrame>
  );
}
