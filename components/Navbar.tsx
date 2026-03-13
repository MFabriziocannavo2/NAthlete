"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const navLinks = [
  { label: "Athletes", href: "#" },
  { label: "Coaches", href: "#" },
  { label: "Highlights", href: "#" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="w-full z-30 bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-gray-900 select-none">
            NAthlete
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="#"
            className="px-4 py-1.5 rounded-md font-medium text-gray-700 bg-transparent hover:bg-gray-100 transition"
          >
            Login
          </Link>
          <Link
            href="#"
            className="px-4 py-1.5 rounded-md font-bold bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow hover:from-indigo-700 hover:to-pink-600 transition"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded hover:bg-gray-100 transition"
          aria-label="Open menu"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? (
            <XMarkIcon className="w-6 h-6 text-gray-700" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 border-t border-gray-100 px-4 pb-4 pt-2 shadow-sm">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block text-gray-700 hover:text-indigo-600 font-medium py-2 px-2 rounded transition"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex flex-col gap-2 mt-2">
              <Link
                href="#"
                className="px-4 py-2 rounded-md font-medium text-gray-700 bg-transparent hover:bg-gray-100 transition text-center"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                href="#"
                className="px-4 py-2 rounded-md font-bold bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow hover:from-indigo-700 hover:to-pink-600 transition text-center"
                onClick={() => setMobileOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
