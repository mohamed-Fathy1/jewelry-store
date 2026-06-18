"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
import { colors } from "@/constants/colors";
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
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
              style={{
                backgroundColor: colors.brown,
                color: colors.textLight,
              }}
            >
              {isLoading ? "Sending..." : "Send Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <p
                className="text-center text-sm"
                style={{ color: colors.textSecondary }}
              >
                Code sent to{" "}
                <span style={{ color: colors.textPrimary }}>{email}</span>
              </p>

              <div>
                <label
                  htmlFor="activeCode"
                  className="block text-sm font-medium"
                  style={{ color: colors.textPrimary }}
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
                  className="mt-1 w-full px-4 py-3 rounded-md border tracking-[0.5em] text-center focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                  placeholder="000000"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || activeCode.length !== 6}
              className="w-full py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
              style={{
                backgroundColor: colors.brown,
                color: colors.textLight,
              }}
            >
              {isLoading ? "Verifying..." : "Verify"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="font-medium hover:underline disabled:opacity-50"
                style={{ color: colors.brown }}
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
