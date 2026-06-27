"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
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
        // Check for return URL
        const returnUrl = localStorage.getItem("returnUrl");
        if (returnUrl) {
          localStorage.removeItem("returnUrl"); // Clean up
          router.push(returnUrl);
        } else {
          router.push("/"); // Default fallback
        }
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
    <div className="flex min-h-screen items-start justify-center bg-bg px-4 pt-[18vh] pb-16">
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-surface p-8 shadow-card sm:p-10">
        <div className="text-center">
          <p className="font-display text-lg text-heading">A to Z Accessories</p>
          <h2 className="mt-5 font-display text-3xl text-heading">
            Authentication
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            A message with a verification code has been sent to your devices.
            Enter the code to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="mb-8 flex justify-center gap-2">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoFocus={index === 0} // auto focus on the first input
                maxLength={1}
                aria-label={`Verification code digit ${index + 1}`}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="h-12 w-12 rounded-lg border border-hairline bg-surface text-center text-lg text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                required
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={gettingActiveCode}
            className="w-full rounded-full bg-primary px-4 py-3 font-medium text-on-primary shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
          >
            {gettingActiveCode ? "Verifying..." : "Verify Account"}
          </button>

          <p className="mt-4 text-center text-ink-muted">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              className="rounded-sm font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
