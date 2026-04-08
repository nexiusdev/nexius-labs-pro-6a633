import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import PortalShell from "@/components/portal/PortalShell";
import PortalWorkspaceContent from "@/components/portal/PortalWorkspaceContent";

export const metadata = { title: "Workspace — Nexius Portal" };

export default function Page() {
  return (
    <>
      <Navigation />
      <main className="bg-white min-h-screen pt-28 pb-16"><div className="container-wide max-w-6xl"><PortalShell title="Workspace Overview"><PortalWorkspaceContent /></PortalShell></div></main>
      <Footer />
    </>
  );
}
