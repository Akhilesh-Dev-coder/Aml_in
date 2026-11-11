"use client";

import React, { useState } from "react";
import { ICategory } from "@/types/project";
import {
  X,
  Edit2,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FolderKanban,
  ArrowRight,
  Save,
} from "lucide-react";

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ICategory[];
  onCategoriesUpdated: (newSelectedCategory?: string) => void;
}

export default function CategoryManagementModal({
  isOpen,
  onClose,
  categories,
  onCategoriesUpdated,
}: CategoryManagementModalProps) {
  // Add new category state
  const [newCatName, setNewCatName] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit category state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete category state
  const [deletingCat, setDeletingCat] = useState<ICategory | null>(null);
  const [reassignTarget, setReassignTarget] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const showSuccessMsg = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  };

  // Add new category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setError("");
    setAdding(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create category");
      }

      setNewCatName("");
      showSuccessMsg(`Category "${data.category.name}" added successfully!`);
      onCategoriesUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to add category");
    } finally {
      setAdding(false);
    }
  };

  // Start editing a category
  const startEdit = (cat: ICategory) => {
    const id = cat._id || cat.id || "";
    setEditingId(id);
    setEditName(cat.name);
    setError("");
    setDeletingCat(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  // Save edited category name
  const handleSaveEdit = async (cat: ICategory) => {
    const id = cat._id || cat.id;
    if (!id || !editName.trim()) return;

    if (editName.trim().toLowerCase() === cat.name.toLowerCase() && editName.trim() === cat.name) {
      cancelEdit();
      return;
    }

    setError("");
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update category");
      }

      showSuccessMsg(
        `Category renamed to "${editName.trim()}"${
          data.projectsUpdated ? ` (${data.projectsUpdated} projects updated)` : ""
        }!`
      );
      cancelEdit();
      onCategoriesUpdated(editName.trim());
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    } finally {
      setSavingEdit(false);
    }
  };

  // Open delete confirmation / reassignment prompt
  const startDelete = (cat: ICategory) => {
    if (categories.length <= 1) {
      setError("Cannot delete the only category in the portfolio.");
      return;
    }

    setDeletingCat(cat);
    // Find default reassign target (first category that is not this one)
    const otherCats = categories.filter((c) => (c._id || c.id) !== (cat._id || cat.id));
    setReassignTarget(otherCats[0]?.name || "");
    setError("");
    setEditingId(null);
  };

  // Confirm delete category
  const handleConfirmDelete = async () => {
    if (!deletingCat) return;
    const id = deletingCat._id || deletingCat.id;
    if (!id) return;

    setError("");
    setIsDeleting(true);

    try {
      const queryParam =
        deletingCat.projectCount && deletingCat.projectCount > 0 && reassignTarget
          ? `?reassignTo=${encodeURIComponent(reassignTarget)}`
          : "";

      const res = await fetch(`/api/admin/categories/${id}${queryParam}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reassignTo: reassignTarget }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      showSuccessMsg(
        `Category "${deletingCat.name}" deleted${
          data.reassignedCount ? ` (${data.reassignedCount} projects moved to "${reassignTarget}")` : ""
        }.`
      );
      setDeletingCat(null);
      onCategoriesUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#141414] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5D90A]/10 border border-[#F5D90A]/30 flex items-center justify-center text-[#F5D90A]">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight">
                Manage Categories
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Add, rename, edit or delete project categories &bull; Cascades to all reels
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono flex items-start gap-2.5 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-[#F5D90A]/15 border border-[#F5D90A]/40 text-[#F5D90A] text-xs font-mono flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Add New Category Input */}
        <form onSubmit={handleAddCategory} className="mb-6">
          <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-2">
            Create New Category
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. 3D Animation, Fashion Film, VFX Showcase..."
              maxLength={60}
              className="flex-1 bg-[#1b1b1b] border border-white/10 focus:border-[#F5D90A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={adding || !newCatName.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F5D90A] hover:bg-[#e5ca09] disabled:opacity-40 text-black font-semibold text-xs uppercase font-mono tracking-wider transition-all cursor-pointer shrink-0"
            >
              {adding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              )}
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Delete Reassignment Warning Dialog */}
        {deletingCat && (
          <div className="p-5 rounded-2xl bg-red-950/30 border border-red-500/30 mb-6 animate-in slide-in-from-top duration-200">
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-300">
                  Delete Category &quot;{deletingCat.name}&quot;?
                </h4>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  {deletingCat.projectCount && deletingCat.projectCount > 0
                    ? `This category contains ${deletingCat.projectCount} project(s). Choose where to reassign them before deleting:`
                    : "This category has no projects and can be deleted safely."}
                </p>
              </div>
            </div>

            {deletingCat.projectCount && deletingCat.projectCount > 0 ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400 shrink-0">
                    Reassign {deletingCat.projectCount} project(s) to:
                  </span>
                  <select
                    value={reassignTarget}
                    onChange={(e) => setReassignTarget(e.target.value)}
                    className="flex-1 bg-[#181818] border border-white/20 text-white rounded-xl px-3 py-1.5 text-xs font-mono focus:border-[#F5D90A] focus:outline-none"
                  >
                    {categories
                      .filter((c) => (c._id || c.id) !== (deletingCat._id || deletingCat.id))
                      .map((c) => (
                        <option key={c._id || c.id || c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeletingCat(null)}
                    disabled={isDeleting}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting || !reassignTarget}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
                  >
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    <span>Reassign &amp; Delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingCat(null)}
                  disabled={isDeleting}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Categories List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-mono tracking-wider text-zinc-400">
              Active Categories ({categories.length})
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              Editing updates matching projects automatically
            </span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {categories.map((cat, idx) => {
              const id = cat._id || cat.id || `cat-${idx}`;
              const isBeingEdited = editingId === id;

              return (
                <div
                  key={id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isBeingEdited
                      ? "bg-[#1f1f1f] border-[#F5D90A]/60 shadow-[0_0_15px_rgba(245,217,10,0.15)]"
                      : "bg-[#181818] border-white/[0.07] hover:border-white/15"
                  }`}
                >
                  {isBeingEdited ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          maxLength={60}
                          autoFocus
                          className="flex-1 bg-[#121212] border border-[#F5D90A]/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveEdit(cat)}
                          disabled={savingEdit || !editName.trim()}
                          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#F5D90A] hover:bg-[#e5ca09] text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                        >
                          {savingEdit ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          <span>Save</span>
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={savingEdit}
                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      {cat.projectCount !== undefined && cat.projectCount > 0 && (
                        <p className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                          <ArrowRight className="w-3 h-3 text-[#F5D90A]" />
                          <span>
                            Will automatically update {cat.projectCount} project(s) assigned to this category.
                          </span>
                        </p>
                      )}
                    </div>
                  ) : (
                    // Display Mode
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[#F5D90A] font-semibold w-6 text-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="text-sm font-medium text-white tracking-wide">
                            {cat.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                              {cat.projectCount || 0} {cat.projectCount === 1 ? "project" : "projects"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => startEdit(cat)}
                          title="Rename / Edit Category"
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-[#F5D90A] transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => startDelete(cat)}
                          title="Delete Category"
                          className="p-2 rounded-xl bg-red-950/20 hover:bg-red-900/40 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-500">
            Total Categories: {categories.length}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
