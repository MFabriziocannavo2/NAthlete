import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-28 px-6 text-center">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-orange-600/30 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-[20rem] w-[20rem] rounded-full bg-amber-500/20 blur-[120px]" />
      </div>

      <span className="inline-block mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-orange-300">
        Your Digital Athletic Identity
      </span>

      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
        Get Discovered.{" "}
        <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
          Get Recruited.
        </span>
      </h1>

      <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
        Create your NAthlete profile, showcase your achievements, highlights,
        academics, and recruiting information, and connect with coaches and
        universities around the world.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          href="/create-profile"
          className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-900/40 hover:from-orange-500 hover:to-amber-400 transition"
        >
          Create NAthlete Profile
        </Link>

        <Link
          href="#highlights"
          className="px-6 py-3 rounded-lg font-semibold border border-white/15 text-white hover:bg-white/10 transition"
        >
          View Highlights
        </Link>
      </div>
    </section>
  );
}
