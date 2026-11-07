import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "opkjlyme";
    const apiKey = process.env.CLOUDINARY_API_KEY || "196638882792763";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "_HinR8AUbHCL4OagENNkNjTYMqo";

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          error: "Cloudinary credentials not configured in environment variables",
          isConfigured: false,
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const folder = body.folder || "portfolio_media";
    const timestamp = Math.round(new Date().getTime() / 1000);

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const signature = cloudinary.utils.api_sign_request(
      {
        folder,
        timestamp,
      },
      apiSecret
    );

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (error: any) {
    console.error("Cloudinary sign error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate signature" },
      { status: 500 }
    );
  }
}
