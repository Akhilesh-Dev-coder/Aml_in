import { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { INITIAL_PROJECTS } from "@/lib/initialData";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aml.in";

  let slugs = INITIAL_PROJECTS.map((p) => p.slug);
  try {
    const db = await connectToDatabase();
    if (db) {
      const docs = await Project.find({ published: true }).select("slug updatedAt").lean();
      if (docs && docs.length > 0) {
        slugs = docs.map((d: any) => d.slug);
      }
    }
  } catch {
    // fallback to initial projects
  }

  const projectUrls: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${baseUrl}/project/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...projectUrls,
  ];
}
