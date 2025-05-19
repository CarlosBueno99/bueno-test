import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table to store user information
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
    image: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()),
  }).index("by_token", ["tokenIdentifier"]),

  // User permissions table
  permissions: defineTable({
    userId: v.id("users"),
    role: v.string(), // "viewer", "editor", "admin", "owner"
  }).index("by_userId", ["userId"]),

  // Tasks table
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
    createdAt: v.optional(v.number()),
    userId: v.optional(v.id("users")),
  }).index("by_userId", ["userId"]),

  // Steam data table
  steamData: defineTable({
    userId: v.id("users"),
    recentGames: v.array(
      v.object({
        appId: v.string(),
        name: v.string(),
        playtime2Weeks: v.number(),
        playtimeForever: v.number(),
        imgIconUrl: v.string(),
        imgLogoUrl: v.string(),
        headerImageUrl: v.string(),
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
    lastUpdated: v.number(), // timestamp
  }).index("by_userId", ["userId"]),

  // Spotify data table
  spotifyData: defineTable({
    userId: v.id("users"),
    topArtists: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        genres: v.array(v.string()),
        popularity: v.number(),
        imageUrl: v.string(),
      })
    ),
    topGenres: v.array(
      v.object({
        name: v.string(),
        count: v.number(),
      })
    ),
    lastUpdated: v.number(), // timestamp
    recentlyPlayedTracks: v.optional(v.array(
      v.object({
        name: v.string(),
        artists: v.array(v.string()),
        album: v.string(),
        imageUrl: v.string(),
        playedAt: v.string(),
      })
    )),
  }).index("by_userId", ["userId"]),

  // Private notes table - requires permissions
  privateNotes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    accessLevel: v.string(), // "viewer", "editor", "admin", "owner"
  }).index("by_userId", ["userId"]),

  locations: defineTable({
    userId: v.id("users"),
    url: v.string(),
    insertedDate: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    displayName: v.string(),
  }),

  websiteSettings: defineTable({
    userId: v.id("users"),
    steamApiKey: v.optional(v.string()),
    steamId: v.optional(v.string()),
    spotifyRefreshToken: v.optional(v.string()),
    locationApiPassword: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  cs2Demos: defineTable({
    fileId: v.string(), // The id of the original demo file in storage
    parsedJson: v.any(), // The parsed JSON result
    createdAt: v.number(), // Timestamp when parsed
    updatedAt: v.optional(v.number()), // Timestamp when updated
  }).index("by_fileId", ["fileId"]),
}); 