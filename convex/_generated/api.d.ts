/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as _internal_cs2Demos from "../_internal/cs2Demos.js";
import type * as _internal_cs2DemosMutation from "../_internal/cs2DemosMutation.js";
import type * as _internal_spotifyData from "../_internal/spotifyData.js";
import type * as _internal_steamData from "../_internal/steamData.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as locations from "../locations.js";
import type * as privateNotes from "../privateNotes.js";
import type * as spotify from "../spotify.js";
import type * as spotifyActions from "../spotifyActions.js";
import type * as spotifyApi from "../spotifyApi.js";
import type * as spotifyQueries from "../spotifyQueries.js";
import type * as steamApi from "../steamApi.js";
import type * as steamQueries from "../steamQueries.js";
import type * as test from "../test.js";
import type * as users from "../users.js";
import type * as websiteSettings from "../websiteSettings.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "_internal/cs2Demos": typeof _internal_cs2Demos;
  "_internal/cs2DemosMutation": typeof _internal_cs2DemosMutation;
  "_internal/spotifyData": typeof _internal_spotifyData;
  "_internal/steamData": typeof _internal_steamData;
  auth: typeof auth;
  crons: typeof crons;
  locations: typeof locations;
  privateNotes: typeof privateNotes;
  spotify: typeof spotify;
  spotifyActions: typeof spotifyActions;
  spotifyApi: typeof spotifyApi;
  spotifyQueries: typeof spotifyQueries;
  steamApi: typeof steamApi;
  steamQueries: typeof steamQueries;
  test: typeof test;
  users: typeof users;
  websiteSettings: typeof websiteSettings;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
