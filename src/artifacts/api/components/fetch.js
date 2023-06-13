import { useEffect, useState } from "react";
import { useAlertFallback } from "shared";
import { parseResponse } from "./parse";

function useFetch(initialUrl, initialOptions) {
    const [url, setUrl] = useState(initialUrl);
    const [options, setOptions] = useState(initialOptions);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const { warning } = useAlertFallback();

    useEffect(() => {
        setLoading(true);
        setError(null);

        void async function() {
            try {
                const response = await fetch(url, options);

                const { state, data } = await parseResponse(response);

                switch (state) {
                    case "success":
                        setData(data);
                        break;
                    case "fail":
                        setError(data);
                        break;
                    default:
                        setError(`Unknown state ${state}`);
                        break;
                }
            } catch (err) {
                setError(err?.message);
            }

            setLoading(false);
        }();
    }, [url, options]);

    useEffect(() => {
        if (typeof error === "string") warning(error);
    }, [error, warning]);

    return { setUrl, setOptions, data, error, loading };
}

export default useFetch;
