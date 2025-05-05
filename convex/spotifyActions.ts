import { action, query, internalQuery, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const exchangeSpotifyCodeForToken = action({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID || "<YOUR_SPOTIFY_CLIENT_ID>";
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "<YOUR_SPOTIFY_CLIENT_SECRET>";
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || "https://yourdomain.com/admin/spotify-callback";

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: args.code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.refresh_token) {
        return { success: false as const, error: String(data.error_description || "No refresh token returned") };
      }
      return { success: true as const, refreshToken: data.refresh_token };
    } catch (err) {
      return { success: false as const, error: "Failed to fetch token: " + (err instanceof Error ? err.message : String(err)) };
    }
  },
});

// Define types for user and settings
interface User {
  _id: string;
  [key: string]: any;
}
interface WebsiteSettings {
  spotifyRefreshToken?: string;
  userId: string;
  [key: string]: any;
}

interface RefreshSpotifyDataResult {
  success: true;
} 
interface RefreshSpotifyDataError {
  success: false;
  error: string;
}

type RefreshSpotifyDataReturn = RefreshSpotifyDataResult | RefreshSpotifyDataError;

// Add this internal query to fetch a user by ID
export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const refreshSpotifyData = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<RefreshSpotifyDataReturn> => {
    const userId = args.userId;
    // Use internal query to fetch user by ID
    const user: User | null = await ctx.runQuery(internal.spotifyActions.getUserById, { userId });
    if (!user) {
      console.log("No user found for userId", userId);
      return { success: false, error: "User not found" };
    }
    // Get the refresh token from websiteSettings
    const settings: WebsiteSettings | null = await ctx.runQuery(internal.websiteSettings.getWebsiteSettings, { userId });
    if (!settings?.spotifyRefreshToken) {
      console.log("No spotifyRefreshToken for user", userId);
      return { success: false, error: "No Spotify refresh token found" };
    }
    console.log("Attempting to refresh Spotify data for user", userId);
    const refreshToken: string = settings.spotifyRefreshToken;
    const clientId = process.env.SPOTIFY_CLIENT_ID || "<YOUR_SPOTIFY_CLIENT_ID>";
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "<YOUR_SPOTIFY_CLIENT_SECRET>";
    // Step 1: Get a new access token using the refresh token
    let accessToken: string;
    try {
      console.log("Requesting new access token from Spotify for user", userId);
      const response: Response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
      const data: any = await response.json();
      if (!response.ok || !data.access_token) {
        console.log("Failed to refresh access token", data);
        return { success: false, error: String(data.error_description || "Failed to refresh access token") };
      }
      accessToken = data.access_token;
      console.log("Obtained access token for user", userId);
    } catch (err: any) {
      console.log("Error refreshing access token for user", userId, err);
      return { success: false, error: "Failed to refresh access token: " + (err instanceof Error ? err.message : String(err)) };
    }
    // Step 2: Fetch top artists and genres from Spotify
    let topArtists: any[] = [];
    let topGenres: Record<string, number> = {};
    try {
      console.log("Fetching top artists from Spotify for user", userId);
      const response: Response = await fetch("https://api.spotify.com/v1/me/top/artists?limit=10", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data: any = await response.json();
      if (!response.ok || !data.items) {
        console.log("Failed to fetch top artists", data);
        return { success: false, error: String(data.error?.message || "Failed to fetch top artists") };
      }
      topArtists = data.items.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        imageUrl: artist.images[0]?.url || "",
      }));
      // Compile top genres from artists
      for (const artist of data.items) {
        for (const genre of artist.genres) {
          topGenres[genre] = (topGenres[genre] || 0) + 1;
        }
      }
      console.log("Fetched top artists and genres for user", userId);
    } catch (err: any) {
      console.log("Error fetching top artists for user", userId, err);
      return { success: false, error: "Failed to fetch top artists: " + (err instanceof Error ? err.message : String(err)) };
    }
    // Convert topGenres to array and sort
    const topGenresArr = Object.entries(topGenres)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    // Step 3: Save to spotifyData table (internal mutation)
    try {
      console.log("Saving Spotify data to DB for user", userId);
      await ctx.runMutation(internal._internal.spotifyData.storeSpotifyData, {
        userId,
        topArtists,
        topGenres: topGenresArr,
        lastUpdated: Date.now(),
      });
      console.log("Saved Spotify data to DB for user", userId);
    } catch (err: any) {
      console.log("Error saving Spotify data to DB for user", userId, err);
      return { success: false, error: "Failed to save Spotify data: " + (err instanceof Error ? err.message : String(err)) };
    }
    return { success: true };
  },
});

// Query to get all users with a Spotify refresh token
export const usersWithSpotifyRefresh = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("websiteSettings")
      .collect();
  },
});

export const refreshAllSpotifyData = internalAction({
  args: {},
  handler: async (ctx: any): Promise<void> => {
    // Only refresh for the main user
    const mainUserId = "js79ghjgj36j4kdnx2aq1skb3d7f8bkk";
    console.log("Calling refreshSpotifyData for main user", mainUserId);
    await ctx.runAction(
      internal.spotifyActions.refreshSpotifyData,
      { userId: mainUserId }
    );
  },
}); 