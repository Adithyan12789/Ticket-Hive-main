// In local dev, VITE_BACKEND_URL is unset → empty string → Vite proxy handles it.
// In production (Vercel), set VITE_BACKEND_URL to your Render backend URL.
export const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "https://ticket-hive-back-end-main-1.onrender.com";