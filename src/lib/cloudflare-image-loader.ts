'use client'

/**
 * Image Loader for Next.js
 * 
 * Returns images directly without Cloudflare Image Resizing.
 * The cdn-cgi/image endpoint requires Cloudflare's Image Resizing add-on.
 * For now, we serve images at their original URLs.
 * 
 * To enable Cloudflare image optimization:
 * 1. Enable Image Resizing on your Cloudflare zone (paid add-on)
 * 2. Uncomment the cdn-cgi logic below
 */

interface ImageLoaderParams {
    src: string
    width: number
    quality?: number
}

export default function cloudflareLoader({ src, width, quality }: ImageLoaderParams): string {
    // Return original URLs directly - no transformation
    // This avoids 404 errors when Cloudflare Image Resizing is not enabled

    // For absolute URLs (remote images like Unsplash), return as-is
    if (src.startsWith('http://') || src.startsWith('https://')) {
        return src
    }

    // For relative paths (local images in /public), return as-is
    if (src.startsWith('/')) {
        return src
    }

    // For any other format, return as-is
    return src
}
