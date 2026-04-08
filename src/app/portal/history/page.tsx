import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import PortalHistoryContent from "@/components/portal/PortalHistoryContent";
import PortalShell from "@/components/portal/PortalShell";

export const metadata = { title: "History — Nexius Portal" };

export default function Page() {
  return (
    <>
      <Navigation />
      <main className="bg-white min-h-screen pt-28 pb-16"><div className="container-wide max-w-6xl"><PortalShell title="Install & Activation History"><PortalHistoryContent /></PortalShell></div></main>
      <Footer />
    </>
  );
}
