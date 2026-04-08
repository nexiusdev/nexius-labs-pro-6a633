import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FulfillmentQueue from "@/components/admin/FulfillmentQueue";

export const metadata = {
  title: "Admin Fulfillment Queue — Nexius Labs",
  description: "Website fulfillment queue, retries, and payment-event replay operations.",
};

export default function AdminFulfillmentPage() {
  return (
    <>
      <Navigation />
      <main className="bg-white min-h-screen pt-28 pb-16">
        <div className="container-wide max-w-5xl space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Admin Fulfillment Queue</h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage payment-to-install lifecycle failures, retries, and replay operations.
            </p>
          </div>

          <FulfillmentQueue />
        </div>
      </main>
      <Footer />
    </>
  );
}
