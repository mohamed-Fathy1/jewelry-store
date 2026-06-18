"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { colors } from "@/constants/colors";
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
    <div className="min-h-screen flex mt-[15vh] justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2
            className="text-3xl font-light"
            style={{ color: colors.textPrimary }}
          >
            Create an Account
          </h2>
          <p className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
            Join us to explore our exclusive jewelry collection
          </p>
        </div>

        {isSubmitted ? (
          <div
            className="mt-8 text-center rounded-md border p-6"
            style={{
              backgroundColor: colors.accentLight,
              borderColor: colors.border,
            }}
          >
            <h3
              className="text-xl font-medium"
              style={{ color: colors.textPrimary }}
            >
              Check your email
            </h3>
            <p
              className="mt-2 text-sm"
              style={{ color: colors.textSecondary }}
            >
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
                  className="block text-sm font-medium"
                  style={{ color: colors.textPrimary }}
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
                  className="mt-1 w-full px-4 py-3 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegisterLoading}
              className="w-full py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
              style={{
                backgroundColor: colors.brown,
                color: colors.textLight,
              }}
            >
              {isRegisterLoading ? "Registering..." : "Register"}
            </button>

            <p className="text-center" style={{ color: colors.textSecondary }}>
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium hover:underline"
                style={{ color: colors.brown }}
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
