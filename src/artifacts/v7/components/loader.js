import React, { useEffect, useState } from "react";
import { ascending } from "d3-array"
import { scaleLinear } from "d3-scale";
import { csv } from "d3-fetch";
import { LineChart } from "graphic";

//region TODO: Move to React context and replace with correct api
import co2 from "../fixtures/carbon-dioxide.csv";
import temperature from "../fixtures/antarctic-temperature.csv";

const CHART_ID = "v7-line-chart";
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
const handlePath = () => ({ co2, temperature });
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
                    return {
                        type: key,
                        year: +data["Time (yr BP)"],
                        ppm: +data["Carbon dioxide (ppm)"],
                        temperature: +data["Antarctic temperature"]
                    }
                }));
            });
            Promise.all(jobs).then(value => {
                const [co2, temperature] = value;
                for (let i = 0; i < Math.min(...value.map(group => group.length)); i++)
                    cache[i] = { ...co2[i], temperature: temperature[i]["temperature"] };
                setChartData(handleData(cache));
            });
        })();
    }, []);

    function color(type) {
        switch (type) {
            case "co2":              return "#0000ff";
            default:                 return "#000000";
        }
    }

    function tip(type) {
        switch (type) {
            case "co2":              return "Antarctic Ice Cores Revised 800KYr CO2 Data";
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
