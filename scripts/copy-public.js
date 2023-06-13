import { mkdir, readdir, cp } from "node:fs/promises";
import path from "node:path";

export async function copyPublicAssets(publicDir, outDir) {
    await mkdir(outDir, { recursive: true });
    const entries = await readdir(publicDir, { withFileTypes: true });
    await Promise.all(entries.map(entry => {
        if (entry.name === "index.html") return undefined;
        return cp(path.join(publicDir, entry.name), path.join(outDir, entry.name), { recursive: true });
    }));
}
