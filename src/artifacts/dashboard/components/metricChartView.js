import React, { useMemo } from "react";
import { scaleLinear, scaleTime } from "d3-scale";
import { LineChart } from "graphic";

const WIDTH = 900;
const HEIGHT = 260;
const MARGIN = { top: 10, right: 20, bottom: 30, left: 48 };
const STROKE = { linecap: "round", linejoin: "round", width: 1.5, opacity: 1, mixBlendMode: "normal" };

function MetricChartView({ id, points, label, color = "#6a82fb" }) {
    const rows = useMemo(() => points.map(([ts, value]) => ({ ts, value })), [points]);

    return (
        <LineChart id={id}
                   width={WIDTH}
                   height={HEIGHT}
                   margin={MARGIN}
                   stroke={STROKE}
                   source={rows}
                   dataDescHandler={[
                       [row => new Date(row.ts * 1000), scaleTime, [MARGIN.left, WIDTH - MARGIN.right], [{ orient: "bottom" }]],
                       [row => row.value, scaleLinear, [HEIGHT - MARGIN.bottom, MARGIN.top], [{ orient: "left" }]]
                   ]}
                   typeDescHandler={[
                       [() => label, key => ({ label: key, color })]
                   ]}>
        </LineChart>
    );
}

export default MetricChartView;
