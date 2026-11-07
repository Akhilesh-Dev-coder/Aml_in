import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { v2 as cloudinary } from "cloudinary";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const body = await req.json();

    // Auto-derive thumbnail from video if not provided or empty
    if (body.videoUrl && !body.thumbnailUrl) {
      if (body.videoUrl.includes("res.cloudinary.com") && body.videoUrl.includes("/video/upload/")) {
        body.thumbnailUrl = body.videoUrl.replace(/\/video\/upload\/(?:v\d+\/)?/, "/video/upload/so_0,f_jpg/").replace(/\.[^/.]+$/, ".jpg");
      } else {
        body.thumbnailUrl = "/images/aml_logo.svg";
      }
    }

    const updated = await Project.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      project: updated,
    });
  } catch (error: any) {
    console.error("Admin project PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const projectToDelete = await Project.findById(id);
    if (!projectToDelete) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Attempt safe Cloudinary deletion if credentials & public ID exist
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      if (projectToDelete.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(projectToDelete.cloudinaryPublicId, {
            resource_type: "video",
          });
        } catch (cldErr) {
          console.warn("Could not delete Cloudinary video asset:", cldErr);
        }
      }

      if (projectToDelete.thumbnailPublicId) {
        try {
          await cloudinary.uploader.destroy(projectToDelete.thumbnailPublicId, {
            resource_type: "image",
          });
        } catch (cldErr) {
          console.warn("Could not delete Cloudinary thumbnail asset:", cldErr);
        }
      }
    }

    await Project.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error: any) {
    console.error("Admin project DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
