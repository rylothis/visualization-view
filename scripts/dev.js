import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import esbuild from "esbuild";

import { createBuildOptions } from "./build-options.js";
import { copyPublicAssets } from "./copy-public.js";
import { resolvePublicUrl } from "./env.js";
import { renderIndexHtml } from "./render-html.js";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicDir = path.join(rootDir, "public");
const devRoot = path.join(rootDir, ".esbuild-dev");
const pkg = JSON.parse(await readFile(path.join(rootDir, "package.json"), "utf8"));
const publicUrl = resolvePublicUrl(pkg);
const appDir = path.join(devRoot, publicUrl.replace(/^\//, ""));

await rm(devRoot, { recursive: true, force: true });
await mkdir(appDir, { recursive: true });
await copyPublicAssets(publicDir, appDir);
await writeFile(
    path.join(devRoot, "index.html"),
    `<!doctype html><meta http-equiv="refresh" content="0; url=${publicUrl}/">`
);

const template = await readFile(path.join(publicDir, "index.html"), "utf8");
const html = renderIndexHtml({
    template,
    publicUrl,
    jsHref: `${publicUrl}/static/js/bundle.js`,
    cssHref: `${publicUrl}/static/css/bundle.css`,
    liveReload: true,
});
await writeFile(path.join(appDir, "index.html"), html);

const options = createBuildOptions({ mode: "development", outdir: appDir, hashed: false, publicUrl });
const ctx = await esbuild.context({ ...options, absWorkingDir: rootDir });
await ctx.watch();

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0";
const served = await ctx.serve({ servedir: devRoot, port, host });

console.log(`visualization-view dev server running at http://localhost:${served.port}${publicUrl}/`);

process.on("SIGINT", async () => {
    await ctx.dispose();
    process.exit(0);
});
