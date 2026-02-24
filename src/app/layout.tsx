import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { ShortlistProvider } from "@/context/ShortlistContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nexius-labs.netlify.app"),
  title: "Nexius Labs — Digital Colleagues as a Service",
  description:
    "Enterprise-grade AI execution for SMEs. Hire AI-operated digital colleagues for CRM, ERP, Finance, and HRMS workflows. Results in weeks, not months.",
  keywords: [
    "AI agents",
    "digital colleagues",
    "CRM automation",
    "ERP automation",
    "finance automation",
    "HRMS automation",
    "enterprise AI",
    "SME automation",
  ],
  authors: [{ name: "Nexius Labs" }],
  openGraph: {
    title: "Nexius Labs — Digital Colleagues as a Service",
    description:
      "Hire AI-operated digital colleagues for CRM, ERP, Finance, and HRMS workflows. Enterprise-grade execution, SME-friendly pricing.",
    url: "https://nexius-labs.netlify.app",
    siteName: "Nexius Labs",
    images: [
      {
        url: "/images/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Nexius Labs — Digital Colleagues as a Service",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexius Labs — Digital Colleagues as a Service",
    description:
      "Hire AI-operated digital colleagues for CRM, ERP, Finance, and HRMS workflows.",
    images: ["/images/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <ShortlistProvider>{children}</ShortlistProvider>
      </body>
    </html>
  );
}
