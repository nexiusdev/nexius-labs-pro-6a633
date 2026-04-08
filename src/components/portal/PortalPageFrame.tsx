import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import PortalShell from "@/components/portal/PortalShell";

export default function PortalPageFrame(props: {
  heroTitle: string;
  heroDescription: string;
  shellTitle: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <section className="gradient-hero relative overflow-hidden pt-28 md:pt-36 pb-12">
        <div className="hero-circle hero-circle-1" />
        <div className="hero-circle hero-circle-2" />
        <div className="container-wide relative z-10">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-blue-400">
            Nexius Portal
          </p>
          <h1 className="mt-2 text-center text-3xl font-bold text-white md:text-4xl text-balance">
            {props.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg leading-relaxed text-slate-300">
            {props.heroDescription}
          </p>
        </div>
      </section>
      <main className="min-h-screen bg-slate-50 pb-16">
        <div className="container-wide pt-10 max-w-6xl">
          <PortalShell title={props.shellTitle}>{props.children}</PortalShell>
        </div>
      </main>
      <Footer />
    </>
  );
}
