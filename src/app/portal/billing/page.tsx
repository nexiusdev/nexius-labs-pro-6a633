import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import PortalBillingContent from "@/components/portal/PortalBillingContent";
import PortalShell from "@/components/portal/PortalShell";

export const metadata = { title: "Billing — Nexius Portal" };

export default function Page() {
  return (
    <>
      <Navigation />
      <main className="bg-white min-h-screen pt-28 pb-16"><div className="container-wide max-w-6xl"><PortalShell title="Billing"><PortalBillingContent /></PortalShell></div></main>
      <Footer />
    </>
  );
}
