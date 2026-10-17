// In local dev, VITE_BACKEND_URL is unset → empty string → Vite proxy handles /api/* requests.
// In production (Vercel), VITE_BACKEND_URL is set via .env.production to the Render backend URL.
export const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "";