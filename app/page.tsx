"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { Navbar } from "../components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { useEffect } from "react";
import { Id } from "../convex/_generated/dataModel";

export default function Home() {
  const { isAuthenticated } = useConvexAuth();
  const createUser = useMutation(api.auth.createUser);

  // When a user signs in, create their user record
  useEffect(() => {
    if (isAuthenticated) {
      createUser({});
    }
  }, [isAuthenticated, createUser]);

  try {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          
          {/* <Unauthenticated>
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <h2 className="text-2xl font-semibold">Sign in to access your dashboard</h2>
              <p className="text-muted-foreground mb-4">Connect your accounts and view your stats</p>
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </Unauthenticated>
          
          <Authenticated>
            <DashboardContent />
          </Authenticated> */}
          <DashboardContent />
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error in Home page:", error);
    return <div>Something went wrong. Please try again later.</div>;
  }
}

function DashboardContent() {
  const user = useQuery(api.auth.getMe);
  const steamData = useQuery(api.steamQueries.getSteamData);
  const spotifyData = useQuery(api.spotifyQueries.getSpotifyData);

  // Fallback: main user id
  const MAIN_USER_ID = "js79ghjgj36j4kdnx2aq1skb3d7f8bkk" as Id<'users'>;
  const mainSteamData = useQuery(api.steamQueries.getUserSteamData, { userId: MAIN_USER_ID });
  const mainSpotifyData = useQuery(api.spotifyQueries.getUserSpotifyData, { userId: MAIN_USER_ID });

  try {
    // If any of the queries are still loading, show a loading state
    if (
      user === undefined ||
      steamData === undefined ||
      spotifyData === undefined ||
      mainSteamData === undefined ||
      mainSpotifyData === undefined
    ) {
      return <div className="animate-pulse">Loading data...</div>;
    }

    // Use fallback if not authenticated or if no data for current user
    const showMainSteam = !user || !steamData;
    const showMainSpotify = !user || !spotifyData;

    return (
      <Tabs defaultValue="steam" className="mb-8">
        <TabsList>
          <TabsTrigger value="steam">Steam Stats</TabsTrigger>
          <TabsTrigger value="spotify">Spotify Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="steam" className="pt-4">
          <div className="space-y-6">
            {showMainSteam && !mainSteamData && (
              <Alert>
                <AlertTitle>No Steam data available</AlertTitle>
                <AlertDescription>
                  Connect your Steam account to see your gaming stats.
                </AlertDescription>
              </Alert>
            )}
            
            {(showMainSteam ? mainSteamData : steamData) && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Games</CardTitle>
                    <CardDescription>
                      Last updated {formatDistanceToNow((showMainSteam ? mainSteamData! : steamData!).lastUpdated)} ago
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(showMainSteam ? mainSteamData! : steamData!).recentGames.map((game) => (
                        <div 
                          key={game.appId} 
                          className="flex items-center p-3 rounded-md border bg-card text-card-foreground"
                        >
                          <div className="aspect-[2/1] w-32 mr-3 rounded-md overflow-hidden bg-muted">
                            <img
                              src={game.headerImageUrl}
                              alt={game.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{game.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {Math.round(game.playtime2Weeks / 60)} hrs last 2 weeks
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(game.playtimeForever / 60)} hrs total
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {(showMainSteam ? mainSteamData! : steamData!)?.csStats && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Counter-Strike Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-muted rounded-md">
                          <p className="text-sm text-muted-foreground">Total Kills</p>
                          <p className="text-2xl font-bold">{(showMainSteam ? mainSteamData! : steamData!)?.csStats?.kills?.toLocaleString?.() ?? "-"}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-md">
                          <p className="text-sm text-muted-foreground">Total Deaths</p>
                          <p className="text-2xl font-bold">{(showMainSteam ? mainSteamData! : steamData!)?.csStats?.deaths?.toLocaleString?.() ?? "-"}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-md">
                          <p className="text-sm text-muted-foreground">Total Time</p>
                          <p className="text-2xl font-bold">{Math.round(((showMainSteam ? mainSteamData! : steamData!)?.csStats?.timePlayed ?? 0) / 3600)} hrs</p>
                        </div>
                        <div className="p-4 bg-muted rounded-md">
                          <p className="text-sm text-muted-foreground">Total Wins</p>
                          <p className="text-2xl font-bold">{(showMainSteam ? mainSteamData! : steamData!)?.csStats?.wins?.toLocaleString?.() ?? "-"}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-md col-span-2 md:col-span-4">
                          <p className="text-sm text-muted-foreground">K/D Ratio</p>
                          <p className="text-2xl font-bold">
                            {(() => {
                              const csStats = (showMainSteam ? mainSteamData! : steamData!)?.csStats;
                              if (!csStats) return "-";
                              return (csStats.kills / Math.max(1, csStats.deaths)).toFixed(2);
                            })()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="spotify" className="pt-4">
          <div className="space-y-6">
            {showMainSpotify && !mainSpotifyData && (
              <Alert>
                <AlertTitle>No Spotify data available</AlertTitle>
                <AlertDescription>
                  Connect your Spotify account to see your music stats.
                </AlertDescription>
              </Alert>
            )}
            
            {(showMainSpotify ? mainSpotifyData : spotifyData) && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Top Artists</CardTitle>
                    <CardDescription>
                      Last updated {formatDistanceToNow((showMainSpotify ? mainSpotifyData! : spotifyData!).lastUpdated)} ago
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {(showMainSpotify ? mainSpotifyData! : spotifyData!).topArtists.map((artist) => (
                        <div 
                          key={artist.id} 
                          className="flex flex-col items-center p-3 rounded-md border bg-card text-card-foreground"
                        >
                          <img 
                            src={artist.imageUrl} 
                            alt={artist.name} 
                            className="w-24 h-24 rounded-md mb-3" 
                          />
                          <h3 className="font-medium text-center">{artist.name}</h3>
                          <p className="text-xs text-muted-foreground text-center">
                            {artist.genres.slice(0, 2).join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Genres</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {(showMainSpotify ? mainSpotifyData! : spotifyData!).topGenres.map((genre) => (
                        <div 
                          key={genre.name} 
                          className="p-4 bg-muted rounded-md flex flex-col items-center justify-center"
                        >
                          <p className="text-lg font-medium text-center">{genre.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {genre.count} artist{genre.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    );
  } catch (error) {
    console.error("Error in DashboardContent:", error);
    return <div>Something went wrong loading your dashboard.</div>;
  }
}
