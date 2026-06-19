"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
import { isAdmin } from "@/utils/auth.utils";
import { Button } from "@/components/admin/ui";
import toast from "react-hot-toast";

type Step = "email" | "otp";

export default function AdminLoginPage() {
  const router = useRouter();
  const { authUser, activateAccount } = useAuth();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [activeCode, setActiveCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Already-authenticated admins skip the login screen
  useEffect(() => {
    if (isAdmin(authUser)) {
      router.replace("/admin");
    }
  }, [authUser, router]);

  // Step 1 — request a login code
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await authService.registerEmail(email);
      // Admin branch responds 200 with data.email
      if (response.success && response.data?.email) {
        toast.success("OTP sent successfully");
        setStep("otp");
      } else {
        toast.error(response.message || "Unable to send a login code");
      }
    } catch (error) {
      toast.error("Failed to send a login code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 — verify the 6-digit OTP and establish the admin session
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await activateAccount(email, activeCode);
      if (response?.success && response.data?.accessToken) {
        toast.success("Logged in successfully");
        router.push("/admin");
      } else {
        toast.error(response?.message || "Invalid or expired code");
      }
    } catch (error) {
      toast.error("Failed to verify the code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend a fresh OTP
  const handleResend = async () => {
    try {
      setIsLoading(true);
      const response = await authService.emailNewCode(email);
      if (response.success) {
        toast.success("A new code has been sent to your email");
      } else {
        toast.error(response.message || "Unable to resend the code");
      }
    } catch (error) {
      toast.error("Failed to resend the code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-theme flex min-h-screen items-center justify-center bg-admin-canvas px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="block text-3xl font-normal italic leading-none text-admin-heading">
            A&nbsp;to&nbsp;Z
          </span>
          <span
            className="mx-auto mt-2 block h-px w-12 bg-admin-gold"
            aria-hidden="true"
          />
          <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-admin-ink-muted">
            Admin
          </span>
        </div>

        <div className="rounded-xl bg-admin-surface p-8 shadow-admin-card ring-1 ring-admin-hairline/60">
          <div className="text-center">
            <h1 className="text-2xl font-normal italic text-admin-heading">
              {step === "email" ? "Welcome Back" : "Check Your Email"}
            </h1>
            <p className="mt-2 text-pretty text-sm text-admin-ink-muted">
              {step === "email"
                ? "Enter your admin email to receive a login code."
                : `Enter the 6-digit code sent to ${email}.`}
            </p>
          </div>

          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-sm font-medium text-admin-ink"
                >
                  Email Address
                </label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-admin-hairline bg-admin-surface px-4 py-3 text-admin-ink transition-colors placeholder:text-admin-ink-subtle"
                  placeholder="you@example.com"
                />
              </div>

              <Button
                type="submit"
                loading={isLoading}
                className="w-full justify-center py-3"
              >
                Send Login Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="admin-otp"
                  className="block text-sm font-medium text-admin-ink"
                >
                  Verification Code
                </label>
                <input
                  id="admin-otp"
                  name="activeCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  spellCheck={false}
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  value={activeCode}
                  onChange={(e) =>
                    setActiveCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="tabular mt-1.5 w-full rounded-md border border-admin-hairline bg-admin-surface px-4 py-3 text-center text-lg tracking-[0.5em] text-admin-ink transition-colors placeholder:text-admin-ink-subtle"
                  placeholder="000000"
                />
              </div>

              <Button
                type="submit"
                loading={isLoading}
                disabled={activeCode.length !== 6}
                className="w-full justify-center py-3"
              >
                Verify &amp; Sign In
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-sm font-medium text-admin-brown hover:underline disabled:opacity-50"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
