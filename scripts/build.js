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
const buildDir = path.join(rootDir, "build");
const pkg = JSON.parse(await readFile(path.join(rootDir, "package.json"), "utf8"));
const publicUrl = resolvePublicUrl(pkg);

await rm(buildDir, { recursive: true, force: true });
await mkdir(buildDir, { recursive: true });
await copyPublicAssets(publicDir, buildDir);

const options = createBuildOptions({ mode: "production", outdir: buildDir, hashed: true, publicUrl });
const result = await esbuild.build({ ...options, absWorkingDir: rootDir });

const outputHref = pattern => {
    const outputPath = Object.keys(result.metafile.outputs).find(file => pattern.test(file) && !file.endsWith(".map"));
    if (!outputPath) return undefined;
    const relativePath = path.relative(buildDir, path.resolve(rootDir, outputPath)).split(path.sep).join("/");
    return `${publicUrl}/${relativePath}`;
};

const template = await readFile(path.join(publicDir, "index.html"), "utf8");
const html = renderIndexHtml({
    template,
    publicUrl,
    jsHref: outputHref(/static\/js\/bundle\.[^./]+\.js$/),
    cssHref: outputHref(/static\/css\/bundle\.[^./]+\.css$/),
    liveReload: false,
});
await writeFile(path.join(buildDir, "index.html"), html);

console.log(`built ${path.relative(rootDir, buildDir)} (public url: ${publicUrl}/)`);
