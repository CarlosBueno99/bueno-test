"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { useEffect } from "react";

export default function ViewerPage() {
  const router = useRouter();
  const user = useQuery(api.auth.getMe);
  const permission = useQuery(api.auth.getUserPermission);
  
  // Check if user has at least viewer permissions
  useEffect(() => {
    if (permission === null && user !== undefined) {
      // User is logged in but has no permissions, redirect to home
      router.push("/");
    }
  }, [permission, user, router]);

  try {
    // If still loading or not authenticated, show loading state
    if (!user || !permission) {
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow w-full max-w-5xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-8">Viewer Dashboard</h1>
            <Card>
              <CardContent className="py-8 flex items-center justify-center">
                <p>Loading...</p>
              </CardContent>
            </Card>
          </main>
        </div>
      );
    }

    // Check if has at least viewer permission
    if (!["viewer", "editor", "admin", "owner"].includes(permission)) {
      router.push("/");
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow w-full max-w-5xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-8">Viewer Dashboard</h1>
            <Card>
              <CardContent className="py-8 flex items-center justify-center">
                <p>You don't have permission to view this page.</p>
              </CardContent>
            </Card>
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Viewer Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Stats</CardTitle>
                <CardDescription>View basic analytics and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is a protected page that requires at least "viewer" permissions.</p>
                <p className="mt-4 text-muted-foreground">
                  As a viewer, you can see basic statistics and analytics, but cannot edit any content.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>View-Only Access</CardTitle>
                <CardDescription>Your current permission level: {permission}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Permission hierarchy:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li className="text-green-500">Viewer (You are here)</li>
                  <li>Editor</li>
                  <li>Admin</li>
                  <li>Owner</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error in ViewerPage:", error);
    return <div>Something went wrong. Please try again later.</div>;
  }
} 