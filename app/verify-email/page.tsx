"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import { resendConfirmationEmail } from "@/lib/auth";

const RESEND_COOLDOWN_SECONDS = 30;

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (!email || isSending || cooldown > 0) return;

    setIsSending(true);
    setError(null);
    setMessage(null);

    const { error: resendError } = await resendConfirmationEmail(email);

    if (resendError) {
      setError(resendError);
    } else {
      setMessage("Confirmation email sent. Please check your inbox.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    setIsSending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Navbar />

      <div className="max-w-md mx-auto px-6 py-16">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center">
            <EnvelopeIcon className="w-7 h-7 text-orange-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Check your email
          </h1>
          <p className="text-gray-400">
            We sent a confirmation link
            {email && (
              <>
                {" "}
                to <span className="text-white font-medium">{email}</span>
              </>
            )}
            . Click the link to verify your account before logging in.
          </p>
        </div>

        <GlassCard className="p-6 flex flex-col gap-4">
          {message && <p className="text-sm text-green-400 text-center">{message}</p>}
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={!email || isSending || cooldown > 0}
            onClick={handleResend}
          >
            {isSending
              ? "Sending..."
              : cooldown > 0
                ? `Resend confirmation email (${cooldown}s)`
                : "Resend confirmation email"}
          </Button>

          <ButtonLink href="/login" className="w-full">
            Go to Login
          </ButtonLink>
        </GlassCard>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Wrong email?{" "}
          <Link href="/signup" className="text-orange-400 hover:text-orange-300 font-medium">
            Sign up again
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
