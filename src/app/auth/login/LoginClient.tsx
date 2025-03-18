"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/constants/colors";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function LoginClient() {
  const [email, setEmail] = useState("");
  const { registerEmail } = useAuth();
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegisterLoading(true);
    try {
      const response = await registerEmail(email);
      if (response.success) {
        toast.success("Login successful!");
        router.push("/");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to log in. Please try again.", error);
    } finally {
      setIsRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center mt-[20vh] px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2
            className="text-3xl font-light"
            style={{ color: colors.textPrimary }}
          >
            Welcome Back
          </h2>
          <p className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
            Sign in to your account to continue
          </p>
        </div>

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
            {isRegisterLoading ? "Logging in..." : "Log in"}
          </button>

          <p className="text-center" style={{ color: colors.textSecondary }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-medium hover:underline"
              style={{ color: colors.brown }}
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
