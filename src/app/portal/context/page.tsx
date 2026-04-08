import PortalContextContent from "@/components/portal/PortalContextContent";
import PortalPageFrame from "@/components/portal/PortalPageFrame";

export const metadata = { title: "Context — Nexius Portal" };

export default function Page() {
  return (
    <PortalPageFrame
      heroTitle="Context"
      heroDescription="Manage business context that your digital colleagues use for grounded decisions and execution."
      shellTitle="Context Settings"
    >
      <PortalContextContent />
    </PortalPageFrame>
  );
}
