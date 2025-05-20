import { log } from "console";
import { mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const saveWebsiteSettings = mutation({
  args: {
    steamApiKey: v.optional(v.string()),
    steamId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Find the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    // Upsert website settings (create or update)
    const existing = await ctx.db
      .query("websiteSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        steamApiKey: args.steamApiKey ?? existing.steamApiKey,
        steamId: args.steamId ?? existing.steamId,
      });
    } else {
      await ctx.db.insert("websiteSettings", {
        userId: user._id,
        steamApiKey: args.steamApiKey ?? "",
        steamId: args.steamId ?? "",
      });
    }
  },
});

export const saveSpotifyRefreshToken = mutation({
  args: { refreshToken: v.string() },
  returns: v.union(
    v.object({ success: v.literal(true) }),
    v.object({ success: v.literal(false), error: v.string() })
  ),
  handler: async (ctx, args) => {
    console.log("Saving ctx:", await ctx.auth.getUserIdentity());
    console.log("Saving Spotify refresh token:", args.refreshToken);
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false as const, error: "Not authenticated" };
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) {
      return { success: false as const, error: "User not found" };
    }
    const existing = await ctx.db
      .query("websiteSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    try {
      if (existing) {
        await ctx.db.patch(existing._id, { spotifyRefreshToken: args.refreshToken });
      } else {
        await ctx.db.insert("websiteSettings", {
          userId: user._id,
          spotifyRefreshToken: args.refreshToken,
        });
      }
      
    } catch (err) {
      return { success: false as const, error: "Failed to save refresh token: " + (err instanceof Error ? err.message : String(err)) };
    }
    return { success: true as const };
  },
});

export const getWebsiteSettings = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("websiteSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
}); 