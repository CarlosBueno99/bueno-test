"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Id } from "../../convex/_generated/dataModel";

export default function OwnerPage() {
  const router = useRouter();
  const user = useQuery(api.auth.getMe);
  const permission = useQuery(api.auth.getUserPermission);
  const updateUserPermission = useMutation(api.auth.updateUserPermission);
  const saveWebsiteSettings = useMutation(api.websiteSettings.saveWebsiteSettings);

  const [apiKeys, setApiKeys] = useState({
    steamApiKey: "sk_************",
    steamId: "",
    spotifyClientId: "sp_************",
    spotifyClientSecret: "spcs_************"
  });

  const [deploymentInfo, setDeploymentInfo] = useState({
    environment: "production",
    version: "1.0.0",
    lastDeployed: "2023-10-15T12:30:00Z",
    deployedBy: "owner@example.com"
  });
  
  const [steamApiKey, setSteamApiKey] = useState(apiKeys.steamApiKey);
  const [steamId, setSteamId] = useState(apiKeys.steamId);

  // Check if user has owner permission
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
        <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Owner Dashboard</h1>
          <Card>
            <CardContent className="py-8 flex items-center justify-center">
              <p>Loading...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Check if has owner permission
  if (permission !== "owner") {
    router.push("/");
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Owner Dashboard</h1>
          <Card>
            <CardContent className="py-8 flex items-center justify-center">
              <p>This page requires owner permissions.</p>
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
        <h1 className="text-3xl font-bold mb-8">Owner Dashboard</h1>
        
        <Tabs defaultValue="api-keys">
          <TabsList className="mb-6">
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api-keys">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Key Management</CardTitle>
                  <CardDescription>View and update API keys for external services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="steam-key" className="text-sm font-medium">Steam API Key</label>
                    <div className="flex gap-2">
                      <Input
                        id="steam-key"
                        type="password"
                        value={steamApiKey}
                        onChange={(e) => setSteamApiKey(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          saveWebsiteSettings({
                            steamApiKey,
                            steamId,
                            spotifyClientId: apiKeys.spotifyClientId,
                            spotifyClientSecret: apiKeys.spotifyClientSecret,
                          })
                        }
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="spotify-id" className="text-sm font-medium">Spotify Client ID</label>
                    <div className="flex gap-2">
                      <Input
                        id="spotify-id"
                        type="password"
                        value={apiKeys.spotifyClientId}
                        onChange={(e) => setApiKeys({...apiKeys, spotifyClientId: e.target.value})}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => saveWebsiteSettings({ spotifyClientId: apiKeys.spotifyClientId })}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="spotify-secret" className="text-sm font-medium">Spotify Client Secret</label>
                    <div className="flex gap-2">
                      <Input
                        id="spotify-secret"
                        type="password"
                        value={apiKeys.spotifyClientSecret}
                        onChange={(e) => setApiKeys({...apiKeys, spotifyClientSecret: e.target.value})}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => saveWebsiteSettings({ spotifyClientSecret: apiKeys.spotifyClientSecret })}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="steam-id" className="text-sm font-medium">Steam ID</label>
                    <div className="flex gap-2">
                      <Input
                        id="steam-id"
                        type="text"
                        value={steamId}
                        onChange={e => setSteamId(e.target.value)}
                        placeholder="Enter your 17-digit Steam ID"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          saveWebsiteSettings({
                            steamApiKey,
                            steamId,
                            spotifyClientId: apiKeys.spotifyClientId,
                            spotifyClientSecret: apiKeys.spotifyClientSecret,
                          })
                        }
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Owner Privileges</CardTitle>
                  <CardDescription>Your current permission level: {permission}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>As the owner, you have full access to:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Manage all API keys and secrets</li>
                    <li>Control deployment settings</li>
                    <li>Configure security policies</li>
                    <li>Grant owner permissions to others</li>
                    <li>Access all restricted areas</li>
                  </ul>
                  
                  <div className="mt-6">
                    <p className="font-medium">Permission hierarchy:</p>
                    <div className="flex flex-col gap-2 mt-2">
                      <Badge variant="outline" className="justify-start">Viewer - Basic read access</Badge>
                      <Badge variant="outline" className="justify-start">Editor - Content management</Badge>
                      <Badge variant="outline" className="justify-start">Admin - System administration</Badge>
                      <Badge variant="default" className="justify-start">Owner - Full system control (You are here)</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="deployment">
            <Card>
              <CardHeader>
                <CardTitle>Deployment Information</CardTitle>
                <CardDescription>Details about your current deployment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium">Environment</h3>
                      <p className="mt-1">{deploymentInfo.environment}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Version</h3>
                      <p className="mt-1">{deploymentInfo.version}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Last Deployed</h3>
                      <p className="mt-1">{new Date(deploymentInfo.lastDeployed).toLocaleString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Deployed By</h3>
                      <p className="mt-1">{deploymentInfo.deployedBy}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-2">Deployment Actions</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Rebuild</Button>
                      <Button variant="outline" size="sm">Restart</Button>
                      <Button variant="destructive" size="sm">Reset Database</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security policies and access controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Authentication</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Email/Password Login</span>
                        <Badge>Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Google OAuth</span>
                        <Badge>Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>GitHub OAuth</span>
                        <Badge variant="outline">Disabled</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Session Management</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Session Timeout</span>
                        <span>30 minutes</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Remember Me</span>
                        <Badge>Enabled</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Access Controls</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>IP Restrictions</span>
                        <Badge variant="outline">Disabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Two-Factor Authentication</span>
                        <Badge variant="outline">Optional</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Security Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 