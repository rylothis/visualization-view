import React, { useEffect, useState } from "react";
import { ascending } from "d3-array"
import { csv } from "d3-fetch";
import { scaleLinear, scaleTime } from "d3-scale";
import { LineChart } from "graphic";

//region TODO: Move to React context and replace with correct api
import GlobalAnnual from "../fixtures/HadCRUT-global-annual.csv";
import GlobalMonthly from "../fixtures/HadCRUT-global-monthly.csv";
import NHAnnual from "../fixtures/HadCRUT-northern-hemisphere-annual.csv";
import NHMonthly from "../fixtures/HadCRUT-northern-hemisphere-monthly.csv";
import SHAnnual from "../fixtures/HadCRUT-southern-hemisphere-annual.csv";
import SHMonthly from "../fixtures/HadCRUT-southern-hemisphere-monthly.csv";
import nhtemp from "../fixtures/nhtemp.csv";

const CHART_ID = "v2-line-chart";
const WIDTH = 960;
const HEIGHT = 600;
const MARGIN = { top: 20, right: 30, bottom: 30, left: 40 };
const STROKE = { linecap: "round", linejoin: "round", width: 1.5, opacity: 1, mixBlendMode: "multiply" };

/**
 * When handling import could use Promise.all([import])
 * @example
 *
 * const dataGroup = await Promise.all([
 *     import("../balabala1"), import("../balabala2"), ......
 * ]).then([GlobalAnnual, ......] => { GlobalAnnual, ...... });
 *
 */
const handlePath = type => {
    switch (type) {
        case "hadcrut":     return ({ GlobalAnnual, GlobalMonthly, NHAnnual, NHMonthly, SHAnnual, SHMonthly });
        case "nhtemp":     return ({ nhtemp });
        default:        throw new Error("Unkown")
    }
};
const handleData = data => data.sort((a, b) => ascending(a.time, b.time));

//endregion

function Loader() {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        let cache = [], jobs = [];
        void (async () => {
            // csv use fetch https://developer.mozilla.org/docs/Web/API/fetch
            Object.entries(handlePath("hadcrut")).forEach(([key, path]) => {
                jobs.push(csv(path, data => {
                    return {
                        type: key,
                        // monthly contain yyyy-mm, yearly pickup middle yyyy-06
                        time: data["Time"].includes("-") ? data["Time"] : `${data["Time"]}-06`,
                        anomaly: +data["Anomaly (deg C)"],
                        lowerConfidenceLimit: +data["Lower confidence limit (2.5%)"],
                        upperConfidenceLimit: +data["Upper confidence limit (97.5%)"]
                    }
                }));
            });
            Object.entries(handlePath("nhtemp")).forEach(([key, path]) => {
                jobs.push(csv(path, data => {
                    return {
                        type: key,
                        time: `${["0", "0", "0", "0", ...data["Year"]].slice(-4).join('')}-01-01`,
                        anomaly: +data["T"]
                    }
                }));
            });
            Promise.all(jobs).then(value => {
                cache = value.reduce((pre, cur) => pre.concat(cur));
                console.log(cache);
                setChartData(handleData(cache));
            });
        })();
    }, []);

    function color(type) {
        switch (type) {
            case "GlobalAnnual":     return "#ff0000";
            case "GlobalMonthly":    return "#800000";
            case "NHAnnual":         return "#00ff00";
            case "NHMonthly":        return "#008800";
            case "SHAnnual":         return "#0000ff";
            case "SHMonthly":        return "#000088";
            case "nhtemp":           return "#9900ff";
            default:                 return "#000000";
        }
    }

    function tip(type) {
        switch (type) {
            case "GlobalAnnual":     return "Global Annual";
            case "GlobalMonthly":    return "Global Monthly";
            case "NHAnnual":         return "Northern-Hemisphere Annual";
            case "NHMonthly":        return "Northern-Hemisphere Monthly";
            case "SHAnnual":         return "Southern-Hemisphere Annual";
            case "SHMonthly":        return "Southern-Hemisphere Monthly";
            case "nhtemp":           return "Global historical surface temperature anomalies from January 1850 onwards"
            default:                 throw new Error("Invalid data");
        }
    }

    return !!chartData ?
        (
            <LineChart id={CHART_ID}
                       width={WIDTH}
                       height={HEIGHT}
                       margin={MARGIN}
                       stroke={STROKE}
                       source={chartData}
                       dataDescHandler={[
                           [value => new Date(value["time"]), scaleTime,   [MARGIN.left, WIDTH - MARGIN.right],  [{ orient: "bottom" }]],
                           [value => value["anomaly"],         scaleLinear, [HEIGHT - MARGIN.bottom, MARGIN.top], [{ orient: "left" }]]
                       ]}
                       typeDescHandler={[
                           [value => value["type"], key => ({ label: tip(key), color: color(key) })]
                       ]}>
            </LineChart>
        ) : <h1>Loading...</h1>;
}

export default Loader;
