async function handleJsonResponse(response) {
    const json = await response.json();

    return { state: response.ok ? "success" : "fail", data: json };
}

async function handleTextResponse(response) {
    const text = await response.text();

    return { state: response.ok ? "success" : "fail", data: text };
}

export async function parseResponse(response) {
    let contentType = response.headers.get("content-type");

    switch (true) {
        case contentType.includes("json"):
            return await handleJsonResponse(response);
        case contentType.includes("text"):
            return await handleTextResponse(response);
        default:
            throw new Error(`Unknown content type ${contentType}`);
    }
}
