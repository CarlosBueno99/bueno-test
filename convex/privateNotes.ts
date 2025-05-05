import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { hasPermission } from "./auth";

// Get notes for the current user
export const getNotes = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) {
      return [];
    }
    
    const permission = await getUserPermission(ctx);
    if (!permission) {
      return [];
    }
    
    const permissionLevels = {
      viewer: 0,
      editor: 1,
      admin: 2,
      owner: 3,
    };
    
    const userLevel = permissionLevels[permission as keyof typeof permissionLevels] || -1;
    
    const notes = await ctx.db
      .query("privateNotes")
      .filter((q) => {
        const noteAccessLevel = q.field("accessLevel");
        
        return q.or(
          q.eq(q.field("userId"), user._id),
          q.and(
            q.eq(noteAccessLevel, "viewer"),
            q.gte(userLevel, permissionLevels.viewer)
          ),
          q.and(
            q.eq(noteAccessLevel, "editor"),
            q.gte(userLevel, permissionLevels.editor)
          ),
          q.and(
            q.eq(noteAccessLevel, "admin"),
            q.gte(userLevel, permissionLevels.admin)
          ),
          q.and(
            q.eq(noteAccessLevel, "owner"),
            q.gte(userLevel, permissionLevels.owner)
          )
        );
      })
      .order("desc")
      .collect();
    
    return notes;
  },
});

// Create a new note
export const createNote = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    accessLevel: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }
    
    const permission = await getUserPermission(ctx);
    if (!permission) {
      throw new ConvexError("No permission level assigned");
    }
    
    // Check if the user has at least editor permission
    if (!await hasPermission(ctx, "editor")) {
      throw new ConvexError("Editor permission required");
    }
    
    // Validate access level is one of the allowed values
    if (!["viewer", "editor", "admin", "owner"].includes(args.accessLevel)) {
      throw new ConvexError("Invalid access level");
    }
    
    // Users can only create notes with access level <= their own permission level
    const permissionLevels = {
      viewer: 0,
      editor: 1,
      admin: 2,
      owner: 3,
    };
    
    const userLevel = permissionLevels[permission as keyof typeof permissionLevels];
    const noteLevel = permissionLevels[args.accessLevel as keyof typeof permissionLevels];
    
    if (noteLevel > userLevel) {
      throw new ConvexError(`Cannot create note with ${args.accessLevel} access when you have ${permission} permission`);
    }
    
    const now = Date.now();
    
    return await ctx.db.insert("privateNotes", {
      userId: user._id,
      title: args.title,
      content: args.content,
      createdAt: now,
      updatedAt: now,
      accessLevel: args.accessLevel,
    });
  },
});

// Delete a note
export const deleteNote = mutation({
  args: {
    noteId: v.id("privateNotes"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }
    
    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new ConvexError("Note not found");
    }
    
    // Users can delete their own notes
    if (note.userId === user._id) {
      return await ctx.db.delete(args.noteId);
    }
    
    // Admins and owners can delete any note
    if (await hasPermission(ctx, "admin")) {
      return await ctx.db.delete(args.noteId);
    }
    
    throw new ConvexError("Not authorized to delete this note");
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

// Helper function to get the user's permission level
async function getUserPermission(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const user = await getUser(ctx);
  if (!user) {
    return null;
  }

  const permission = await ctx.db
    .query("permissions")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
    .unique();

  return permission ? permission.role : null;
} 