import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Get the current authenticated user
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    return user;
  },
});

// Create a new user or get an existing one
export const createUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Called createUser without authentication");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    // If not, create a new user
    const userId = await ctx.db.insert("users", {
      name: identity.name ?? "",
      email: identity.email ?? "",
      tokenIdentifier: identity.tokenIdentifier,
      image: identity.pictureUrl,
      onboardingComplete: false,
    });

    // By default, assign "viewer" permission level
    await ctx.db.insert("permissions", {
      userId,
      role: "viewer",
    });

    return userId;
  },
});

// Update a user's profile
export const updateUser = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Called updateUser without authentication");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    return await ctx.db.patch(user._id, args);
  },
});

// Get a user's permission level
export const getUserPermission = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) {
      return null;
    }

    const permission = await ctx.db
      .query("permissions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    return permission ? permission.role : null;
  },
});

// Update a user's permission level (admin only)
export const updateUserPermission = mutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    // Check if the current user is an admin or owner
    const currentUserPermission = await ctx.db
      .query("permissions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!currentUserPermission || 
        (currentUserPermission.role !== "admin" && 
         currentUserPermission.role !== "owner")) {
      throw new ConvexError("Not authorized to update permissions");
    }

    // Find existing permission
    const existingPermission = await ctx.db
      .query("permissions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existingPermission) {
      // Don't allow modifying owner permissions unless you're an owner
      if (existingPermission.role === "owner" && currentUserPermission.role !== "owner") {
        throw new ConvexError("Only owners can modify owner permissions");
      }
      
      return await ctx.db.patch(existingPermission._id, { role: args.role });
    } else {
      return await ctx.db.insert("permissions", {
        userId: args.userId,
        role: args.role,
      });
    }
  },
});

// Helper function to get the current user
async function getUser(ctx: QueryCtx | MutationCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();
}

// Helper function to check if a user has the required permission level
export async function hasPermission(
  ctx: QueryCtx | MutationCtx,
  requiredPermission: string
): Promise<boolean> {
  const user = await getUser(ctx);
  if (!user) {
    return false;
  }

  const permissionLevels = {
    viewer: 0,
    editor: 1,
    admin: 2,
    owner: 3,
  };

  const permission = await ctx.db
    .query("permissions")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
    .unique();

  if (!permission) {
    return false;
  }

  const userLevel = permissionLevels[permission.role as keyof typeof permissionLevels] || -1;
  const requiredLevel = permissionLevels[requiredPermission as keyof typeof permissionLevels] || 99;

  return userLevel >= requiredLevel;
}

export const getOwnerUserIdPublic = query({
  args: {},
  handler: async (ctx) => {
    const ownerPermission = await ctx.db
      .query("permissions")
      .filter((q) => q.eq(q.field("role"), "owner"))
      .first();
    return ownerPermission ? ownerPermission.userId : null;
  },
}); 