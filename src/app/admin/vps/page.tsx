import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminVpsContent from "@/components/admin/AdminVpsContent";

export const metadata = { title: "Admin VPS — Nexius Labs" };

export default function Page() {
  return (
    <>
      <Navigation />
      <main className="bg-white min-h-screen pt-28 pb-16"><div className="container-wide max-w-6xl"><AdminShell title="VPS Assignment Visibility"><AdminVpsContent /></AdminShell></div></main>
      <Footer />
    </>
  );
}
