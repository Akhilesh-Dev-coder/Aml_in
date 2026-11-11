import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { INITIAL_PROJECTS } from "@/lib/initialData";
import { IProject } from "@/types/project";
import ProjectShowcaseView from "@/components/ProjectShowcaseView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const getAllProjects = cache(async (): Promise<IProject[]> => {
  try {
    const db = await connectToDatabase();
    if (!db) return INITIAL_PROJECTS;

    const docs = await Project.find({ published: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    if (!docs || docs.length === 0) return INITIAL_PROJECTS;
    return JSON.parse(JSON.stringify(docs));
  } catch {
    return INITIAL_PROJECTS;
  }
});

export async function generateStaticParams() {
  try {
    const allProjects = await getAllProjects();
    return allProjects.map((p) => ({
      slug: p.slug,
    }));
  } catch {
    return INITIAL_PROJECTS.map((p) => ({
      slug: p.slug,
    }));
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const allProjects = await getAllProjects();
  const project = allProjects.find((p) => p.slug === slug || p.id === slug);

  if (!project) {
    return {
      title: "Reel Showcase // AML.IN",
    };
  }

  return {
    title: `${project.title} // AML Commercial Reel`,
    description: project.caption || project.description,
    openGraph: {
      title: `${project.title} — AI Commercial Direction`,
      description: project.caption,
      images: [
        {
          url: project.thumbnailUrl,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
  };
}

async function ProjectContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const allProjects = await getAllProjects();
  const project = allProjects.find((p) => p.slug === slug || p.id === slug);

  if (!project) {
    notFound();
  }

  return (
    <ProjectShowcaseView
      currentProject={project}
      allProjects={allProjects}
    />
  );
}

export default function ProjectPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-500 font-mono text-xs">
          Loading Cinema Reel...
        </div>
      }
    >
      <ProjectContent params={props.params} />
    </Suspense>
  );
}
