import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import AdminJobDetailContent from "@/components/admin/AdminJobDetailContent";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: "Admin Job Detail — Nexius Labs" };

export default async function Page({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  return (
    <>
      <Navigation />
      <main className="bg-white min-h-screen pt-28 pb-16"><div className="container-wide max-w-6xl"><AdminShell title={`Job ${jobId}`}><AdminJobDetailContent jobId={jobId} /></AdminShell></div></main>
      <Footer />
    </>
  );
}
