export function renderIndexHtml({ template, publicUrl, jsHref, cssHref, liveReload }) {
    let html = template.replaceAll("%PUBLIC_URL%", publicUrl);

    if (cssHref) {
        html = html.replace("</head>", `<link rel="stylesheet" href="${cssHref}" />\n  </head>`);
    }

    const bodyTags = [];
    if (liveReload) {
        bodyTags.push(
            '<script>new EventSource("/esbuild").addEventListener("change", () => location.reload());</script>'
        );
    }
    bodyTags.push(`<script defer src="${jsHref}"></script>`);
    html = html.replace("</body>", `${bodyTags.join("\n  ")}\n  </body>`);

    return html;
}
