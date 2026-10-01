/**
 * Environment configuration
 * Loads environment-specific variables from .env files
 */

interface EnvConfig {
    apiUrl: string;
    mediaUrl: string;
    isDevelopment: boolean;
    isProduction: boolean;
}

// Vite exposes env variables through import.meta.env
// Variables prefixed with VITE_ are available in the client
const getEnvConfig = (): EnvConfig => {
    const mode = import.meta.env.MODE;
    const isDevelopment = mode === 'development';
    const isProduction = mode === 'production';

    // Get API URL from environment or use defaults
    const apiUrl = import.meta.env.VITE_API_URL ||
        (isDevelopment
            ? 'http://127.0.0.1:5000/api'
            : 'https://www.cipress.cl/backendcipress/api');

    // Get Media URL from environment or use defaults
    // Note: The backend typically serves media at [host]/backendcipress/media/
    const mediaUrl = import.meta.env.VITE_MEDIA_URL ||
        (isDevelopment
            ? 'http://127.0.0.1:5000/media'
            : 'https://www.cipress.cl/backendcipress/media');

    return {
        apiUrl,
        mediaUrl,
        isDevelopment,
        isProduction,
    };
};

export const ENV = getEnvConfig();

// Helper function to get full media URL
export const getMediaUrl = (path: string): string => {
    if (!path) return '';

    // If path is already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Remove leading slash if present
    let cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // AVOID DOUBLE MEDIA PREFIX:
    // If the path from DB already starts with 'media/' (e.g. '/media/images/photo.jpg')
    // and our base mediaUrl already ends with '/media', we strip the prefix from the path.
    if (cleanPath.startsWith('media/') && ENV.mediaUrl.endsWith('/media')) {
        cleanPath = cleanPath.slice(6); // Remove 'media/'
    }

    // Combine media URL with path
    return `${ENV.mediaUrl}/${cleanPath}`;
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
    // Remove leading slash if present
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    // AVOID DOUBLE API PREFIX:
    // If the endpoint already starts with 'api/' and our ENV.apiUrl already ends with '/api',
    // remove it from the endpoint to avoid '.../api/api/...'
    if (cleanEndpoint.startsWith('api/') && ENV.apiUrl.endsWith('/api')) {
        cleanEndpoint = cleanEndpoint.slice(4);
    }

    // Ensure we don't end up with a double slash if apiUrl ends with / and cleanEndpoint starts with null/empty
    const base = ENV.apiUrl.endsWith('/') ? ENV.apiUrl.slice(0, -1) : ENV.apiUrl;
    return `${base}/${cleanEndpoint}`;
};

// Log configuration on load (only in development)
if (ENV.isDevelopment) {
    console.log('🔧 Environment Configuration:', {
        mode: import.meta.env.MODE,
        apiUrl: ENV.apiUrl,
        mediaUrl: ENV.mediaUrl,
    });
}
