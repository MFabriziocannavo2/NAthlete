"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getLoginErrorMessage, resendConfirmationEmail } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/ui/LoadingScreen";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setUnconfirmed(false);
    setResendMessage(null);
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const { message, unconfirmed: isUnconfirmed } = getLoginErrorMessage(error.message);
      setError(message);
      setUnconfirmed(isUnconfirmed);
      setIsSubmitting(false);
      return;
    }

    setRedirecting(true);
    router.push("/");
    router.refresh();
  };

  const handleResend = async () => {
    if (!email || resending) return;

    setResending(true);
    setResendMessage(null);

    const { error: resendError } = await resendConfirmationEmail(email);

    setResendMessage(
      resendError ?? "Confirmation email sent. Please check your inbox."
    );
    setResending(false);
  };

  if (redirecting) {
    return <LoadingScreen message="Logging you in..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Navbar />

      <div className="max-w-md mx-auto px-6 py-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Log In
          </h1>
          <p className="text-gray-400">
            Access your NAthlete account.
          </p>
        </div>

        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            {unconfirmed && (
              <div className="flex flex-col gap-2">
                {resendMessage && (
                  <p className="text-sm text-green-400">{resendMessage}</p>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  disabled={resending}
                  onClick={handleResend}
                >
                  {resending ? "Sending..." : "Resend confirmation email"}
                </Button>
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </GlassCard>

        <p className="text-center text-gray-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-orange-400 hover:text-orange-300 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
