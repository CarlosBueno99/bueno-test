import { cronJobs } from "convex/server";
import { internal, api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";

const crons = cronJobs();

const MAIN_USER_ID = "js79ghjgj36j4kdnx2aq1skb3d7f8bkk";

export const refreshMainUserSteamData = internalAction({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.runQuery(internal.websiteSettings.getWebsiteSettings, {
      userId: MAIN_USER_ID as Id<"users">,
    });
    if (!settings || !settings.steamApiKey || !settings.steamId) {
      console.error("Steam API key or steamId not set in websiteSettings for main user");
      return;
    }
    await ctx.runAction(api.steamApi.refreshSteamData, {
      userId: MAIN_USER_ID as Id<"users">,
      steamApiKey: settings.steamApiKey,
      steamId: settings.steamId,
    });
  },
});

crons.interval(
  "Refresh Spotify data for all users every 1 minute",
  { minutes: 10 },
  internal.spotifyActions.refreshAllSpotifyData
);

// Add a cron to refresh Steam data every hour for the main user
crons.interval(
  "Refresh Steam data for main user every 1 hour",
  { hours: 1 },
  internal.crons.refreshMainUserSteamData
);

export default crons; 