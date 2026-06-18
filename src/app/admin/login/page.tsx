"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
import { isAdmin } from "@/utils/auth.utils";
import { colors } from "@/constants/colors";
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
    <div className="min-h-screen flex justify-center mt-[15vh] px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2
            className="text-3xl font-light"
            style={{ color: colors.textPrimary }}
          >
            Admin Login
          </h2>
          <p className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
            {step === "email"
              ? "Enter your admin email to receive a login code"
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium"
                style={{ color: colors.textPrimary }}
              >
                Email Address
              </label>
              <input
                id="admin-email"
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
                placeholder="Enter your admin email"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
              style={{ backgroundColor: colors.brown, color: colors.textLight }}
            >
              {isLoading ? "Sending..." : "Send login code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="admin-otp"
                className="block text-sm font-medium"
                style={{ color: colors.textPrimary }}
              >
                Verification Code
              </label>
              <input
                id="admin-otp"
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
                className="mt-1 w-full px-4 py-3 rounded-md border tracking-[0.5em] text-center focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || activeCode.length !== 6}
              className="w-full py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
              style={{ backgroundColor: colors.brown, color: colors.textLight }}
            >
              {isLoading ? "Verifying..." : "Verify & sign in"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="font-medium hover:underline disabled:opacity-50"
                style={{ color: colors.brown }}
              >
                Resend code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
