import CssModulesPlugin from "esbuild-css-modules-plugin";

import { buildEnvDefine } from "./env.js";

export function createBuildOptions({ mode, outdir, hashed, publicUrl }) {
    return {
        entryPoints: { bundle: "src/index.js" },
        bundle: true,
        outdir,
        entryNames: hashed ? "static/[ext]/[name].[hash]" : "static/[ext]/[name]",
        metafile: true,
        write: true,
        minify: mode === "production",
        sourcemap: true,
        target: ["chrome100", "firefox100", "safari15", "edge100"],
        loader: { ".js": "jsx", ".csv": "file" },
        assetNames: "static/media/[name]-[hash]",
        publicPath: publicUrl,
        jsx: "automatic",
        define: buildEnvDefine(mode),
        plugins: [CssModulesPlugin({ inject: false })],
        logLevel: "info",
    };
}
