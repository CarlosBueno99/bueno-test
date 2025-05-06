import { action, internalQuery, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// --- Types ---
interface User {
  _id: string;
  [key: string]: any;
}
interface WebsiteSettings {
  spotifyRefreshToken?: string;
  userId: string;
  [key: string]: any;
}

// --- Spotify OAuth Exchange ---
export const exchangeSpotifyCodeForToken = action({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID || "<YOUR_SPOTIFY_CLIENT_ID>";
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "<YOUR_SPOTIFY_CLIENT_SECRET>";
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || "https://yourdomain.com/api/spotify-callback";
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

// --- Internal Queries ---
export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const usersWithSpotifyRefresh = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("websiteSettings").collect();
  },
});

// --- Internal Actions ---
export const refreshSpotifyData = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<any> => {
    // Delegate to the unified logic in convex/spotify.ts
    return await ctx.runAction(internal.spotify.refreshSpotifyData, { userId: args.userId });
  },
});

export const refreshAllSpotifyData = internalAction({
  args: {},
  handler: async (ctx: any): Promise<void> => {
    // Only refresh for the main user
    const mainUserId = "js79ghjgj36j4kdnx2aq1skb3d7f8bkk";
    console.log("Calling refreshSpotifyData for main user", mainUserId);
    await ctx.runAction(
      internal.spotify.refreshSpotifyData,
      { userId: mainUserId }
    );
  },
});

// --- Public Actions ---
export const triggerSpotifyRefresh = action({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<any> => {
    return await ctx.runAction(internal.spotifyActions.refreshSpotifyData, { userId: args.userId });
  },
}); 