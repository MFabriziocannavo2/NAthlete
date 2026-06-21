"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import Logo from "@/components/ui/Logo";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Discover", href: "/athletes" },
];

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="w-full z-30 bg-gray-950/70 backdrop-blur-lg border-b border-white/10 sticky top-0">
      <div className="container mx-auto px-3 md:px-4 py-3 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link href="/" aria-label="NAthlete home" className="shrink-0">
          <Logo size="md" />
        </Link>

        {/* Nav links */}
        <div className="flex flex-1 items-center justify-center gap-3 md:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm md:text-base font-medium transition-colors ${
                pathname === link.href
                  ? "text-orange-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          {!loading && user ? (
            <>
              <Link
                href="/my-profile"
                className="px-2 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium text-gray-300 hover:bg-white/10 transition"
              >
                My Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="px-2 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-bold bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow hover:from-orange-500 hover:to-amber-400 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-2 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium text-gray-300 hover:bg-white/10 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-2 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-bold bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow hover:from-orange-500 hover:to-amber-400 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
