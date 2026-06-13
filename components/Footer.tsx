import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo size="sm" />

        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/athletes" className="hover:text-white transition">
            Discover
          </Link>
          <Link href="/create-profile" className="hover:text-white transition">
            Create Profile
          </Link>
        </div>

        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} NAthlete. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
