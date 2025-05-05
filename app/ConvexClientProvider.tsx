"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

// Create the Convex client
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey="pk_test_YmVjb21pbmctcG9ycG9pc2UtMjMuY2xlcmsuYWNjb3VudHMuZGV2JA">
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

function AuthLoadingComponent() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="animate-pulse text-center">
        <p className="text-lg text-gray-500">Loading authentication...</p>
      </div>
    </div>
  );
}