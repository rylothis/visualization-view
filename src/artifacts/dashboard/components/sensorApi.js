const SENSORS_BASE_URL = process.env.REACT_APP_SENSORS_BASE_URL ?? "http://localhost:8080/api/sensors";

async function asJson(response) {
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.error_description ?? body?.error ?? `request failed: ${response.status}`);
    return body;
}

function query(params) {
    const usp = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
        if (value !== undefined && value !== null && value !== "") usp.set(key, value);
    }
    const qs = usp.toString();
    return qs ? `?${qs}` : "";
}

export async function listDevices(authFetch) {
    return asJson(await authFetch(`${SENSORS_BASE_URL}/devices`));
}

export async function createDevice(authFetch, payload) {
    return asJson(await authFetch(`${SENSORS_BASE_URL}/devices`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
    }));
}

export async function rotateDevice(authFetch, id) {
    return asJson(await authFetch(`${SENSORS_BASE_URL}/devices/${id}/rotate`, { method: "POST" }));
}

export async function revokeDevice(authFetch, id) {
    return asJson(await authFetch(`${SENSORS_BASE_URL}/devices/${id}`, { method: "DELETE" }));
}

export async function getReadings(id, params) {
    return asJson(await fetch(`${SENSORS_BASE_URL}/devices/${id}/readings${query(params)}`));
}

export async function getSeries(id, metric, params) {
    return asJson(await fetch(`${SENSORS_BASE_URL}/devices/${id}/series${query({ metric, ...params })}`));
}

export async function getSummary(id, params) {
    return asJson(await fetch(`${SENSORS_BASE_URL}/devices/${id}/summary${query(params)}`));
}
