import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { INITIAL_PROJECTS } from "@/lib/initialData";

export async function GET() {
  try {
    const mongooseInstance = await connectToDatabase();

    if (!mongooseInstance) {
      // Return curated initial projects if MongoDB URI is not set
      return NextResponse.json({
        success: true,
        source: "fallback",
        projects: INITIAL_PROJECTS,
      });
    }

    // Check existing projects count
    const count = await Project.countDocuments();
    if (count === 0) {
      // Auto-seed initial projects on first run
      const seedDocs = INITIAL_PROJECTS.map((p, idx) => ({
        ...p,
        order: idx + 1,
      }));
      await Project.insertMany(seedDocs);
    }

    const projects = await Project.find({ published: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      source: "database",
      projects,
    });
  } catch (error: any) {
    console.error("Error in /api/projects GET:", error);
    return NextResponse.json(
      {
        success: true,
        source: "fallback",
        projects: INITIAL_PROJECTS,
        warning: error.message,
      },
      { status: 200 }
    );
  }
}
