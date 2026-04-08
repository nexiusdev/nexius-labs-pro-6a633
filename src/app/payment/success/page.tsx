import { redirect } from "next/navigation";

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
  if (subscriptionId) {
    redirect(`/portal/onboarding?subscription=${encodeURIComponent(subscriptionId)}`);
  }
  redirect("/portal/onboarding");
}
