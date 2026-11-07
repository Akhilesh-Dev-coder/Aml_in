export interface IProject {
  _id?: string;
  id?: string;
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
  tags?: string[];
  duration?: string;
  aspectRatio?: "16:9" | "9:16" | "4:5" | "1:1";
  createdAt?: string;
  updatedAt?: string;
}
