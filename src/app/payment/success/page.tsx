import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SubscriptionStatusCard from "@/components/SubscriptionStatusCard";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  title: "Payment Complete — Nexius Labs",
  description: "Payment completed successfully.",
};

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const subscriptionId = typeof params.subscription === "string" ? params.subscription : "";

  return (
    <>
      <Navigation />
      <main className="bg-white min-h-screen pt-28 pb-16">
        <div className="container-wide max-w-3xl">
          {subscriptionId ? (
            <SubscriptionStatusCard subscriptionId={subscriptionId} />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Missing subscription</h1>
              <p className="text-slate-500 mt-2">No subscription id was provided.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
