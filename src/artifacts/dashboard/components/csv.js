import { csvParse } from "d3-dsv";

export function parseCsvRows(text, expectedColumns) {
    const parsed = csvParse(text);
    const actualColumns = parsed.columns ?? [];
    if (actualColumns.join(",") !== expectedColumns.join(",")) {
        throw new Error(`CSV header must be exactly "${expectedColumns.join(",")}", got "${actualColumns.join(",")}"`);
    }
    return parsed.map(row => expectedColumns.map(column => row[column]));
}

export function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error ?? new Error("failed to read file"));
        reader.readAsText(file);
    });
}
