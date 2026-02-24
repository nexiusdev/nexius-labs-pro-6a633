import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center px-6">
        <div className="mb-6">
          <span className="text-2xl font-bold text-white tracking-tight">
            nexius<span className="text-blue-400">labs</span>
          </span>
        </div>
        <h1 className="text-[8rem] font-bold leading-none text-white/10 select-none">
          404
        </h1>
        <p className="text-xl text-slate-300 -mt-6 mb-2">Page not found</p>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-medium transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
