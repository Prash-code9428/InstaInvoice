/**
 * Global configuration utility.
 * Loads the backend API base URL dynamically depending on the execution context.
 * In production (Railway), loads VITE_API_URL.
 * In local development, falls back to http://localhost:5000.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
