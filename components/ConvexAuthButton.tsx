"use client";

import { useConvexAuth } from "convex/react";
import { Button } from "./ui/button";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, SignOutButton, UserButton } from "@clerk/nextjs";

export function ClerkAuthButton() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const createUser = useMutation(api.auth.createUser);

  // When a user signs in, create their user record
  useEffect(() => {
    if (isAuthenticated) {
      createUser({});
    }
  }, [isAuthenticated, createUser]);

  if (isLoading) {
    return (
      <Button disabled variant="outline" size="sm">
        Loading...
      </Button>
    );
  }

  return (
    <>
      <Authenticated>
        <div className="flex items-center gap-2">
          <UserButton afterSignOutUrl="/" />
        </div>
      </Authenticated>
      
      <Unauthenticated>
        <SignInButton mode="modal">
          <Button size="sm">
            Sign In
          </Button>
        </SignInButton>
      </Unauthenticated>
    </>
  );
} 