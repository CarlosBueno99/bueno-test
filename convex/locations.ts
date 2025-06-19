import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";

export const addLocation = mutation({
  args: v.object({
    userId: v.id("users"),
    url: v.string(),
    insertedDate: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    displayName: v.string(),
    altitude: v.optional(v.number()),
    street: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    region: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    label: v.optional(v.string()),
    full: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    // Check if the user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User does not exist");
    }
    return await ctx.db.insert("locations", args);
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