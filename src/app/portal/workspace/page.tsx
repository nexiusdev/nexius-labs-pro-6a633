import PortalPageFrame from "@/components/portal/PortalPageFrame";
import PortalWorkspaceContent from "@/components/portal/PortalWorkspaceContent";

export const metadata = { title: "Workspace — Nexius Portal" };

export default function Page() {
  return (
    <PortalPageFrame
      heroTitle="Workspace"
      heroDescription="Track activation, installed scope, and real-time readiness of your Nexius environment."
      shellTitle="Workspace Overview"
    >
      <PortalWorkspaceContent />
    </PortalPageFrame>
  );
}
