import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Project } from "@/models/Project";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
      return NextResponse.json(
        { error: "Database connection failed. Please ensure MongoDB is available." },
        { status: 500 }
      );
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const body = await req.json();
    const oldName = category.name;
    const newName = body.name !== undefined ? (body.name || "").trim() : oldName;
    const description = body.description !== undefined ? (body.description || "").trim() : category.description;
    const order = typeof body.order === "number" ? body.order : category.order;

    if (!newName) {
      return NextResponse.json({ error: "Category name cannot be empty." }, { status: 400 });
    }

    if (newName.length > 60) {
      return NextResponse.json({ error: "Category name cannot exceed 60 characters." }, { status: 400 } );
    }

    let projectsUpdated = 0;

    // If name changed, check uniqueness & cascade to Project documents
    if (newName.toLowerCase() !== oldName.toLowerCase()) {
      const existing = await Category.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${newName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      });

      if (existing) {
        return NextResponse.json(
          { error: `Category "${newName}" already exists.` },
          { status: 400 }
        );
      }

      category.name = newName;
      category.slug = generateSlug(newName) || category.slug;

      // Cascade update to all projects currently categorized under oldName
      const updateResult = await Project.updateMany(
        { category: { $regex: new RegExp(`^${oldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
        { $set: { category: newName } }
      );
      projectsUpdated = updateResult.modifiedCount || 0;
    } else if (newName !== oldName) {
      // Just casing changed (e.g. "commercial" -> "Commercial")
      category.name = newName;
      const updateResult = await Project.updateMany(
        { category: oldName },
        { $set: { category: newName } }
      );
      projectsUpdated = updateResult.modifiedCount || 0;
    }

    category.description = description;
    category.order = order;
    await category.save();

    try {
      revalidatePath("/");
      revalidatePath("/project", "layout");
    } catch {
      // ignore in test / build contexts
    }

    return NextResponse.json({
      success: true,
      category,
      projectsUpdated,
      message: `Category updated to "${newName}"${
        projectsUpdated > 0 ? ` and ${projectsUpdated} project(s) updated.` : "."
      }`,
    });
  } catch (error: any) {
    console.error("Admin category PUT error:", error);
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
      return NextResponse.json(
        { error: "Database connection failed. Please ensure MongoDB is available." },
        { status: 500 }
      );
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check query param or body for reassignTo
    const { searchParams } = new URL(req.url);
    let reassignTo = searchParams.get("reassignTo");

    if (!reassignTo) {
      try {
        const body = await req.json().catch(() => null);
        if (body && body.reassignTo) {
          reassignTo = body.reassignTo;
        }
      } catch {
        // body parsing optional
      }
    }

    const catName = category.name;
    const projectCount = await Project.countDocuments({
      category: { $regex: new RegExp(`^${catName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });

    if (projectCount > 0) {
      if (!reassignTo || !reassignTo.trim()) {
        return NextResponse.json(
          {
            error: `Cannot delete "${catName}" because it contains ${projectCount} project(s). Please specify a category to reassign projects to.`,
            projectCount,
            requiresReassign: true,
          },
          { status: 400 }
        );
      }

      const targetCategoryName = reassignTo.trim();

      // Migrate projects to the target category
      await Project.updateMany(
        { category: { $regex: new RegExp(`^${catName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
        { $set: { category: targetCategoryName } }
      );
    }

    await Category.findByIdAndDelete(id);

    try {
      revalidatePath("/");
      revalidatePath("/project", "layout");
    } catch {
      // ignore in test / build contexts
    }

    return NextResponse.json({
      success: true,
      message: `Category "${catName}" deleted successfully${
        projectCount > 0 ? ` and ${projectCount} project(s) reassigned to "${reassignTo}".` : "."
      }`,
      reassignedCount: projectCount,
    });
  } catch (error: any) {
    console.error("Admin category DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
