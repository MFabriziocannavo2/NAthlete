"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/site";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getSiteUrl()}/login`,
      },
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
      return;
    }

    if (data.session) {
      router.push("/create-profile");
      router.refresh();
      return;
    }

    setMessage("Check your email to confirm your account before logging in.");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Navbar />

      <div className="max-w-md mx-auto px-6 py-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Create Account
          </h1>
          <p className="text-gray-400">
            Sign up to create your NAthlete profile.
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
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-400">{message}</p>}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </GlassCard>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-orange-400 hover:text-orange-300 font-medium"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
