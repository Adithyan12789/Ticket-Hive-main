const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const config = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || (isLocal ? 'http://localhost:5000/' : 'https://ticket-hive-back-end-1.onrender.com/'),
    isDevelopment: isLocal,
    cookieDomain: isLocal ? 'localhost' : '.tickethive.fun'
}
