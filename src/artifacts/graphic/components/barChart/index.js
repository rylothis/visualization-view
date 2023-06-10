import React, { useEffect, useRef } from "react";
import { max } from "d3-array";
import { scaleBand, scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import { axisBottom, axisLeft } from "d3-axis";

/**
 * A BarChart
 * @param {[{label:string,value:number}]} source
 * @param width
 * @param height
 * @param margin
 * @param color
 * @return {JSX.Element}
 */
function BarChart({
    source,
    width = 640,
    height = 320,
    margin = { top: 20, right: 20, bottom: 30, left: 48 },
    color = "#8884d8"
}) {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!source || !svgRef.current) return;

        const svg = select(svgRef.current);
        svg.attr("width", width).attr("height", height).attr("viewBox", [0, 0, width, height]);

        const x = scaleBand()
            .domain(source.map(d => d.label))
            .range([margin.left, width - margin.right])
            .padding(0.2);
        const y = scaleLinear()
            .domain([0, max(source, d => d.value) ?? 0]).nice()
            .range([height - margin.bottom, margin.top]);

        svg.selectAll(".bar")
            .data(source)
            .join("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.label))
            .attr("y", d => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", d => y(0) - y(d.value))
            .attr("fill", color);

        svg.selectAll(".x-axis").data([null]).join("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(axisBottom(x));

        svg.selectAll(".y-axis").data([null]).join("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(axisLeft(y));
    }, [source, width, height, margin, color]);

    return <svg ref={svgRef} style={{ maxWidth: "100%", height: "auto" }} />;
}

export default BarChart;
