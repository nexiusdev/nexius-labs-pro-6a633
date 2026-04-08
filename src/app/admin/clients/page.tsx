import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import AdminClientsContent from "@/components/admin/AdminClientsContent";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: "Admin Clients — Nexius Labs" };

export default function Page() {
  return (
    <>
      <Navigation />
      <main className="bg-white min-h-screen pt-28 pb-16"><div className="container-wide max-w-6xl"><AdminShell title="Clients"><AdminClientsContent /></AdminShell></div></main>
      <Footer />
    </>
  );
}
