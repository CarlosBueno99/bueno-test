import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { auth } from '@clerk/nextjs/server';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function getBaseUrl(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const host = forwardedHost || request.headers.get("host");
  const protocol = forwardedProto;
  return `${protocol}://${host}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const baseUrl = getBaseUrl(request);

  if (!code) {
    return NextResponse.redirect(new URL('/admin?error=no_code_provided', baseUrl));
  }

  try {
    // Exchange code for tokens with Spotify
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!,
      }),
    });

    const tokens = await tokenResponse.json();
    console.log(tokens);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(new URL(`/admin?error=missing_refresh_token`, baseUrl));
    }

    // Get Clerk session and JWT
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/admin?error=not_authenticated', baseUrl));
    }
    const jwt = await getToken({ template: 'convex' });
    if (!jwt) {
      return NextResponse.redirect(new URL('/admin?error=missing_jwt', baseUrl));
    }
    convex.setAuth(jwt);

    // Save the refresh token to Convex
    try {
      await convex.mutation(api.websiteSettings.saveSpotifyRefreshToken, { refreshToken: tokens.refresh_token });
      console.log("Refresh token saved to Convex");
    } catch (error) {
      console.error(error);
    }

    return NextResponse.redirect(new URL('/admin?spotify=connected', baseUrl));
  } catch (error) {
    return NextResponse.redirect(new URL(`/admin?error=${encodeURIComponent(String(error))}`, baseUrl));
  }
} 