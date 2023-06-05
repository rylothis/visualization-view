export function resolvePublicUrl(pkg) {
    const { pathname } = new URL(pkg.homepage);
    return pathname.replace(/\/$/, "");
}

export function buildEnvDefine(nodeEnv) {
    const raw = { NODE_ENV: nodeEnv };
    for (const [key, value] of Object.entries(process.env)) {
        if (key.startsWith("REACT_APP_")) raw[key] = value;
    }
    return { "process.env": JSON.stringify(raw) };
}
