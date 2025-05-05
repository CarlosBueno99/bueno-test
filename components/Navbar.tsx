"use client";

import { useQuery, useConvexAuth } from "convex/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "../convex/_generated/api";
import { Button } from "./ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { LucideMenu } from "lucide-react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.auth.getMe);
  const permission = useQuery(api.auth.getUserPermission);
  
  const navLinks = [
    { name: "Home", href: "/" },
  ];

  // Permission-based links
  if (permission) {
    // Viewer can access stats
    if (["viewer", "editor", "admin", "owner"].includes(permission)) {
      navLinks.push({ name: "Stats", href: "/viewer" });
    }
    
    // Editor can access notes
    if (["editor", "admin", "owner"].includes(permission)) {
      navLinks.push({ name: "Notes", href: "/editor" });
    }
    
    // Admin can access settings
    if (["admin", "owner"].includes(permission)) {
      navLinks.push({ name: "Settings", href: "/admin" });
    }
    
    // Owner can access system
    if (permission === "owner") {
      navLinks.push({ name: "System", href: "/owner" });
    }
  }

  return (
    <header className="border-b border-border">
      <div className="w-full max-w-5xl mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <img src="/image.png" alt="Portfolio Face" className="w-8 h-8 rounded-full object-cover mr-2" />
          </Link>
          <nav className="hidden md:flex gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  pathname === link.href
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Authenticated>
            <div className="flex items-center gap-4">
              {user && (
                <span className="hidden md:inline text-sm text-muted-foreground">
                  {user.name || user.email}
                </span>
              )}
              <UserButton afterSignOutUrl="/" />
            </div>
          </Authenticated>
          
          <Unauthenticated>
            <SignInButton mode="modal">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </SignInButton>
          </Unauthenticated>
          
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <LucideMenu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {navLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
} 