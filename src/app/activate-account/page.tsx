"use client";

import { Suspense } from "react";
import AccountActivation from "@/components/AccountActivation";

export default function ActivateAccountPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccountActivation />
    </Suspense>
  );
}
