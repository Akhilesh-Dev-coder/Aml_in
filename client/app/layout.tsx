import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SpaceBackground from "@/components/SpaceBackground";
import BrandPreloader from "@/components/BrandPreloader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "AML // AI Commercial Director",
  description:
    "High-end AI commercials and product videos made fast for modern brands.",
  keywords: [
    "AI Commercials",
    "Product Videos",
    "Video Production",
    "Brand Ads",
    "3D Animation",
  ],
  authors: [{ name: "AML Creative" }],
  openGraph: {
    title: "AML // AI Commercial Director",
    description:
      "High-end AI commercials and product videos made fast for modern brands.",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: "/images/aml_logo.svg",
    shortcut: "/images/aml_logo.svg",
    apple: "/images/aml_logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark scroll-smooth`}>
      <body className="min-h-screen bg-[#050505] text-white antialiased selection:bg-[#F5D90A] selection:text-black relative">
        <BrandPreloader />
        <SpaceBackground />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
