import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { formatSgd } from "@/lib/pricing";

type PaymentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  title: "Payment — Nexius Labs",
  description: "Complete payment for shortlisted Nexius digital colleague roles.",
};

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const params = await searchParams;
  const rolesRaw = typeof params.roles === "string" ? params.roles : "";
  const monthlyRaw = typeof params.monthly === "string" ? Number(params.monthly) : 0;
  const currency = typeof params.currency === "string" ? params.currency : "SGD";

  const roleIds = rolesRaw
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  const monthly = Number.isFinite(monthlyRaw) ? monthlyRaw : 0;

  return (
    <>
      <Navigation />
      <main className="bg-slate-50 min-h-screen pt-28 pb-16">
        <div className="container-wide max-w-3xl">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
            <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Payment (Dummy)</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">Checkout Summary</h1>
            <p className="text-slate-500 mt-2">
              This is a temporary payment page. You can replace it later by setting
              <code className="mx-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">NEXT_PUBLIC_PAYMENT_GATEWAY_URL</code>
              to your production payment gateway URL.
            </p>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <p className="text-sm text-slate-600">Currency: <span className="font-semibold text-slate-900">{currency}</span></p>
              <p className="text-sm text-slate-600">Monthly total: <span className="font-semibold text-slate-900">{formatSgd(monthly)}</span></p>
              <p className="text-sm text-slate-600">Roles selected: <span className="font-semibold text-slate-900">{roleIds.length}</span></p>
            </div>

            {roleIds.length > 0 ? (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Selected role IDs</p>
                <div className="flex flex-wrap gap-2">
                  {roleIds.map((id) => (
                    <span key={id} className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center bg-slate-900 text-white px-5 py-3 rounded-lg text-sm font-semibold opacity-70 cursor-not-allowed"
                disabled
              >
                Proceed to Secure Payment (Coming Soon)
              </button>
              <Link
                href="/shortlist"
                className="inline-flex items-center justify-center border-2 border-slate-200 text-slate-700 px-5 py-3 rounded-lg text-sm font-semibold hover:border-slate-300"
              >
                Back to Shortlist
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
