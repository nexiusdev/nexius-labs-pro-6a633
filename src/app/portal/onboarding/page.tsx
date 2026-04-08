import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import PortalOnboardingContent from "@/components/portal/PortalOnboardingContent";
import PortalShell from "@/components/portal/PortalShell";

export const metadata = { title: "Onboarding — Nexius Portal" };

export default function Page() {
  return (
    <>
      <Navigation />
      <main className="bg-white min-h-screen pt-28 pb-16"><div className="container-wide max-w-6xl"><PortalShell title="Onboarding Center"><PortalOnboardingContent /></PortalShell></div></main>
      <Footer />
    </>
  );
}
