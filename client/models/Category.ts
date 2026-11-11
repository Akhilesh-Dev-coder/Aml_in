import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  order: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [60, "Category name cannot exceed 60 characters"],
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model in Next.js hot reload
export const Category: Model<ICategoryDocument> =
  mongoose.models.Category || mongoose.model<ICategoryDocument>("Category", CategorySchema);

export const DEFAULT_CATEGORIES = [
  "Commercial",
  "Product Film",
  "Brand Campaign",
  "Cinematic Visual",
  "Social Creative",
];
