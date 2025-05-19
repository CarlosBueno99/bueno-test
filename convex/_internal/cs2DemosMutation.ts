// import { internalMutation } from "../_generated/server";
// import { v } from "convex/values";

// export const storeParsedDemo = internalMutation({
//   args: {
//     fileId: v.string(),
//     parsedJson: v.any(),
//   },
//   handler: async (ctx, args) => {
//     // Use the index for efficient lookup
//     const existing = await ctx.db
//       .query("cs2Demos")
//       .withIndex("by_fileId", (q) => q.eq("fileId", args.fileId))
//       .unique();
//     const now = Date.now();
//     if (existing) {
//       await ctx.db.patch(existing._id, {
//         parsedJson: args.parsedJson,
//         updatedAt: now,
//       });
//       return existing._id;
//     } else {
//       return await ctx.db.insert("cs2Demos", {
//         fileId: args.fileId,
//         parsedJson: args.parsedJson,
//         createdAt: now,
//       });
//     }
//   },
// }); 