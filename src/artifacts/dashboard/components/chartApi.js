import { ascending } from "d3-array";

const CONTENT_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "http://localhost:8080/api/content";

export const LINE_COLUMNS = ["time", "value"];
export const DOUGHNUT_COLUMNS = ["path", "value"];

export function expectedColumns(chartType) {
    return chartType === "doughnut" ? DOUGHNUT_COLUMNS : LINE_COLUMNS;
}

async function asJson(response) {
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.error_description ?? body?.error ?? `request failed: ${response.status}`);
    return body;
}

export async function listCharts() {
    return asJson(await fetch(`${CONTENT_BASE_URL}/charts`));
}

export async function getChart(id) {
    return asJson(await fetch(`${CONTENT_BASE_URL}/charts/${id}`));
}

export async function createChart(authFetch, payload) {
    return asJson(await authFetch(`${CONTENT_BASE_URL}/charts`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
    }));
}

export async function updateChart(authFetch, payload) {
    return asJson(await authFetch(`${CONTENT_BASE_URL}/charts`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
    }));
}

export async function deleteChart(authFetch, id) {
    return asJson(await authFetch(`${CONTENT_BASE_URL}/charts/${id}`, { method: "DELETE" }));
}

export function flattenLineChart(chart) {
    const rows = chart.files.flatMap(file =>
        file.rows.map(([time, value]) => ({ type: file.name, time, anomaly: +value }))
    );
    return rows.sort((a, b) => ascending(a.time, b.time));
}
