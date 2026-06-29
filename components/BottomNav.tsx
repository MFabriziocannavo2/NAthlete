"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  MagnifyingGlassIcon as SearchSolid,
  UserIcon as UserSolid,
} from "@heroicons/react/24/solid";

const links = [
  { href: "/", label: "Home", Icon: HomeIcon, ActiveIcon: HomeSolid },
  { href: "/athletes", label: "Discover", Icon: MagnifyingGlassIcon, ActiveIcon: SearchSolid },
  { href: "/my-profile", label: "My Profile", Icon: UserIcon, ActiveIcon: UserSolid },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-950/95 backdrop-blur-lg border-t border-white/10">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map(({ href, label, Icon, ActiveIcon }) => {
          const isActive =
            pathname === href ||
            (href !== "/" && pathname.startsWith(href));
          const Ico = isActive ? ActiveIcon : Icon;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-lg transition ${
                isActive ? "text-orange-400" : "text-gray-400 hover:text-white"
              }`}
            >
              <Ico className="w-6 h-6" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
