import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Category, DEFAULT_CATEGORIES } from "@/models/Category";
import { Project } from "@/models/Project";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Auto-seed default categories if collection is empty
export async function ensureDefaultCategories() {
  const count = await Category.countDocuments();
  if (count === 0) {
    // 1. Start with standard studio default categories
    const initialNames = [...DEFAULT_CATEGORIES];

    // 2. Also check if existing projects in DB have custom categories
    const distinctProjectCats: string[] = await Project.distinct("category");
    for (const cat of distinctProjectCats) {
      if (cat && !initialNames.some((c) => c.toLowerCase() === cat.toLowerCase())) {
        initialNames.push(cat);
      }
    }

    const docs = initialNames.map((name, idx) => ({
      name,
      slug: generateSlug(name) || `category-${idx + 1}`,
      order: idx + 1,
      description: "",
    }));

    try {
      await Category.insertMany(docs, { ordered: false });
    } catch (e) {
      // Ignore duplicates if any race condition
    }
  }
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectToDatabase();
    if (!db) {
      // Offline / fallback response
      const fallbackCategories = DEFAULT_CATEGORIES.map((name, idx) => ({
        _id: `fallback-${idx}`,
        name,
        slug: generateSlug(name),
        order: idx + 1,
        projectCount: 0,
      }));
      return NextResponse.json({
        success: true,
        source: "fallback",
        categories: fallbackCategories,
      });
    }

    await ensureDefaultCategories();

    const categories = await Category.find().sort({ order: 1, createdAt: 1 }).lean();

    // Calculate project count for each category
    const projectCounts = await Project.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map<string, number>();
    projectCounts.forEach((item) => {
      if (item._id) {
        countMap.set(item._id.toLowerCase(), item.count);
      }
    });

    const enrichedCategories = categories.map((cat) => ({
      ...cat,
      projectCount: countMap.get(cat.name.toLowerCase()) || 0,
    }));

    return NextResponse.json({
      success: true,
      categories: enrichedCategories,
    });
  } catch (error: any) {
    console.error("Admin categories GET error:", error);
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
      return NextResponse.json(
        { error: "Database connection failed. Please ensure MongoDB is available." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const name = (body.name || "").trim();
    const description = (body.description || "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    if (name.length > 60) {
      return NextResponse.json(
        { error: "Category name cannot exceed 60 characters." },
        { status: 400 }
      );
    }

    // Check duplicate (case-insensitive)
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Category "${name}" already exists.` },
        { status: 400 }
      );
    }

    let slug = generateSlug(name);
    if (!slug) slug = `category-${Date.now()}`;

    const existingSlug = await Category.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const lastCategory = await Category.findOne().sort({ order: -1 }).lean();
    const newOrder = lastCategory && typeof lastCategory.order === "number" ? lastCategory.order + 1 : 1;

    const newCategory = await Category.create({
      name,
      slug,
      description,
      order: newOrder,
    });

    try {
      revalidatePath("/");
      revalidatePath("/project", "layout");
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      category: {
        ...newCategory.toObject(),
        projectCount: 0,
      },
      message: `Category "${name}" created successfully.`,
    });
  } catch (error: any) {
    console.error("Admin categories POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
