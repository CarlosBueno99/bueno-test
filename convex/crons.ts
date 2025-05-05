import { cronJobs } from "convex/server";
import { internal, api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";

const crons = cronJobs();

export const refreshMainUserSteamData = internalAction({
  args: {},
  handler: async (ctx) => {
    // Query for the user with 'owner' permission using an internalQuery
    const ownerUserId = await ctx.runQuery(internal.users.getOwnerUserId, {});
    if (!ownerUserId) {
      console.error("No user with 'owner' permission found");
      return;
    }
    const MAIN_USER_ID = ownerUserId as Id<"users">;
    const settings = await ctx.runQuery(internal.websiteSettings.getWebsiteSettings, {
      userId: MAIN_USER_ID,
    });
    if (!settings || !settings.steamApiKey || !settings.steamId) {
      console.error("Steam API key or steamId not set in websiteSettings for main user");
      return;
    }
    await ctx.runAction(api.steamApi.refreshSteamData, {
      userId: MAIN_USER_ID,
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