"use client";

import React, { useState, useEffect } from "react";
import { IProject } from "@/types/project";
import { X, Upload, Check, AlertCircle, Loader2, Video, Image as ImageIcon, ChevronDown, ChevronUp } from "lucide-react";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  projectToEdit: IProject | null;
  defaultCategory?: IProject["category"];
}

export default function ProjectFormModal({
  isOpen,
  onClose,
  onSaved,
  projectToEdit,
  defaultCategory = "Commercial",
}: ProjectFormModalProps) {
  const isEditing = Boolean(projectToEdit && (projectToEdit._id || projectToEdit.id));

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IProject["category"]>(defaultCategory);
  const [clientName, setClientName] = useState("");
  const [year, setYear] = useState("2025");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState("");
  const [thumbnailPublicId, setThumbnailPublicId] = useState("");
  const [published, setPublished] = useState(true);
  const [tagsInput, setTagsInput] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "4:5" | "1:1">("16:9");
  const [showCustomThumb, setShowCustomThumb] = useState(false);

  // Upload states
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [thumbProgress, setThumbProgress] = useState(0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title || "");
      setCaption(projectToEdit.caption || "");
      setDescription(projectToEdit.description || "");
      setCategory(projectToEdit.category || defaultCategory);
      setClientName(projectToEdit.clientName || "");
      setYear(projectToEdit.year || "2025");
      setVideoUrl(projectToEdit.videoUrl || "");
      setThumbnailUrl(projectToEdit.thumbnailUrl || "");
      setCloudinaryPublicId(projectToEdit.cloudinaryPublicId || "");
      setThumbnailPublicId(projectToEdit.thumbnailPublicId || "");
      setPublished(projectToEdit.published !== false);
      setTagsInput(projectToEdit.tags ? projectToEdit.tags.join(", ") : "");
      setAspectRatio(projectToEdit.aspectRatio || "16:9");
      setShowCustomThumb(Boolean(projectToEdit.thumbnailUrl && !projectToEdit.thumbnailUrl.includes("aml_logo")));
    } else {
      setTitle("");
      setCaption("");
      setDescription("");
      setCategory(defaultCategory);
      setClientName("");
      setYear("2025");
      setVideoUrl("");
      setThumbnailUrl("");
      setCloudinaryPublicId("");
      setThumbnailPublicId("");
      setPublished(true);
      setTagsInput("");
      setAspectRatio("16:9");
      setShowCustomThumb(false);
    }
    setError("");
  }, [projectToEdit, isOpen, defaultCategory]);

  if (!isOpen) return null;

  // Direct Browser Upload to Cloudinary with Live Progress
  const handleFileUpload = async (file: File, type: "video" | "image") => {
    setError("");
    try {
      if (type === "video") {
        setUploadingVideo(true);
        setVideoProgress(10);
      } else {
        setUploadingThumb(true);
        setThumbProgress(10);
      }

      const signRes = await fetch("/api/admin/cloudinary-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "portfolio_media" }),
      });

      const signData = await signRes.json();
      if (!signRes.ok) {
        throw new Error(signData.error || "Failed to get upload signature. Make sure Cloudinary credentials are set.");
      }

      const { signature, timestamp, apiKey, cloudName, folder } = signData;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`;

      const xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          if (type === "video") setVideoProgress(percent);
          else setThumbProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          if (type === "video") {
            setVideoUrl(res.secure_url);
            setCloudinaryPublicId(res.public_id);
            setUploadingVideo(false);
            setVideoProgress(100);
          } else {
            setThumbnailUrl(res.secure_url);
            setThumbnailPublicId(res.public_id);
            setUploadingThumb(false);
            setThumbProgress(100);
          }
        } else {
          setError(`Cloudinary upload failed: ${xhr.statusText}`);
          if (type === "video") setUploadingVideo(false);
          else setUploadingThumb(false);
        }
      };

      xhr.onerror = () => {
        setError("Network error during Cloudinary upload");
        if (type === "video") setUploadingVideo(false);
        else setUploadingThumb(false);
      };

      xhr.send(formData);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setUploadingVideo(false);
      setUploadingThumb(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !caption || !description || !videoUrl) {
      setError("Please complete all required fields: Title, Caption, Description, and Video Asset.");
      return;
    }

    setSaving(true);

    try {
      // Auto-derive thumbnail from video if user didn't provide one
      let finalThumb = thumbnailUrl;
      if (!finalThumb && videoUrl) {
        if (videoUrl.includes("res.cloudinary.com") && videoUrl.includes("/video/upload/")) {
          finalThumb = videoUrl.replace(/\/video\/upload\/(?:v\d+\/)?/, "/video/upload/so_0,f_jpg/").replace(/\.[^/.]+$/, ".jpg");
        } else {
          finalThumb = "/images/aml_logo.svg";
        }
      }

      const payload = {
        title,
        caption,
        description,
        category,
        clientName,
        year,
        videoUrl,
        thumbnailUrl: finalThumb,
        cloudinaryPublicId,
        thumbnailPublicId,
        featured: false,
        published,
        aspectRatio,
        tags: tagsInput
          ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };

      const targetId = projectToEdit?._id || projectToEdit?.id;
      const url = isEditing
        ? `/api/admin/projects/${targetId}`
        : "/api/admin/projects";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save project");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#141414] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight">
              {isEditing ? "Edit Commercial Project" : "Add New Commercial Project"}
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Add your commercial video asset &bull; Thumbnails auto-derive from video
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CHRONOS // Fluid Precision"
                className="w-full bg-[#1b1b1b] border border-white/10 focus:border-[#F5D90A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#1b1b1b] border border-white/10 focus:border-[#F5D90A] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              >
                <option value="Commercial">Commercial</option>
                <option value="Product Film">Product Film</option>
                <option value="Brand Campaign">Brand Campaign</option>
                <option value="Cinematic Visual">Cinematic Visual</option>
                <option value="Social Creative">Social Creative</option>
              </select>
            </div>
          </div>

          {/* Caption & Client / Year */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6">
              <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-2">
                Caption / Hook *
              </label>
              <input
                type="text"
                required
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="High Horology in Molten Microgravity"
                className="w-full bg-[#1b1b1b] border border-white/10 focus:border-[#F5D90A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-2">
                Brand / Client
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Chronos Haute Horlogerie"
                className="w-full bg-[#1b1b1b] border border-white/10 focus:border-[#F5D90A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-2">
                Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2025"
                className="w-full bg-[#1b1b1b] border border-white/10 focus:border-[#F5D90A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Video Asset Section (Primary Asset) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#1b1b1b] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs uppercase font-mono text-[#F5D90A]">
                <Video className="w-4 h-4" />
                <span>Commercial Video Asset *</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">Upload or Direct URL</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-8">
                <input
                  type="text"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste direct MP4/Cloudinary video URL or upload file"
                  className="w-full bg-[#141414] border border-white/10 focus:border-[#F5D90A] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none font-mono"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="relative flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-200 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#F5D90A]" />
                  <span>{uploadingVideo ? `Uploading ${videoProgress}%` : "Upload Video File"}</span>
                  <input
                    type="file"
                    accept="video/*"
                    disabled={uploadingVideo}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "video");
                    }}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {uploadingVideo && (
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="bg-[#F5D90A] h-full transition-all duration-300"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
            )}

            {videoUrl && (
              <p className="text-[11px] text-zinc-400 font-mono mt-2 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#F5D90A]" />
                <span>Poster is automatically derived from the video stream.</span>
              </p>
            )}
          </div>

          {/* Optional Custom Thumbnail Collapsible */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowCustomThumb(!showCustomThumb)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showCustomThumb ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showCustomThumb ? "Hide custom thumbnail override" : "Custom thumbnail override (optional)"}</span>
            </button>

            {showCustomThumb && (
              <div className="mt-3 p-4 rounded-2xl bg-[#181818] border border-white/[0.06] animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-mono text-zinc-400">Custom Image Poster (Optional)</span>
                  <span className="text-[11px] text-zinc-500 font-mono">Leave empty for auto-poster</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="Optional image URL override"
                      className="w-full bg-[#141414] border border-white/10 focus:border-[#F5D90A] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="relative flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-200 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#F5D90A]" />
                      <span>{uploadingThumb ? `Uploading ${thumbProgress}%` : "Upload Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingThumb}
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "image");
                        }}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-2">
              Director Narrative &amp; Technical Breakdown *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the aesthetic direction, generative models utilized, camera choreography, and commercial impact..."
              className="w-full bg-[#1b1b1b] border border-white/10 focus:border-[#F5D90A] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none"
            />
          </div>

          {/* Tags & Aspect Ratio */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Horology, Liquid Metal, Photorealism, 4K"
                className="w-full bg-[#1b1b1b] border border-white/10 focus:border-[#F5D90A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-2">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="w-full bg-[#1b1b1b] border border-white/10 focus:border-[#F5D90A] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              >
                <option value="16:9">16:9 Cinema</option>
                <option value="9:16">9:16 Vertical Reel</option>
                <option value="4:5">4:5 Social Feed</option>
                <option value="1:1">1:1 Square</option>
              </select>
            </div>
          </div>

          {/* Published Toggle */}
          <div className="pt-2 pb-2">
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 text-[#F5D90A] focus:ring-[#F5D90A] focus:ring-offset-black bg-zinc-900"
              />
              <span className="text-xs uppercase font-mono tracking-wider text-zinc-300">
                Published to Live Portfolio
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-xs uppercase font-mono tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F5D90A] hover:bg-[#e5ca09] text-black font-semibold text-xs uppercase font-mono tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(245,217,10,0.25)]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Project...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? "Save Changes" : "Create Project"}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
