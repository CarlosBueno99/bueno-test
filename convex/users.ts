import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

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