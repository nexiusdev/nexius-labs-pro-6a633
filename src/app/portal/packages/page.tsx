import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import PortalPackagesContent from "@/components/portal/PortalPackagesContent";
import PortalShell from "@/components/portal/PortalShell";

export const metadata = { title: "Packages — Nexius Portal" };

export default function Page() {
  return (
    <>
      <Navigation />
      <main className="bg-white min-h-screen pt-28 pb-16"><div className="container-wide max-w-6xl"><PortalShell title="Packages"><PortalPackagesContent /></PortalShell></div></main>
      <Footer />
    </>
  );
}
