import PortalPageFrame from "@/components/portal/PortalPageFrame";
import PortalPackagesContent from "@/components/portal/PortalPackagesContent";

export const metadata = { title: "Packages — Nexius Portal" };

export default function Page() {
  return (
    <PortalPageFrame
      heroTitle="Packages"
      heroDescription="Review purchased packages, versions, and current activation status in one place."
      shellTitle="Packages"
    >
      <PortalPackagesContent />
    </PortalPageFrame>
  );
}
