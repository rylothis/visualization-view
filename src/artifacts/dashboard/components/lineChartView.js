import React, { useMemo } from "react";
import { scaleLinear, scaleTime } from "d3-scale";
import { quantize } from "d3-interpolate";
import { interpolateRainbow } from "d3-scale-chromatic";
import { scaleOrdinal } from "d3-scale";
import { LineChart } from "graphic";

import { flattenLineChart } from "./chartApi";

const WIDTH = 960;
const HEIGHT = 480;
const MARGIN = { top: 20, right: 30, bottom: 30, left: 40 };
const STROKE = { linecap: "round", linejoin: "round", width: 1.5, opacity: 1, mixBlendMode: "multiply" };

function LineChartView({ chart }) {
    const rows = useMemo(() => flattenLineChart(chart), [chart]);
    const names = useMemo(() => chart.files.map(file => file.name), [chart]);
    const color = useMemo(() => scaleOrdinal(names, quantize(interpolateRainbow, names.length + 1)), [names]);

    return (
        <LineChart id={`chart-${chart.id}`}
                   width={WIDTH}
                   height={HEIGHT}
                   margin={MARGIN}
                   stroke={STROKE}
                   source={rows}
                   dataDescHandler={[
                       [value => new Date(value["time"]), scaleTime, [MARGIN.left, WIDTH - MARGIN.right], [{ orient: "bottom" }]],
                       [value => value["anomaly"], scaleLinear, [HEIGHT - MARGIN.bottom, MARGIN.top], [{ orient: "left" }]]
                   ]}
                   typeDescHandler={[
                       [value => value["type"], key => ({ label: key, color: color(key) })]
                   ]}>
        </LineChart>
    );
}

export default LineChartView;
