import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden py-24 px-6 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-orange-600/20 to-amber-500/20" />

      <h2 className="text-3xl font-bold mb-4 text-white">
        Ready to Get Discovered?
      </h2>

      <p className="mb-8 text-gray-300 max-w-xl mx-auto">
        Join NAthlete today and showcase your talent to coaches around the
        world.
      </p>

      <Link
        href="/create-profile"
        className="inline-block px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-900/40 hover:from-orange-500 hover:to-amber-400 transition"
      >
        Create Your NAthlete Profile
      </Link>
    </section>
  );
}
