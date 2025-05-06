import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

// Internal mutation to store Spotify data
export const storeSpotifyData = internalMutation({
  args: {
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
    recentlyPlayedTracks: v.optional(v.array(
      v.object({
        name: v.string(),
        artists: v.array(v.string()),
        album: v.string(),
        imageUrl: v.string(),
        playedAt: v.string(),
      })
    )),
  },
  returns: v.id("spotifyData"),
  handler: async (ctx, args) => {
    // Check if there's already data for this user
    const existingData = await ctx.db
      .query("spotifyData")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    let spotifyDataId: Id<"spotifyData">;
    
    if (existingData) {
      // Update existing data
      console.log("[storeSpotifyData] Patching existing spotifyData for user", args.userId, {
        topArtists: args.topArtists,
        topGenres: args.topGenres,
        lastUpdated: args.lastUpdated,
        recentlyPlayedTracks: args.recentlyPlayedTracks,
      });
      await ctx.db.patch(existingData._id, {
        topArtists: args.topArtists,
        topGenres: args.topGenres,
        lastUpdated: args.lastUpdated,
        ...(args.recentlyPlayedTracks && { recentlyPlayedTracks: args.recentlyPlayedTracks }),
      });
      const updatedDoc = await ctx.db.get(existingData._id);
      console.log("[storeSpotifyData] After patch, document:", updatedDoc);
      spotifyDataId = existingData._id;
    } else {
      // Create new data
      const insertData = {
        userId: args.userId,
        topArtists: args.topArtists,
        topGenres: args.topGenres,
        lastUpdated: args.lastUpdated,
        ...(args.recentlyPlayedTracks && { recentlyPlayedTracks: args.recentlyPlayedTracks }),
      };
      console.log("[storeSpotifyData] Inserting new spotifyData for user", args.userId, insertData);
      spotifyDataId = await ctx.db.insert("spotifyData", insertData);
      const insertedDoc = await ctx.db.get(spotifyDataId);
      console.log("[storeSpotifyData] After insert, document:", insertedDoc);
    }
    
    return spotifyDataId;
  },
}); 