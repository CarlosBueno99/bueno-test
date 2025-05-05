"use node";

import { action } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Define return type for steamData mutation
type SteamDataResponse = {
  success: boolean;
  steamDataId?: Id<"steamData">;
  error?: string;
};

// Refresh Steam data for the current user
export const refreshSteamData = action({
  args: {
    userId: v.id("users"),
    steamApiKey: v.string(),
    steamId: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    steamDataId: v.optional(v.id("steamData")),
    error: v.optional(v.string())
  }),
  handler: async (
    ctx,
    args: { userId: Id<"users">; steamApiKey: string; steamId: string }
  ): Promise<SteamDataResponse> => {
    try {
      // Fetch recent games from Steam API
      const recentGamesResponse = await fetch(
        `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${args.steamApiKey}&steamid=${args.steamId}&format=json`
      );

      if (!recentGamesResponse.ok) {
        throw new ConvexError("Failed to fetch recent games from Steam API");
      }

      const recentGamesData = await recentGamesResponse.json();
      
      const recentGames = recentGamesData.response.games.map((game: any) => ({
        appId: game.appid.toString(),
        name: game.name,
        playtime2Weeks: game.playtime_2weeks || 0,
        playtimeForever: game.playtime_forever || 0,
        imgIconUrl: `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`,
        imgLogoUrl: `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_logo_url}.jpg`,
        headerImageUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
      }));

      // Fetch CS stats (simplified - in real app, would need to detect CS:GO app ID)
      let csStats = null;
      
      try {
        // Try to find CS:GO in the recent games
        const csgoGame = recentGamesData.response.games.find((game: any) => 
          game.appid === 730 // CS:GO app ID
        );
        
        if (csgoGame) {
          const csStatsResponse = await fetch(
            `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${args.steamApiKey}&steamid=${args.steamId}`
          );
          
          if (csStatsResponse.ok) {
            const csStatsData = await csStatsResponse.json();
            
            // Process CS:GO stats
            const stats = csStatsData.playerstats.stats;
            
            // Find relevant stats
            const totalKills = stats.find((stat: any) => stat.name === "total_kills")?.value || 0;
            const totalDeaths = stats.find((stat: any) => stat.name === "total_deaths")?.value || 0;
            const totalTimePlayed = stats.find((stat: any) => stat.name === "total_time_played")?.value || 0;
            const totalWins = stats.find((stat: any) => stat.name === "total_wins")?.value || 0;
            
            csStats = {
              kills: totalKills,
              deaths: totalDeaths,
              timePlayed: totalTimePlayed,
              wins: totalWins,
            };
          }
        }
      } catch (error) {
        // If CS:GO stats fail, we still want to continue with the rest of the data
        console.error("Error fetching CS:GO stats:", error);
      }

      // Save the data to our database
      const payload = {
        userId: args.userId,
        recentGames,
        ...(csStats && { csStats }),
        lastUpdated: Date.now(),
      };

      // Use the internal mutation to store this data
      const result: Id<"steamData"> = await ctx.runMutation(internal._internal.steamData.storeSteamData, payload);
      
      return { success: true, steamDataId: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
}); 