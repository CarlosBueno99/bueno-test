import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

// Internal mutation to store Steam data
export const storeSteamData = internalMutation({
  args: {
    userId: v.id("users"),
    recentGames: v.array(
      v.object({
        appId: v.string(),
        name: v.string(),
        playtime2Weeks: v.number(),
        playtimeForever: v.number(),
        imgIconUrl: v.string(),
        imgLogoUrl: v.string(),
        headerImageUrl: v.optional(v.string()),
      })
    ),
    csStats: v.optional(
      v.object({
        kills: v.number(),
        deaths: v.number(),
        timePlayed: v.number(),
        wins: v.number(),
      })
    ),
    lastUpdated: v.number(),
  },
  returns: v.id("steamData"),
  handler: async (ctx, args) => {
    // Check if there's already data for this user
    const existingData = await ctx.db
      .query("steamData")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    let steamDataId: Id<"steamData">;
    
    if (existingData) {
      // Update existing data
      await ctx.db.patch(existingData._id, {
        recentGames: args.recentGames.map(game => ({
          ...game,
          headerImageUrl: game.headerImageUrl ?? "",
        })),
        ...(args.csStats && { csStats: args.csStats }),
        lastUpdated: args.lastUpdated,
      });
      steamDataId = existingData._id;
    } else {
      // Create new data
      steamDataId = await ctx.db.insert("steamData", {
        userId: args.userId,
        recentGames: args.recentGames.map(game => ({
          ...game,
          headerImageUrl: game.headerImageUrl ?? "",
        })),
        ...(args.csStats && { csStats: args.csStats }),
        lastUpdated: args.lastUpdated,
      });
    }
    
    return steamDataId;
  },
}); 