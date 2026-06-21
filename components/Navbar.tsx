"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/AuthContext";
import Logo from "@/components/ui/Logo";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Discover", href: "/athletes" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="w-full z-30 bg-gray-950/70 backdrop-blur-lg border-b border-white/10 sticky top-0">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" aria-label="NAthlete home">
            <Logo size="md" />
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`font-medium transition-colors ${
                pathname === link.href
                  ? "text-orange-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {!loading && user ? (
            <>
              <span className="px-2 text-sm text-gray-400 truncate max-w-[160px]">
                {user.email}
              </span>
              <Link
                href="/my-profile"
                className="px-4 py-1.5 rounded-md font-medium text-gray-300 bg-transparent hover:bg-white/10 transition"
              >
                My Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-1.5 rounded-md font-bold bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow hover:from-orange-500 hover:to-amber-400 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-md font-medium text-gray-300 bg-transparent hover:bg-white/10 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 rounded-md font-bold bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow hover:from-orange-500 hover:to-amber-400 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded hover:bg-white/10 transition"
          aria-label="Open menu"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? (
            <XMarkIcon className="w-6 h-6 text-gray-200" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-gray-200" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-950/95 border-t border-white/10 px-4 pb-4 pt-2 shadow-sm">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`block font-medium py-2 px-2 rounded transition ${
                  pathname === link.href
                    ? "text-orange-400"
                    : "text-gray-300 hover:text-white"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex flex-col gap-2 mt-2">
              {!loading && user ? (
                <>
                  <span className="px-2 text-sm text-gray-400 truncate">
                    {user.email}
                  </span>
                  <Link
                    href="/my-profile"
                    className="px-4 py-2 rounded-md font-medium text-gray-300 bg-transparent hover:bg-white/10 transition text-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-md font-bold bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow hover:from-orange-500 hover:to-amber-400 transition text-center"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-md font-medium text-gray-300 bg-transparent hover:bg-white/10 transition text-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 rounded-md font-bold bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow hover:from-orange-500 hover:to-amber-400 transition text-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
