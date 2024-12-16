"use client";
import { useState, useRef, KeyboardEvent } from "react";
import { colors } from "@/constants/colors";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const AccountActivation = () => {
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activationCode = verificationCode.join("");

    if (activationCode.length !== 6) {
      toast.error("Please enter the complete verification code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/authentication/active-account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ activationCode }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Account activated successfully!");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        toast.error(data.message || "Activation failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
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
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
            style={{
              backgroundColor: colors.brown,
              color: colors.textLight,
            }}
          >
            {isLoading ? "Verifying..." : "Verify Account"}
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
              onClick={() => {
                // Add resend code logic here
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
