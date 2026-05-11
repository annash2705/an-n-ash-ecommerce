/**
 * Transforms a Cloudinary image URL to use automatic format conversion.
 * This is needed because images uploaded in HEIC format (from iPhones)
 * are not supported by most browsers. Adding f_auto,q_auto tells
 * Cloudinary to serve the image in the best format for the browser
 * (e.g. WebP for Chrome, JPEG for Safari fallback).
 */
export function getOptimizedImageUrl(url: string): string {
    if (!url) return url;

    // Match Cloudinary upload URLs and insert f_auto,q_auto transformation
    // Pattern: .../image/upload/v1234.../path.heic
    // Result:  .../image/upload/f_auto,q_auto/v1234.../path.heic
    const cloudinaryUploadRegex = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)$/;
    const match = url.match(cloudinaryUploadRegex);

    if (match) {
        return `${match[1]}f_auto,q_auto/${match[2]}`;
    }

    // If it already has transformations, try to insert f_auto,q_auto
    const cloudinaryWithTransformRegex = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;
    const matchWithTransform = url.match(cloudinaryWithTransformRegex);

    if (matchWithTransform && !matchWithTransform[2].includes('f_auto')) {
        return `${matchWithTransform[1]}f_auto,q_auto/${matchWithTransform[2]}`;
    }

    return url;
}
