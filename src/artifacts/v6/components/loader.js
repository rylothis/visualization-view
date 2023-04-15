import React, { useEffect, useState } from "react";
import { scaleLinear } from "d3-scale";
import { ascending } from "d3-array"
import { csv } from "d3-fetch";
import { LineChart } from "graphic";

//region TODO: Move to React context and replace with correct api
import co2composite from "../fixtures/co2composite.csv";

const CHART_ID = "v6-line-chart";
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
const handlePath = () => ({ co2composite });
const handleData = data => data.sort((a, b) => ascending(a.year, b.year));

//endregion

function Loader() {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        let cache = [], jobs = [];
        void (async () => {
            // csv use fetch https://developer.mozilla.org/docs/Web/API/fetch
            Object.entries(handlePath()).forEach(([key, path]) => {
                jobs.push(csv(path, data => {
                    console.log(data)
                    return {
                        type: key,
                        year: +data["age_gas_calBP"],
                        ppm: +data["co2_ppm"],
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
            case "co2composite":     return "#0000ff";
            default:                 return "#000000";
        }
    }

    function tip(type) {
        switch (type) {
            case "co2composite":     return "Antarctic Ice Cores Revised 800KYr CO2 Data";
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
                           [value => value["year"], scaleLinear, [MARGIN.left, WIDTH - MARGIN.right],  [{ orient: "bottom" }]],
                           [value => value["ppm"],  scaleLinear, [HEIGHT - MARGIN.bottom, MARGIN.top], [{ orient: "left" }]]
                       ]}
                       typeDescHandler={[
                           [value => value["type"], key => ({ label: tip(key), color: color(key) })]
                       ]}>
            </LineChart>
        ) : <h1>Loading...</h1>;
}

export default Loader;
