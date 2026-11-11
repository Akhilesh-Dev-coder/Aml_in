import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BrandStatement from "@/components/BrandStatement";
import SelectedWork from "@/components/SelectedWork";
import CreativeCapabilities from "@/components/CreativeCapabilities";
import AboutPhilosophy from "@/components/AboutPhilosophy";
import ContactSection from "@/components/ContactSection";
import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { Category, DEFAULT_CATEGORIES } from "@/models/Category";
import { INITIAL_PROJECTS } from "@/lib/initialData";
import { IProject, ICategory } from "@/types/project";
import { ensureDefaultCategories } from "@/app/api/admin/categories/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getPortfolioCategories(): Promise<ICategory[]> {
  try {
    const db = await connectToDatabase();
    if (!db) {
      return DEFAULT_CATEGORIES.map((name, idx) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        order: idx + 1,
      }));
    }

    await ensureDefaultCategories();
    const docs = await Category.find().sort({ order: 1, createdAt: 1 }).lean();
    if (!docs || docs.length === 0) {
      return DEFAULT_CATEGORIES.map((name, idx) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        order: idx + 1,
      }));
    }

    return JSON.parse(JSON.stringify(docs));
  } catch (error) {
    console.warn("Falling back to default categories:", error);
    return DEFAULT_CATEGORIES.map((name, idx) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      order: idx + 1,
    }));
  }
}

async function getPortfolioProjects(): Promise<IProject[]> {
  try {
    const db = await connectToDatabase();
    if (!db) return INITIAL_PROJECTS;

    const count = await Project.countDocuments();
    if (count === 0) {
      const seedDocs = INITIAL_PROJECTS.map((p, idx) => ({
        ...p,
        order: idx + 1,
      }));
      await Project.insertMany(seedDocs);
    }

    const docs = await Project.find({ published: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    if (!docs || docs.length === 0) {
      return INITIAL_PROJECTS;
    }

    // Convert MongoDB _id and dates to plain serializable objects
    return JSON.parse(JSON.stringify(docs));
  } catch (error) {
    console.warn("Falling back to initial projects dataset:", error);
    return INITIAL_PROJECTS;
  }
}

export default async function Home() {
  const [projects, categories] = await Promise.all([
    getPortfolioProjects(),
    getPortfolioCategories(),
  ]);

  return (
    <div className="relative min-h-screen bg-transparent text-white selection:bg-[#F5D90A] selection:text-black">
      <Navbar />
      <main>
        <Hero firstProjectSlug={projects[0]?.slug || "chronos-fluid-precision"} />
        <BrandStatement />
        <SelectedWork projects={projects} categories={categories} />
        <CreativeCapabilities />
        <AboutPhilosophy />
        <ContactSection />
      </main>
    </div>
  );
}
