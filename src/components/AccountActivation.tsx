"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { isAdmin } from "@/utils/auth.utils";

const AccountActivation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const { activateAccount, registerEmail, authUser } = useAuth();
  const { getProfile } = useUser();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [gettingActiveCode, setGettingActiveCode] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Move to next input if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      // Move to previous input on backspace if current input is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    if (authUser?.accessToken) {
      if (isAdmin(authUser)) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [authUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGettingActiveCode(true);
    const activeCode = verificationCode.join("");

    if (activeCode.length !== 6) {
      setGettingActiveCode(false);
      toast.error("Please enter the complete verification code");
      return;
    }

    try {
      const response = await activateAccount(email, activeCode);
      console.log("response", response);

      if (response.success) {
        console.log("response", response);
        toast.success(response.message);
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to activate account. Please try again.", error);
    } finally {
      setGettingActiveCode(false);
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
            Authentication
          </h2>
          <p className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
            A message with a verification code has been sent to your devices.
            Enter the code to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="flex justify-center gap-2 mb-8">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                autoFocus={index === 0} // auto focus on the first input
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg border rounded-md focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
                required
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={gettingActiveCode}
            className="w-full py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
            style={{
              backgroundColor: colors.brown,
              color: colors.textLight,
            }}
          >
            {gettingActiveCode ? "Verifying..." : "Verify Account"}
          </button>

          <p
            className="text-center mt-4"
            style={{ color: colors.textSecondary }}
          >
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              className="font-medium hover:underline"
              style={{ color: colors.brown }}
              onClick={async () => {
                // Add resend code logic here
                await registerEmail(email);
                toast.success("New verification code sent!");
              }}
            >
              Resend
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AccountActivation;
