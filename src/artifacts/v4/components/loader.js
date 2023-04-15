import React, { useEffect, useState } from "react";
import { ascending } from "d3-array"
import { csv } from "d3-fetch";
import { scaleLinear } from "d3-scale";
import { LineChart } from "graphic";

//region TODO: Move to React context and replace with correct api
import Co2Annual from "../fixtures/co2-annual.csv";
import De08 from "../fixtures/de08.csv";
import De082 from "../fixtures/de08-2.csv";
import Dss from "../fixtures/dss.csv";

const CHART_ID = "v4-line-chart";
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
const handlePath = () => ({ Co2Annual, De08, De082, Dss });
const handleData = data => data.sort((a, b) => ascending(a.time, b.time));

//endregion

function Loader() {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        let cache = [], jobs = [];
        void (async () => {
            // csv use fetch https://developer.mozilla.org/docs/Web/API/fetch
            Object.entries(handlePath()).forEach(([key, path]) => {
                jobs.push(csv(path, data => {
                    return {
                        type: key,
                        // monthly contain yyyy-mm, yearly pickup middle yyyy-06
                        time: "meanAirAge" in data ? +data["meanAirAge"] : +data["year"],
                        ppm: "ppm" in data ? +data["ppm"] : +data["mean"],
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
            case "Co2Annual":        return "#ff0000";
            case "De08":             return "#00ff00";
            case "De082":            return "#0000ff";
            case "Dss":              return "#ff00ff";
            default:                 return "#000000";
        }
    }

    function tip(type) {
        switch (type) {
            case "Co2Annual":        return "Co2 Annual";
            case "De08":             return "Law Dome DE08";
            case "De082":            return "Law Dome DE08-2";
            case "Dss":              return "DSS ice cores";
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
                           [value => value["time"], scaleLinear, [MARGIN.left, WIDTH - MARGIN.right],  [{ orient: "bottom" }]],
                           [value => value["ppm"],  scaleLinear, [HEIGHT - MARGIN.bottom, MARGIN.top], [{ orient: "left" }]]
                       ]}
                       typeDescHandler={[
                           [value => value["type"], key => ({ label: tip(key), color: color(key) })]
                       ]}>
            </LineChart>
        ) : <h1>Loading...</h1>;
}

export default Loader;
