import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import AdminPaymentDetailContent from "@/components/admin/AdminPaymentDetailContent";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: "Admin Payment Detail — Nexius Labs" };

export default async function Page({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  return (
    <>
      <Navigation />
      <main className="bg-white min-h-screen pt-28 pb-16"><div className="container-wide max-w-6xl"><AdminShell title={`Payment ${paymentId}`}><AdminPaymentDetailContent paymentId={paymentId} /></AdminShell></div></main>
      <Footer />
    </>
  );
}
