"use client";

import { Suspense } from "react";
import AccountActivation from "@/components/AccountActivation";
import LoadingSpinner from "../../components/LoadingSpinner"; // Import the new loading component

export default function ActivateAccountPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AccountActivation />
    </Suspense>
  );
}
