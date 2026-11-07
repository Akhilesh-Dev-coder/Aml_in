import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase, lastMongoError } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { getOptimizedVideoUrl, getOptimizedThumbnailUrl } from "@/lib/media";
import { INITIAL_PROJECTS } from "@/lib/initialData";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectToDatabase();
    if (!db) {
      // Return initial projects if DB not yet hooked up
      return NextResponse.json({
        success: true,
        source: "initial_data",
        projects: INITIAL_PROJECTS,
      });
    }

    // Auto-seed if empty
    const count = await Project.countDocuments();
    if (count === 0) {
      const seedDocs = INITIAL_PROJECTS.map((p, idx) => ({
        ...p,
        order: idx + 1,
      }));
      await Project.insertMany(seedDocs);
    }

    const projects = await Project.find().sort({ order: 1, createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error: any) {
    console.error("Admin projects GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectToDatabase();
    if (!db) {
      const err = lastMongoError || "Connection timed out or failed";
      const isIpBlocked =
        err.includes("ServerSelectionError") ||
        err.includes("timed out") ||
        err.includes("connection closed");

      const errorMsg = isIpBlocked
        ? `MongoDB Atlas blocked the connection: ${err}. Please ensure MongoDB Atlas Network Access has '0.0.0.0/0' (Allow access from anywhere) enabled so your hosted site can connect.`
        : `Database connection failed: ${err}. Please check your MONGODB_URI.`;

      return NextResponse.json({ error: errorMsg, details: err }, { status: 500 });
    }

    const body = await req.json();
    const {
      title,
      caption,
      description,
      category,
      clientName,
      year,
      videoUrl,
      thumbnailUrl,
      cloudinaryPublicId,
      thumbnailPublicId,
      featured,
      published,
      tags,
      aspectRatio,
    } = body;

    if (!title || !caption || !description || !videoUrl) {
      return NextResponse.json(
        { error: "Title, caption, description, and videoUrl are required." },
        { status: 400 }
      );
    }

    // Ensure video URL is optimized for streaming
    const finalVideoUrl = getOptimizedVideoUrl(videoUrl);

    // Auto-derive thumbnail from video if not explicitly provided
    let finalThumbnail = thumbnailUrl;
    if (!finalThumbnail && finalVideoUrl) {
      finalThumbnail = getOptimizedThumbnailUrl(finalVideoUrl) || "/images/aml_logo.svg";
    }

    let slug = generateSlug(title);
    // Ensure slug uniqueness
    const existing = await Project.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Determine highest order
    const lastProject = await Project.findOne().sort({ order: -1 }).lean();
    const newOrder = lastProject && lastProject.order ? lastProject.order + 1 : 1;

    const newProject = await Project.create({
      title,
      slug,
      caption,
      description,
      category: category || "Commercial",
      clientName: clientName || "",
      year: year || "2025",
      videoUrl: finalVideoUrl,
      thumbnailUrl: finalThumbnail,
      cloudinaryPublicId: cloudinaryPublicId || "",
      thumbnailPublicId: thumbnailPublicId || "",
      featured: Boolean(featured),
      published: published !== undefined ? Boolean(published) : true,
      order: newOrder,
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()) : [],
      aspectRatio: aspectRatio || "16:9",
    });

    return NextResponse.json({
      success: true,
      project: newProject,
    });
  } catch (error: any) {
    console.error("Admin projects POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
