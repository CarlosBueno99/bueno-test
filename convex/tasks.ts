import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Get all tasks for the current user
export const get = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Look up the user by their tokenIdentifier
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    
    if (!user) {
      return [];
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", q => q.eq("userId", user._id))
      .order("desc")
      .collect();
    
    return tasks;
  },
});

// Add a new task
export const add = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Look up the user by their tokenIdentifier
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    const taskId = await ctx.db.insert("tasks", {
      text: args.text,
      isCompleted: false,
      createdAt: Date.now(),
      userId: user._id
    });

    return taskId;
  },
});

// Toggle a task's completed status
export const toggle = mutation({
  args: { 
    id: v.id("tasks"),
    isCompleted: v.boolean()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Look up the user by their tokenIdentifier
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Verify the task belongs to the user
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== user._id) {
      throw new ConvexError("Task not found or access denied");
    }

    await ctx.db.patch(args.id, {
      isCompleted: args.isCompleted
    });
  },
});

// Delete a task
export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Look up the user by their tokenIdentifier
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Verify the task belongs to the user
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== user._id) {
      throw new ConvexError("Task not found or access denied");
    }

    await ctx.db.delete(args.id);
  },
});