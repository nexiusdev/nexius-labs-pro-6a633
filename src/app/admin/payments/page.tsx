import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import AdminPaymentsContent from "@/components/admin/AdminPaymentsContent";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: "Admin Payments — Nexius Labs" };

export default function Page() {
  return (
    <>
      <Navigation />
      <main className="bg-white min-h-screen pt-28 pb-16"><div className="container-wide max-w-6xl"><AdminShell title="Payments Queue"><AdminPaymentsContent /></AdminShell></div></main>
      <Footer />
    </>
  );
}
