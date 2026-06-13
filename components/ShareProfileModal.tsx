"use client";

import { useState } from "react";
import {
  CheckIcon,
  ClipboardIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import GlassCard from "@/components/ui/GlassCard";
import Logo from "@/components/ui/Logo";
import { LinkedInIcon, WhatsAppIcon, XIcon } from "@/components/ui/SocialIcons";

export default function ShareProfileModal({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast("Profile link copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Copy this link:", url);
    }
  };

  const handleMore = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        // user cancelled the share sheet
      }
    } else {
      handleCopy();
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const displayUrl = url.replace(/^https?:\/\//, "");

  const links = [
    {
      label: "WhatsApp",
      icon: <WhatsAppIcon />,
      href: `https://wa.me/?text=${encodedUrl}`,
      iconBg: "bg-green-500/20 text-green-400",
    },
    {
      label: "Email",
      icon: <EnvelopeIcon className="w-5 h-5" />,
      href: `mailto:?body=${encodedUrl}`,
      iconBg: "bg-white/10 text-gray-300",
    },
    {
      label: "X / Twitter",
      icon: <XIcon />,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}`,
      iconBg: "bg-white/10 text-gray-300",
    },
    {
      label: "LinkedIn",
      icon: <LinkedInIcon />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      iconBg: "bg-blue-500/20 text-blue-400",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <GlassCard
        className="w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <h2 className="text-lg font-bold text-white">Share Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-2">Your public profile link</p>
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 truncate bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200">
            {displayUrl}
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-white"
            aria-label="Copy link"
          >
            {copied ? (
              <CheckIcon className="w-5 h-5 text-green-400" />
            ) : (
              <ClipboardIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-3">Share via</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-2 group"
          >
            <span className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 text-gray-300 group-hover:bg-white/20 transition">
              {copied ? (
                <CheckIcon className="w-5 h-5 text-green-400" />
              ) : (
                <ClipboardIcon className="w-5 h-5" />
              )}
            </span>
            <span className="text-xs text-gray-400">Copy Link</span>
          </button>

          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 group"
            >
              <span
                className={`w-11 h-11 rounded-full flex items-center justify-center transition group-hover:opacity-80 ${link.iconBg}`}
              >
                {link.icon}
              </span>
              <span className="text-xs text-gray-400">{link.label}</span>
            </a>
          ))}

          <button
            onClick={handleMore}
            className="flex flex-col items-center gap-2 group"
          >
            <span className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 text-gray-300 group-hover:bg-white/20 transition">
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </span>
            <span className="text-xs text-gray-400">More</span>
          </button>
        </div>

        {toast && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 px-4 py-2 rounded-lg bg-gray-900 border border-white/10 text-sm text-white shadow-lg">
            {toast}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
