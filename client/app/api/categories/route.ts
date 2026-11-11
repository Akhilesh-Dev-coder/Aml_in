import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Category, DEFAULT_CATEGORIES } from "@/models/Category";
import { Project } from "@/models/Project";
import { ensureDefaultCategories } from "@/app/api/admin/categories/route";

export const revalidate = 60;

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (!db) {
      const fallback = DEFAULT_CATEGORIES.map((name, idx) => ({
        _id: `default-${idx}`,
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        order: idx + 1,
      }));
      return NextResponse.json({
        success: true,
        source: "fallback",
        categories: fallback,
      });
    }

    await ensureDefaultCategories();

    const categories = await Category.find().sort({ order: 1, createdAt: 1 }).lean();

    return NextResponse.json({
      success: true,
      source: "database",
      categories,
    });
  } catch (error: any) {
    console.error("Public categories GET error:", error);
    const fallback = DEFAULT_CATEGORIES.map((name, idx) => ({
      _id: `default-${idx}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      order: idx + 1,
    }));
    return NextResponse.json({
      success: true,
      source: "fallback",
      categories: fallback,
    });
  }
}
