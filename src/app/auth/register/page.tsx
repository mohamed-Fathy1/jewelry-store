"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsRegisterLoading(true);
      // POST /authentication/register-email — no OTP step, no token stored
      const response = await authService.registerEmail(email);
      if (response.success) {
        setIsSubmitted(true);
        toast.success("Check your email");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to register. Please try again.");
    } finally {
      setIsRegisterLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-bg px-4 pt-[14vh] pb-16">
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-surface p-8 shadow-card sm:p-10">
        <div className="text-center">
          <p className="font-display text-lg text-heading">A to Z Accessories</p>
          <h2 className="mt-5 font-display text-3xl text-heading">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Join us to explore our exclusive jewelry collection
          </p>
        </div>

        {isSubmitted ? (
          <div className="mt-8 rounded-xl border border-hairline bg-surface-muted p-6 text-center">
            <h3 className="font-display text-xl text-heading">
              Check your email
            </h3>
            <p className="mt-2 text-sm text-ink-muted">
              We&apos;ve sent a message to {email}. Please check your inbox to
              continue.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-ink"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-ink placeholder:text-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegisterLoading}
              className="w-full rounded-full bg-primary px-4 py-3 font-medium text-on-primary shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRegisterLoading ? "Registering..." : "Register"}
            </button>

            <p className="text-center text-ink-muted">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="rounded-sm font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
