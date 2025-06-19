import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ConvexError } from 'convex/values';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface LocationRequest {
  latitude: number;
  userId: string;
  longitude: number;
  altitude: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  region: string;
  phoneNumber: string;
  label: string;
  url: string;
  name: string;
  full: string;
}

export async function POST(request: NextRequest) {
  try {
    const {userId, latitude, longitude, altitude, street, city, state, zip, region, phoneNumber, label, url, name, full } = await request.json() as LocationRequest;
    
    if (!latitude || !longitude || !altitude || !street || !city || !state || !zip || !region || !phoneNumber || !label || !url || !name || !full) {
      return NextResponse.json({ error: "Missing a field" }, { status: 400 });
    }
    

    const insertedDate = new Date().toISOString();
    console.log("all the data", userId, latitude, longitude, altitude, street, city, state, zip, region, phoneNumber, label, url, name, full);
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

