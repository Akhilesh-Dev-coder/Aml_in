import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProjectDocument extends Document {
  title: string;
  slug: string;
  caption: string;
  description: string;
  category: "Commercial" | "Product Film" | "Brand Campaign" | "Cinematic Visual" | "Social Creative";
  clientName?: string;
  year?: string;
  videoUrl: string;
  thumbnailUrl: string;
  cloudinaryPublicId?: string;
  thumbnailPublicId?: string;
  featured: boolean;
  published: boolean;
  order: number;
  tags: string[];
  duration?: string;
  aspectRatio: "16:9" | "9:16" | "4:5" | "1:1";
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    slug: {
      type: String,
      required: [true, "Project slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    caption: {
      type: String,
      required: [true, "Project caption is required"],
      trim: true,
      maxlength: [200, "Caption cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Commercial", "Product Film", "Brand Campaign", "Cinematic Visual", "Social Creative"],
      default: "Commercial",
    },
    clientName: {
      type: String,
      trim: true,
    },
    year: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      required: false,
      default: "",
      trim: true,
    },
    cloudinaryPublicId: {
      type: String,
      trim: true,
    },
    thumbnailPublicId: {
      type: String,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    duration: {
      type: String,
      trim: true,
    },
    aspectRatio: {
      type: String,
      enum: ["16:9", "9:16", "4:5", "1:1"],
      default: "16:9",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model in Next.js hot reload
export const Project: Model<IProjectDocument> =
  mongoose.models.Project || mongoose.model<IProjectDocument>("Project", ProjectSchema);
