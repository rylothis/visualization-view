export function decodeJwt(token) {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    try {
        const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
}
