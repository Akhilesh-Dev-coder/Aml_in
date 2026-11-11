"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IProject, ICategory } from "@/types/project";
import ProjectFormModal from "./ProjectFormModal";
import CategoryManagementModal from "./CategoryManagementModal";
import {
  Plus,
  ArrowUpRight,
  LogOut,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Loader2,
  Film,
  CheckCircle2,
  AlertCircle,
  Filter,
  FolderKanban,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<IProject | null>(null);
  const [actionSuccess, setActionSuccess] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/projects");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load projects");
      setProjects(data.projects || []);
    } catch (err: any) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err: any) {
      console.error("Failed to load categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  // Ensure selectedCategory resets to "All" if it was deleted or is missing
  useEffect(() => {
    if (selectedCategory !== "All" && categories.length > 0) {
      const exists = categories.some(
        (c) => c.name.toLowerCase() === selectedCategory.toLowerCase()
      );
      if (!exists) {
        setSelectedCategory("All");
      }
    }
  }, [categories, selectedCategory]);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(""), 3500);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const handleTogglePublished = async (project: IProject) => {
    const id = project._id || project.id;
    if (!id) return;
    try {
      const newStatus = !project.published;
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      showNotification(`Project ${newStatus ? "published" : "unpublished"}`);
      fetchProjects();
    } catch (err: any) {
      alert(err.message || "Failed to toggle published status");
    }
  };

  const handleDelete = async (project: IProject) => {
    const id = project._id || project.id;
    if (!id) return;
    if (!confirm(`Are you sure you want to permanently delete "${project.title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      showNotification("Project deleted successfully");
      fetchProjects();
    } catch (err: any) {
      alert(err.message || "Failed to delete project");
    }
  };

  // Reorder projects within the current displayed list (category-aware)
  const handleMoveOrder = async (
    currentList: IProject[],
    localIndex: number,
    direction: "up" | "down"
  ) => {
    const targetLocalIndex = direction === "up" ? localIndex - 1 : localIndex + 1;
    if (targetLocalIndex < 0 || targetLocalIndex >= currentList.length) return;

    const currentProj = currentList[localIndex];
    const targetProj = currentList[targetLocalIndex];

    const currentId = currentProj._id || currentProj.id;
    const targetId = targetProj._id || targetProj.id;
    if (!currentId || !targetId) return;

    try {
      // Swap order values
      const currentOrder = currentProj.order ?? localIndex + 1;
      const targetOrder = targetProj.order ?? targetLocalIndex + 1;

      // If orders are identical or missing, ensure distinct order values
      const newCurrentOrder = targetOrder === currentOrder
        ? (direction === "up" ? currentOrder - 1 : currentOrder + 1)
        : targetOrder;
      const newTargetOrder = currentOrder;

      await Promise.all([
        fetch(`/api/admin/projects/${currentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newCurrentOrder }),
        }),
        fetch(`/api/admin/projects/${targetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newTargetOrder }),
        }),
      ]);

      showNotification("Order updated successfully");
      fetchProjects();
    } catch (err: any) {
      alert(err.message || "Failed to reorder projects");
    }
  };

  // Filter projects by active category
  const filteredProjects = selectedCategory === "All"
    ? projects
    : projects.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  const totalProjects = projects.length;
  const publishedCount = projects.filter((p) => p.published).length;
  const totalCategories = categories.length;

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Top Studio Admin Navigation */}
      <header className="border-b border-white/[0.08] bg-[#111111]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#F5D90A]/40 ring-1 ring-white/10 shrink-0 bg-black shadow-[0_0_10px_rgba(245,217,10,0.25)]">
              <Image
                src="/images/aml_logo.svg"
                alt="AML"
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm uppercase tracking-wider text-white">
                AML.IN // STUDIO CMS
              </span>
              <span className="text-[10px] font-mono uppercase bg-white/10 px-2 py-0.5 rounded text-zinc-300">
                Production
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-[#F5D90A] transition-colors"
            >
              <span>View Live Portfolio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Toast Notification */}
        {actionSuccess && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#F5D90A] text-black px-4 py-3 rounded-2xl font-mono text-xs font-medium flex items-center gap-2 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Dashboard Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-light text-white tracking-tight mb-2">
              Commercial Portfolio Management
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              Arrange and reorder commercial reels &bull; Manage categories &amp; titles &bull; Zero thumbnail upload required
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCategoryModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#181818] hover:bg-[#222222] border border-white/10 hover:border-[#F5D90A]/40 text-white font-mono text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              <FolderKanban className="w-4 h-4 text-[#F5D90A]" />
              <span>Manage Categories</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 font-bold text-zinc-300">
                {totalCategories}
              </span>
            </button>

            <button
              onClick={() => {
                setEditingProject(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#F5D90A] hover:bg-[#e5ca09] text-black font-semibold text-xs uppercase font-mono tracking-wider transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(245,217,10,0.25)] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Project</span>
            </button>
          </div>
        </div>

        {/* Overview Metric Cards (3 Clean Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-zinc-500 block mb-1">
                Total Projects
              </span>
              <span className="text-3xl font-light font-mono text-white">
                {totalProjects}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
              <Film className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-zinc-500 block mb-1">
                Live &amp; Published
              </span>
              <span className="text-3xl font-light font-mono text-[#F5D90A]">
                {publishedCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F5D90A]/10 border border-[#F5D90A]/30 flex items-center justify-center text-[#F5D90A]">
              <Eye className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => setCategoryModalOpen(true)}
            className="p-5 rounded-2xl bg-[#141414] border border-white/[0.08] hover:border-[#F5D90A]/40 transition-colors flex items-center justify-between cursor-pointer group"
          >
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-zinc-500 block mb-1 group-hover:text-zinc-300 transition-colors">
                Categories
              </span>
              <span className="text-3xl font-light font-mono text-white group-hover:text-[#F5D90A] transition-colors">
                {totalCategories}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 group-hover:border-[#F5D90A]/30 group-hover:bg-[#F5D90A]/10 flex items-center justify-center text-zinc-300 group-hover:text-[#F5D90A] transition-colors">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Category Tabs: Easily arrange & filter for each category */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 mr-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
            <Filter className="w-3.5 h-3.5 text-[#F5D90A]" />
            <span>Filter &amp; Arrange By:</span>
          </div>

          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
              selectedCategory === "All"
                ? "bg-[#F5D90A] text-black font-semibold shadow-[0_0_15px_rgba(245,217,10,0.3)]"
                : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.08]"
            }`}
          >
            All Categories ({projects.length})
          </button>

          {categories.map((cat) => {
            const catName = cat.name;
            const count = projects.filter((p) => p.category?.toLowerCase() === catName.toLowerCase()).length;
            const isActive = selectedCategory.toLowerCase() === catName.toLowerCase();
            return (
              <button
                key={cat._id || cat.id || catName}
                onClick={() => setSelectedCategory(catName)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-[#F5D90A] text-black font-semibold shadow-[0_0_15px_rgba(245,217,10,0.3)]"
                    : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.08]"
                }`}
              >
                <span>{catName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-black/20 text-black" : "bg-white/10 text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setCategoryModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-mono tracking-wider uppercase bg-white/[0.03] text-zinc-400 hover:text-[#F5D90A] hover:bg-white/[0.07] border border-dashed border-white/20 hover:border-[#F5D90A]/40 flex items-center gap-1.5 transition-colors cursor-pointer ml-1"
            title="Edit, Add or Delete Categories"
          >
            <Edit2 className="w-3 h-3 text-[#F5D90A]" />
            <span>Manage Categories</span>
          </button>
        </div>

        {/* Projects List / Table */}
        <div className="bg-[#141414] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
          
          <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#181818]">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-200">
                {selectedCategory === "All" ? "All Commercial Projects" : `${selectedCategory} Collection`}
              </h2>
              <span className="text-xs font-mono text-zinc-500">
                ({filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"})
              </span>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Use &uarr; &darr; arrows to reorder within {selectedCategory === "All" ? "portfolio" : selectedCategory}
            </span>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin mb-3 text-[#F5D90A]" />
              <span className="text-xs font-mono">Loading projects...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 text-xs font-mono flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 font-mono text-xs">
              No projects in &quot;{selectedCategory}&quot; yet. Click &quot;Add New Project&quot; to add one.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {filteredProjects.map((project, index) => {
                const id = project._id || project.id;
                const thumbSrc = project.thumbnailUrl && project.thumbnailUrl.trim() !== ""
                  ? project.thumbnailUrl
                  : "/images/aml_logo.svg";

                return (
                  <div
                    key={id || index}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Left: Reorder Arrows, Thumbnail & Metadata */}
                    <div className="flex items-start sm:items-center gap-4">
                      {/* Order Controls (Reorder within active category list) */}
                      <div className="flex flex-col items-center gap-1 text-zinc-600 shrink-0 bg-black/40 px-2 py-1.5 rounded-xl border border-white/5">
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(filteredProjects, index, "up")}
                          className="hover:text-[#F5D90A] disabled:opacity-20 disabled:hover:text-zinc-600 transition-colors p-0.5"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <span className="text-[11px] font-mono text-center text-[#F5D90A] font-semibold">
                          #{index + 1}
                        </span>
                        <button
                          disabled={index === filteredProjects.length - 1}
                          onClick={() => handleMoveOrder(filteredProjects, index, "down")}
                          className="hover:text-[#F5D90A] disabled:opacity-20 disabled:hover:text-zinc-600 transition-colors p-0.5"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Video / Poster Thumbnail Preview */}
                      <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 flex items-center justify-center">
                        {thumbSrc.endsWith(".svg") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbSrc}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image
                            src={thumbSrc}
                            alt={project.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        )}
                      </div>

                      {/* Metadata */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-medium text-white tracking-tight">
                            {project.title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400">
                          <span className="text-[#F5D90A] px-2 py-0.5 rounded bg-[#F5D90A]/10 border border-[#F5D90A]/20">
                            {project.category}
                          </span>
                          {project.caption && (
                            <>
                              <span>&bull;</span>
                              <span className="truncate max-w-[280px] sm:max-w-[420px] text-zinc-400">
                                {project.caption}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                      {/* Published Toggle */}
                      <button
                        onClick={() => handleTogglePublished(project)}
                        title={project.published ? "Live: Click to Unpublish" : "Hidden: Click to Publish"}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono transition-colors ${
                          project.published
                            ? "bg-green-950/30 border-green-500/30 text-green-400 hover:bg-green-900/40"
                            : "bg-zinc-900 border-white/10 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {project.published ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Live</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setEditingProject(project);
                          setModalOpen(true);
                        }}
                        title="Edit Project"
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(project)}
                        title="Delete Project"
                        className="p-2 rounded-xl bg-red-950/20 hover:bg-red-900/40 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </main>

      {/* Edit / Create Project Modal */}
      <ProjectFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          showNotification(editingProject ? "Project updated successfully" : "Project created successfully");
          fetchProjects();
          fetchCategories();
        }}
        projectToEdit={editingProject}
        defaultCategory={selectedCategory === "All" ? "Commercial" : selectedCategory}
        availableCategories={categories}
      />

      {/* Category Management Modal */}
      <CategoryManagementModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={categories}
        onCategoriesUpdated={(newCatName?: string) => {
          fetchCategories();
          fetchProjects();
          if (newCatName) {
            setSelectedCategory(newCatName);
          }
          router.refresh();
        }}
      />
    </div>
  );
}
