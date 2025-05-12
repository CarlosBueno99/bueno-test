import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const addLocation = mutation({
  args: {
    userId: v.id("users"),
    url: v.string(),
    insertedDate: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("locations", {
      userId: args.userId,
      url: args.url,
      insertedDate: args.insertedDate,
      latitude: args.latitude,
      longitude: args.longitude,
      displayName: args.displayName,
    });
  },
});

export const getLocationHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Fetch permission for the user
    const permissionDoc = await ctx.db
      .query("permissions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    const permission = permissionDoc?.role;
    if (permission !== "relatives" && permission !== "owner") {
      return [];
    }
    const locations = await ctx.db
      .query("locations")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    // Sort by insertedDate descending
    return locations.sort((a, b) => b.insertedDate.localeCompare(a.insertedDate));
  },
}); 