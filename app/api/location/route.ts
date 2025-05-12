import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ConvexError } from 'convex/values';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { url, userId } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    const metadata = await extractMetadataFromUrl(url);
    const insertedDate = new Date().toISOString();
    // Insert location via Convex mutation
    let id;
    try {
      id = await convex.mutation(api.locations.addLocation, {
        userId: userId as Id<'users'>,
        url,
        insertedDate,
        latitude: metadata.latitude,
        longitude: metadata.longitude,
        displayName: metadata.displayName,
      });
    } catch (error) {
      // Handle validation errors
      if (error instanceof Error && error.message.includes("ArgumentValidationError")) {
        return NextResponse.json(
          { error: "Invalid arguments provided", details: error.message },
          { status: 400 }
        );
      }
      // Handle ConvexError (treat as 400 since it's for invalid user)
      if (error instanceof ConvexError) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      throw error;
    }
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error saving location:", error);
    return NextResponse.json(
      { error: "Failed to save location", details: error instanceof Error ? error.message : undefined },
      { status: 500 }
    );
  }
}

async function extractMetadataFromUrl(url: string) {
  const coords = extractCoordinatesFromAppleMapsUrl(url);
  if (!coords) {
    throw new Error("Invalid URL");
  }
  // Reverse geocode to get display name
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
  );
  const data = await response.json();
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    displayName: data.display_name,
  };
}

function extractCoordinatesFromAppleMapsUrl(url: string) {
  const match = url.match(/[?&](q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) {
    return {
      latitude: parseFloat(match[2]),
      longitude: parseFloat(match[3]),
    };
  }
  return null;
} 