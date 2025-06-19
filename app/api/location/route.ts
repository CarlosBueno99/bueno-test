import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ConvexError } from 'convex/values';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);



export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("Received data:", data);
    
    const insertedDate = new Date().toISOString();
    console.log("insertedDate", insertedDate);

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

