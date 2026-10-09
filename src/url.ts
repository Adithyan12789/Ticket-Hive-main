const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
export const backendUrl = isLocal ? "" : "https://ticket-hive-back-end-1.onrender.com";