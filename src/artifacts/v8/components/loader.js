import React, { useEffect, useState } from "react";
import { ascending } from "d3-array"
import { csv } from "d3-fetch";
import { scaleLinear, scaleTime } from "d3-scale";
import { LineChart } from "graphic";

//region TODO: Move to React context and replace with correct api
import co2 from "../fixtures/national-carbon-emissions.csv";

const CHART_ID = "v8-line-chart";
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
const handlePath = () => ({ co2 });
const handleData = data => data.sort((a, b) => ascending(a.year, b.year));

//endregion

function Loader() {
    const [chartData, setChartData] = useState(null);
    const [colorMap, setColorMap] = useState(null);

    useEffect(() => {
        let cache = [], jobs = [];
        void (async () => {
            // csv use fetch https://developer.mozilla.org/docs/Web/API/fetch
            Object.values(handlePath()).forEach(path => {
                jobs.push(csv(path, data => {
                    const [, ...keys] = Object.keys(data), result = [];
                    keys.forEach(key  => {
                        result.push({
                            type: key,
                            year: `${+data["Year"]}`,
                            value: +data[key] * 3.664
                        });
                    });
                    return result;
                }));
            });
            Promise.all(jobs).then(value => {
                cache = value.flat(2);
                console.log(cache);
                setColorMap(value[0][0].map((data, index) => ({
                    type: data["type"], color: makeColor(index, value[0][0].length)
                })).reduce((obj, item) => ({ ...obj, [item["type"]]: item["color"] }), {}));
                setChartData(handleData(cache));
            });
        })();
    }, []);

    return !!chartData ?
        (
            <LineChart id={CHART_ID}
                       width={WIDTH}
                       height={HEIGHT}
                       margin={MARGIN}
                       stroke={STROKE}
                       source={chartData}
                       dataDescHandler={[
                           [value => new Date(value["year"]), scaleTime,   [MARGIN.left, WIDTH - MARGIN.right],  [{ orient: "bottom" }]],
                           [value => value["value"],           scaleLinear, [HEIGHT - MARGIN.bottom, MARGIN.top], [{ orient: "left" }]]
                       ]}
                       typeDescHandler={[
                           [value => value["type"], key => ({ label: key, color: `hsl(${colorMap[key]}, 100%, 50%)` })]
                       ]}>
            </LineChart>
        ) : <h1>Loading...</h1>;
}

function makeColor(colorNum, colors){
    if (colors < 1) colors = 1;
    // defaults to one color - avoid divide by zero
    return colorNum * (360 / colors) % 360;
}

export default Loader;
