import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TelegramOnboardingForm from "@/components/TelegramOnboardingForm";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  title: "Payment Complete — Nexius Labs",
  description: "Submit Telegram setup details after payment completion.",
};

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rolesRaw = typeof params.roles === "string" ? params.roles : "";
  const monthlyRaw = typeof params.monthly === "string" ? Number(params.monthly) : undefined;
  const currency = typeof params.currency === "string" ? params.currency : "SGD";

  const roleIds = rolesRaw
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  const monthlyTotal = typeof monthlyRaw === "number" && Number.isFinite(monthlyRaw) ? monthlyRaw : undefined;

  return (
    <>
      <Navigation />
      <main className="bg-slate-50 min-h-screen pt-28 pb-16">
        <div className="container-wide max-w-3xl">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
            <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Payment complete</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">One last step: connect AI Agent</h1>
            <p className="text-slate-500 mt-2">
              Submit your Telegram details so we can provision your digital colleague and connect it to your bot.
            </p>

            <div className="mt-6">
              <TelegramOnboardingForm roleIds={roleIds} currency={currency} monthlyTotal={monthlyTotal} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
