import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container-wide py-12">
        {/* Top row */}
        <div className="lg:grid lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div>
            <Link href="/" className="text-xl font-bold">
              <span className="text-white">nexius</span>
              <span className="text-blue-400">labs</span>
            </Link>
            <p className="text-sm text-slate-400 mt-3">
              Digital Colleagues as a Service
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Enterprise-grade AI execution for SMEs — without the enterprise headcount.
            </p>
          </div>

          {/* Product column */}
          <div className="mt-8 lg:mt-0">
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <nav className="space-y-0">
              <Link href="/roles" className="block text-sm text-slate-400 hover:text-white transition-colors py-1">
                Role Catalog
              </Link>
              <Link href="/how-it-works" className="block text-sm text-slate-400 hover:text-white transition-colors py-1">
                How It Works
              </Link>
              <Link href="/how-it-works" className="block text-sm text-slate-400 hover:text-white transition-colors py-1">
                Integrations
              </Link>
              <Link href="/why-nexius" className="block text-sm text-slate-400 hover:text-white transition-colors py-1">
                Why Nexius
              </Link>
            </nav>
          </div>

          {/* Company column */}
          <div className="mt-8 lg:mt-0">
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <nav className="space-y-0">
              <Link href="/why-nexius" className="block text-sm text-slate-400 hover:text-white transition-colors py-1">
                About Us
              </Link>
              <Link href="/#contact" className="block text-sm text-slate-400 hover:text-white transition-colors py-1">
                Contact
              </Link>
              <span className="block text-sm text-slate-500 cursor-default py-1">
                Careers (Coming Soon)
              </span>
              <span className="block text-sm text-slate-500 cursor-default py-1">
                Blog (Coming Soon)
              </span>
            </nav>
          </div>

          {/* Resources column */}
          <div className="mt-8 lg:mt-0">
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <nav className="space-y-0">
              <a href="#" className="block text-sm text-slate-400 hover:text-white transition-colors py-1">
                Security
              </a>
              <a href="#" className="block text-sm text-slate-400 hover:text-white transition-colors py-1">
                Privacy Policy
              </a>
              <a href="#" className="block text-sm text-slate-400 hover:text-white transition-colors py-1">
                Terms of Service
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-slate-800 mt-8 pt-8 flex justify-between items-center">
          <p className="text-sm text-slate-500">
            &copy; 2026 Nexius Labs. All rights reserved.
          </p>
          <a
            href="https://www.linkedin.com/company/nexiuslabs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="LinkedIn"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
