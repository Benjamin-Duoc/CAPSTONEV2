/**
 * Media utilities for handling image and file URLs
 * This module provides helpers to construct proper URLs for media files
 * based on the current environment (development/production)
 */

import { getMediaUrl } from '../src/config/env';

/**
 * Get the full URL for an image file
 * @param imagePath - Relative path to the image (e.g., 'images/logo.png' or '/images/logo.png')
 * @returns Full URL to the image
 */
export const getImageUrl = (imagePath: string | undefined | null): string => {
    if (!imagePath) return '';

    // If it's already a full URL (http:// or https://), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // If it's a data URL, return as is
    if (imagePath.startsWith('data:')) {
        return imagePath;
    }

    // Otherwise, construct the full media URL
    return getMediaUrl(imagePath);
};

/**
 * Get the full URL for a video file
 * @param videoPath - Relative path to the video
 * @returns Full URL to the video
 */
export const getVideoUrl = (videoPath: string | undefined | null): string => {
    return getImageUrl(videoPath); // Same logic as images
};

/**
 * Get the full URL for a document file
 * @param docPath - Relative path to the document
 * @returns Full URL to the document
 */
export const getDocumentUrl = (docPath: string | undefined | null): string => {
    return getImageUrl(docPath); // Same logic as images
};

/**
 * Check if a URL is external (not from our media server)
 * @param url - URL to check
 * @returns true if the URL is external
 */
export const isExternalUrl = (url: string | undefined | null): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Get a placeholder image URL
 * @param width - Image width
 * @param height - Image height
 * @param text - Text to display in placeholder
 * @returns Placeholder image URL
 */
export const getPlaceholderUrl = (
    width: number = 400,
    height: number = 300,
    text: string = 'No Image'
): string => {
    return `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(text)}`;
};

/**
 * Example usage in components:
 * 
 * import { getImageUrl } from '@/utils/mediaUtils';
 * 
 * function MyComponent({ imageUrl }) {
 *   return <img src={getImageUrl(imageUrl)} alt="..." />;
 * }
 */
