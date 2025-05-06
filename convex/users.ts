import { internalQuery, query, action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getOwnerUserId = internalQuery({
  args: {},
  handler: async (ctx, args) => {
    const ownerPermission = await ctx.db
      .query("permissions")
      .filter((q) => q.eq(q.field("role"), "owner"))
      .first();
    return ownerPermission ? ownerPermission.userId : null;
  },
});

// Public action for frontend use
export const getOwnerUserIdAction = action({
  args: {},
  handler: async (ctx, args): Promise<string | null> => {
    return await ctx.runQuery(internal.users.getOwnerUserId, {});
  },
}); 