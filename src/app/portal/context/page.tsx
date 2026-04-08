import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import PortalContextContent from "@/components/portal/PortalContextContent";
import PortalShell from "@/components/portal/PortalShell";

export const metadata = { title: "Context — Nexius Portal" };

export default function Page() {
  return (
    <>
      <Navigation />
      <main className="bg-white min-h-screen pt-28 pb-16"><div className="container-wide max-w-6xl"><PortalShell title="Context Settings"><PortalContextContent /></PortalShell></div></main>
      <Footer />
    </>
  );
}
