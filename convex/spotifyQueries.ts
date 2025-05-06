import { query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { hasPermission } from "./auth";
import { Id } from "./_generated/dataModel";

// Get Spotify data for the current user
export const getSpotifyData = query({
  args: {},
  returns: v.union(v.null(), v.object({
    _id: v.id("spotifyData"),
    _creationTime: v.number(),
    userId: v.id("users"),
    topArtists: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        genres: v.array(v.string()),
        popularity: v.number(),
        imageUrl: v.string(),
      })
    ),
    topGenres: v.array(
      v.object({
        name: v.string(),
        count: v.number(),
      })
    ),
    lastUpdated: v.number(),
  })),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      return null;
    }

    // Only fetch the settings to check for existence, not to return credentials
    const settings = await ctx.db
      .query("websiteSettings")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .unique();

    const spotifyData = await ctx.db
      .query("spotifyData")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    // Only return the fields defined in the validator
    if (!spotifyData) return null;
    return {
      _id: spotifyData._id,
      _creationTime: spotifyData._creationTime,
      userId: spotifyData.userId,
      lastUpdated: spotifyData.lastUpdated,
      topArtists: spotifyData.topArtists,
      topGenres: spotifyData.topGenres,
    };
  },
});

// Get Spotify data for any user - requires viewer permission
export const getUserSpotifyData = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.union(v.null(), v.object({
    _id: v.id("spotifyData"),
    _creationTime: v.number(),
    userId: v.id("users"),
    topArtists: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        genres: v.array(v.string()),
        popularity: v.number(),
        imageUrl: v.string(),
      })
    ),
    topGenres: v.array(
      v.object({
        name: v.string(),
        count: v.number(),
      })
    ),
    lastUpdated: v.number(),
  })),
  handler: async (ctx, args) => {
    // Removed permission check for public access
    return await ctx.db
      .query("spotifyData")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

async function getSpotifyAccessToken(ctx: any, userId: Id<"users">): Promise<string | null> {
  const settings = await ctx.db
    .query("websiteSettings")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .unique();
  if (!settings?.spotifyRefreshToken) return null;
  const clientId = process.env.SPOTIFY_CLIENT_ID || "<YOUR_SPOTIFY_CLIENT_ID>";
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "<YOUR_SPOTIFY_CLIENT_SECRET>";
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: settings.spotifyRefreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.access_token) return null;
    return data.access_token;
  } catch {
    return null;
  }
}

export const getRecentlyPlayedTracks = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("websiteSettings")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .unique();
    if (!settings?.spotifyRefreshToken) {
      console.log("No Spotify refresh token found for user", args.userId);
      return null;
    }
    console.log("Found Spotify refresh token for user", args.userId);
    const accessToken = await getSpotifyAccessToken(ctx, args.userId);
    if (!accessToken) {
      console.log("Failed to get access token for user", args.userId);
      return null;
    }
    console.log("Obtained access token for user", args.userId);
    const response = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=10", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    if (!response.ok || !data.items) {
      console.log("Spotify API did not return items for recently played", data);
      return null;
    }
    console.log("Fetched recently played tracks for user", args.userId, data.items.length);
    return data.items.map((item: any) => ({
      track: {
        name: item.track.name,
        artists: item.track.artists.map((a: any) => a.name),
        album: item.track.album.name,
        imageUrl: item.track.album.images[0]?.url,
        playedAt: item.played_at,
      },
    }));
  },
});

export const getCurrentlyPlayingTrack = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("websiteSettings")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .unique();
    if (!settings?.spotifyRefreshToken) {
      console.log("No Spotify refresh token found for user", args.userId);
      return null;
    }
    console.log("Found Spotify refresh token for user", args.userId);
    const accessToken = await getSpotifyAccessToken(ctx, args.userId);
    if (!accessToken) {
      console.log("Failed to get access token for user", args.userId);
      return null;
    }
    console.log("Obtained access token for user", args.userId);
    const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.status === 204) {
      console.log("No track currently playing for user", args.userId);
      return null; // No track currently playing
    }
    const data = await response.json();
    if (!response.ok || !data.item) {
      console.log("Spotify API did not return item for currently playing", data);
      return null;
    }
    console.log("Fetched currently playing track for user", args.userId, data.item.name);
    return {
      name: data.item.name,
      artists: data.item.artists.map((a: any) => a.name),
      album: data.item.album.name,
      imageUrl: data.item.album.images[0]?.url,
      isPlaying: data.is_playing,
      progressMs: data.progress_ms,
      durationMs: data.item.duration_ms,
    };
  },
}); 