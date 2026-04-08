import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import AdminEntitlementsContent from "@/components/admin/AdminEntitlementsContent";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: "Admin Entitlements — Nexius Labs" };

export default function Page() {
  return (
    <>
      <Navigation />
      <main className="bg-white min-h-screen pt-28 pb-16"><div className="container-wide max-w-6xl"><AdminShell title="Entitlements"><AdminEntitlementsContent /></AdminShell></div></main>
      <Footer />
    </>
  );
}
