"use client";

import { useState } from "react";
import Link from "next/link";
import { colors } from "@/constants/colors";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Replace with your actual login endpoint
      const response = await fetch(
        "http://localhost:5000/authentication/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Login successful!");
        // Handle successful login (e.g., redirect, store token)
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
                value={formData.email}
                onChange={handleChange}
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
            {isLoading ? "Signing in..." : "Sign in"}
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
