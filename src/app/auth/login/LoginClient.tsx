"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type Step = "email" | "otp";

export function LoginClient() {
  const { registerEmail, activateAccount } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [activeCode, setActiveCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 — request a login code
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await registerEmail(email);
      if (response.success) {
        toast.success("Code sent successfully");
        setStep("otp");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to send code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 — verify the 6-digit code
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await activateAccount(email, activeCode);
      if (response?.success && response.data?.accessToken) {
        toast.success("Login successful!");
        router.push("/");
      } else {
        toast.error(response?.message || "Invalid or expired code");
      }
    } catch (error) {
      toast.error("Failed to verify code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend a fresh code
  const handleResend = async () => {
    setIsLoading(true);
    try {
      const response = await authService.emailNewCode(email);
      if (response.success) {
        toast.success("A new code has been sent");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-bg px-4 pt-[18vh] pb-16">
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-surface p-8 shadow-card sm:p-10">
        <div className="text-center">
          <p className="font-display text-lg text-heading">A to Z Accessories</p>
          <h2 className="mt-5 font-display text-3xl text-heading">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            {step === "email"
              ? "Enter your email to receive a login code"
              : "Enter the code we sent to your email"}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="mt-8 space-y-6">
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
              disabled={isLoading}
              className="w-full rounded-full bg-primary px-4 py-3 font-medium text-on-primary shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <p className="text-center text-sm text-ink-muted">
                Code sent to{" "}
                <span className="text-ink">{email}</span>
              </p>

              <div>
                <label
                  htmlFor="activeCode"
                  className="block text-sm font-medium text-ink"
                >
                  Verification Code
                </label>
                <input
                  id="activeCode"
                  name="activeCode"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  value={activeCode}
                  onChange={(e) =>
                    setActiveCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="mt-1 w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-center tracking-[0.5em] text-ink placeholder:text-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  placeholder="000000"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || activeCode.length !== 6}
              className="w-full rounded-full bg-primary px-4 py-3 font-medium text-on-primary shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="rounded-sm font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
