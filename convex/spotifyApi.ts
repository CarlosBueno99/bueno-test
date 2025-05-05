"use node";

import { action } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Constants for Spotify API
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

// Define return type for spotifyData mutation
type SpotifyDataResponse = {
  success: boolean;
  spotifyDataId?: Id<"spotifyData">;
  error?: string;
};

// Refresh Spotify data for the current user
export const refreshSpotifyData = action({
  args: {
    userId: v.id("users"),
    accessToken: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    spotifyDataId: v.optional(v.id("spotifyData")),
    error: v.optional(v.string())
  }),
  handler: async (
    ctx,
    args: { userId: Id<"users">; accessToken: string }
  ): Promise<SpotifyDataResponse> => {
    try {
      // Fetch top artists from Spotify API
      const topArtistsResponse = await fetch(
        `${SPOTIFY_API_BASE_URL}/me/top/artists?time_range=short_term&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${args.accessToken}`,
          },
        }
      );

      if (!topArtistsResponse.ok) {
        throw new ConvexError("Failed to fetch top artists from Spotify API");
      }

      const topArtistsData = await topArtistsResponse.json();
      
      const topArtists = topArtistsData.items.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        imageUrl: artist.images[0]?.url || "",
      }));
      
      // Compile top genres from artists
      const genreCounts: Record<string, number> = {};
      topArtists.forEach((artist: any) => {
        artist.genres.forEach((genre: string) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      });
      
      const topGenres = Object.entries(genreCounts)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Save the data to our database
      const payload = {
        userId: args.userId,
        topArtists,
        topGenres,
        lastUpdated: Date.now(),
      };

      // Use the internal mutation to store this data
      const result: Id<"spotifyData"> = await ctx.runMutation(internal._internal.spotifyData.storeSpotifyData, payload);
      
      return { success: true, spotifyDataId: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// Special helper to generate Spotify authorization URL
export const getSpotifyAuthUrl = action({
  args: {
    clientId: v.string(),
    redirectUri: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const scope = 'user-read-private user-read-email user-top-read';
    const state = Math.random().toString(36).substring(2, 15);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: args.clientId,
      scope,
      redirect_uri: args.redirectUri,
      state,
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  },
});

// Exchange Spotify code for tokens
export const exchangeSpotifyCode = action({
  args: {
    code: v.string(),
    redirectUri: v.string(),
    clientId: v.string(),
    clientSecret: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: args.code,
      redirect_uri: args.redirectUri,
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${args.clientId}:${args.clientSecret}`).toString('base64')}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new ConvexError("Failed to exchange code for tokens");
    }

    return await response.json();
  },
});

// Refresh Spotify access token
export const refreshSpotifyToken = action({
  args: {
    refreshToken: v.string(),
    clientId: v.string(),
    clientSecret: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: args.refreshToken,
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${args.clientId}:${args.clientSecret}`).toString('base64')}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new ConvexError("Failed to refresh token");
    }

    return await response.json();
  },
}); 