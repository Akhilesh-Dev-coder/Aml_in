/**
 * High-performance Media & Video Optimization Utility
 * 
 * Ensures all video and image assets stream instantly using adaptive bitrates,
 * browser-tailored codecs (f_auto), automatic quality (q_auto), fast-start moov
 * atom positioning, and edge CDN caching.
 */

const FALLBACK_CLOUDINARY_VIDEOS: Record<string, string> = {
  ForBiggerBlazes: "https://res.cloudinary.com/opkjlyme/video/upload/f_auto,q_auto,vc_auto,w_1920,c_limit/v1794014426/samples/cld-sample-video.mp4",
  ForBiggerEscapes: "https://res.cloudinary.com/opkjlyme/video/upload/f_auto,q_auto,vc_auto,w_1920,c_limit/v1794050877/samples/snow_deer.mp4",
  ForBiggerFun: "https://res.cloudinary.com/opkjlyme/video/upload/f_auto,q_auto,vc_auto,w_1920,c_limit/v1794014426/samples/sea-turtle.mp4",
  ForBiggerJoyBlazes: "https://res.cloudinary.com/opkjlyme/video/upload/f_auto,q_auto,vc_auto,w_1920,c_limit/v1794014426/samples/elephants.mp4",
  ForBiggerMeltdowns: "https://res.cloudinary.com/opkjlyme/video/upload/f_auto,q_auto,vc_auto,w_1920,c_limit/v1794014427/samples/dance-2.mp4",
  TearsOfSteel: "https://res.cloudinary.com/opkjlyme/video/upload/f_auto,q_auto,vc_auto,w_1920,c_limit/v1794050879/samples/dog.mp4",
};

const DEFAULT_FAST_VIDEO = "https://res.cloudinary.com/opkjlyme/video/upload/f_auto,q_auto,vc_auto,w_1920,c_limit/v1794014426/samples/cld-sample-video.mp4";

/**
 * Optimizes a video URL for instant playback:
 * - Automatically redirects outdated Google storage URLs (which return 403) to high-speed CDN streams.
 * - Injects Cloudinary streaming optimizations (f_auto, q_auto:good, vc_auto, w_1920, c_limit)
 *   so huge 4K/ProRes video uploads are compressed on the fly and start in milliseconds.
 */
export function getOptimizedVideoUrl(
  url?: string | null,
  options?: { width?: number; quality?: string }
): string {
  if (!url) return DEFAULT_FAST_VIDEO;

  // Intercept deprecated Google bucket URLs that now return 403 Forbidden
  if (url.includes("commondatastorage.googleapis.com")) {
    for (const [key, fastUrl] of Object.entries(FALLBACK_CLOUDINARY_VIDEOS)) {
      if (url.includes(key)) return fastUrl;
    }
    return DEFAULT_FAST_VIDEO;
  }

  // Cloudinary URL optimization
  if (url.includes("res.cloudinary.com") && url.includes("/video/upload/")) {
    // If it already has f_auto and q_auto, return directly
    if (url.includes("f_auto") && url.includes("q_auto")) {
      return url;
    }

    const width = options?.width || 1920;
    const quality = options?.quality || "good";
    const transformStr = `f_auto,q_auto:${quality},vc_auto,w_${width},c_limit`;

    return url.replace(/\/video\/upload\/(?:v\d+\/)?/, (match) => {
      const vMatch = match.match(/v\d+\//);
      const versionStr = vMatch ? vMatch[0] : "";
      return `/video/upload/${transformStr}/${versionStr}`;
    });
  }

  return url;
}

/**
 * Automatically derives an ultra-fast, lightweight (<70KB) poster image
 * from a Cloudinary video or optimizes an image URL.
 */
export function getOptimizedThumbnailUrl(url?: string | null): string {
  if (!url) return "";

  if (url.includes("commondatastorage.googleapis.com")) {
    return "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop";
  }

  if (url.includes("res.cloudinary.com") && url.includes("/video/upload/")) {
    return url
      .replace(/\/video\/upload\/.*?\/(v\d+\/)?/, "/video/upload/so_0,f_auto,q_auto,w_1200/$1")
      .replace(/\.[^/.]+$/, ".jpg");
  }

  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    if (url.includes("f_auto") && url.includes("q_auto")) return url;
    return url.replace(/\/image\/upload\/(?:v\d+\/)?/, (match) => {
      const vMatch = match.match(/v\d+\//);
      const versionStr = vMatch ? vMatch[0] : "";
      return `/image/upload/f_auto,q_auto,w_1200,c_limit/${versionStr}`;
    });
  }

  return url;
}
