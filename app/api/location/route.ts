import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ConvexError } from 'convex/values';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface LocationRequest {
  latitude: number;
  userId: string;
  fullLocation: string;
}

export async function POST(request: NextRequest) {
  try {
    const { latitude, userId, fullLocation } = await request.json() as LocationRequest;
    
    if (!latitude) {
      return NextResponse.json({ error: "Missing latitude" }, { status: 400 });
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    
    if (!fullLocation) {
      return NextResponse.json({ error: "Missing fullLocation" }, { status: 400 });
    }
    
    console.log("user + latitude", userId, latitude);
    const insertedDate = new Date().toISOString();
    console.log("insertedDate", insertedDate);

    // TODO: Add your location processing logic here
    
    return NextResponse.json({ success: true, data: { insertedDate } });
    
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error && error.message.includes("ArgumentValidationError")) {
      return NextResponse.json(
        { error: "Invalid arguments provided", details: error.message },
        { status: 400 }
      );
    }
    
    // Handle other errors
    console.error("Error processing location:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

