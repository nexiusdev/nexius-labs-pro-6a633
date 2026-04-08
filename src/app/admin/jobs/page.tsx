import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import AdminJobsContent from "@/components/admin/AdminJobsContent";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: "Admin Jobs — Nexius Labs" };

export default function Page() {
  return (
    <>
      <Navigation />
      <main className="bg-white min-h-screen pt-28 pb-16"><div className="container-wide max-w-6xl"><AdminShell title="Jobs"><AdminJobsContent /></AdminShell></div></main>
      <Footer />
    </>
  );
}
