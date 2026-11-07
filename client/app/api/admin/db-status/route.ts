import { NextResponse } from "next/server";
import { connectToDatabase, lastMongoError } from "@/lib/mongodb";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  const envUriPresent = Boolean(process.env.MONGODB_URI);
  const dbName = process.env.MONGODB_DB || "aml_portfolio";

  const startTime = Date.now();
  const db = await connectToDatabase();
  const latency = Date.now() - startTime;

  if (!db) {
    return NextResponse.json(
      {
        connected: false,
        error: lastMongoError,
        envUriConfigured: envUriPresent,
        databaseTarget: dbName,
        latencyMs: latency,
        readyState: mongoose.connection ? mongoose.connection.readyState : 0,
        troubleshooting: [
          "1. Go to MongoDB Atlas: https://cloud.mongodb.com",
          "2. Navigate to 'Network Access' under Security in the left sidebar.",
          "3. Check if '0.0.0.0/0' (Allow access from anywhere) is present.",
          "4. If not present or inactive, click 'Add IP Address' -> click 'Allow Access from Anywhere' -> Confirm.",
          "5. Wait 30-60 seconds for Atlas to deploy the network change.",
        ],
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    connected: true,
    readyState: mongoose.connection.readyState,
    database: mongoose.connection.name,
    latencyMs: latency,
    envUriConfigured: envUriPresent,
    message: "MongoDB Atlas is successfully connected and accepting queries!",
  });
}
