import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import PortalAgentContent from "@/components/portal/PortalAgentContent";
import PortalShell from "@/components/portal/PortalShell";

export const metadata = { title: "Agent — Nexius Portal" };

export default function Page() {
  return (
    <>
      <Navigation />
      <main className="bg-white min-h-screen pt-28 pb-16"><div className="container-wide max-w-6xl"><PortalShell title="Agent Settings"><PortalAgentContent /></PortalShell></div></main>
      <Footer />
    </>
  );
}
