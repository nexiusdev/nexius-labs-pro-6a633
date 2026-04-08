import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import AdminClientDetailContent from "@/components/admin/AdminClientDetailContent";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: "Admin Client Detail — Nexius Labs" };

export default async function Page({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  return (
    <>
      <Navigation />
      <main className="bg-white min-h-screen pt-28 pb-16"><div className="container-wide max-w-6xl"><AdminShell title={`Client ${clientId}`}><AdminClientDetailContent clientId={clientId} /></AdminShell></div></main>
      <Footer />
    </>
  );
}
