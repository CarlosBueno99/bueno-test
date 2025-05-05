"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Id } from "../../convex/_generated/dataModel";
import { Badge } from "../../components/ui/badge";

export default function AdminPage() {
  const router = useRouter();
  const user = useQuery(api.auth.getMe);
  const permission = useQuery(api.auth.getUserPermission);
  const updateUserPermission = useMutation(api.auth.updateUserPermission);

  const [email, setEmail] = useState("");
  const [newPermission, setNewPermission] = useState("viewer");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Check if user has at least admin permissions
  useEffect(() => {
    if (permission === null && user !== undefined) {
      // User is logged in but has no permissions, redirect to home
      router.push("/");
    }
  }, [permission, user, router]);

  // If still loading or not authenticated, show loading state
  if (!user || !permission) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow w-full max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          <Card>
            <CardContent className="py-8 flex items-center justify-center">
              <p>Loading...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Check if has at least admin permission
  if (!["admin", "owner"].includes(permission)) {
    router.push("/");
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow w-full max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          <Card>
            <CardContent className="py-8 flex items-center justify-center">
              <p>You need admin permissions to view this page.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const handleUpdatePermission = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      
      // This is a simplified example - in a real implementation, you would:
      // 1. Find the user by email
      // 2. Get their ID
      // 3. Update their permission
      
      // For this demo, let's assume we have the user ID already
      const targetUserId = "user123" as Id<"users">;
      
      await updateUserPermission({
        userId: targetUserId,
        role: newPermission
      });
      
      setSuccessMessage(`Successfully updated user permission to ${newPermission}`);
      setEmail("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage User Permissions</CardTitle>
              <CardDescription>Change a user's permission level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">User Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="permission" className="text-sm font-medium">New Permission Level</label>
                  <select
                    id="permission"
                    value={newPermission}
                    onChange={(e) => setNewPermission(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                    {permission === "owner" && <option value="owner">Owner</option>}
                  </select>
                </div>
                
                {errorMessage && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {errorMessage}
                  </div>
                )}
                
                {successMessage && (
                  <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
                    {successMessage}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleUpdatePermission}
                disabled={!email}
              >
                Update Permission
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Administrative Control</CardTitle>
              <CardDescription>Your current permission level: {permission}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>As an administrator, you can:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Change user permission levels</li>
                <li>Manage system settings</li>
                <li>Monitor site activity</li>
                <li>Configure security policies</li>
              </ul>
              
              <div className="mt-6">
                <p className="font-medium">Permission hierarchy:</p>
                <div className="flex flex-col gap-2 mt-2">
                  <Badge variant="outline" className="justify-start">Viewer - Basic read access</Badge>
                  <Badge variant="outline" className="justify-start">Editor - Content management</Badge>
                  <Badge variant="secondary" className="justify-start">Admin - System administration (You are here)</Badge>
                  <Badge variant="outline" className="justify-start">Owner - Full system control</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Spotify Connect Card */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Spotify Integration</CardTitle>
              <CardDescription>
                Connect your admin account to Spotify to enable site-wide Spotify features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "<YOUR_SPOTIFY_CLIENT_ID>";
                  const redirectUri = encodeURIComponent(
                    process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || "https://yourdomain.com/api/spotify-callback"
                  );
                  const scopes = encodeURIComponent("user-top-read user-read-email");
                  window.location.href =
                    `https://accounts.spotify.com/authorize?client_id=${clientId}` +
                    `&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}`;
                }}
              >
                Connect to Spotify
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 