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
      await ctx.db.patch(existingData._id, {
        topArtists: args.topArtists,
        topGenres: args.topGenres,
        lastUpdated: args.lastUpdated,
      });
      spotifyDataId = existingData._id;
    } else {
      // Create new data
      spotifyDataId = await ctx.db.insert("spotifyData", {
        userId: args.userId,
        topArtists: args.topArtists,
        topGenres: args.topGenres,
        lastUpdated: args.lastUpdated,
      });
    }
    
    return spotifyDataId;
  },
}); 