import React, { Fragment, useContext, useEffect, useState } from "react";
import { Route } from "react-router";
import { Link } from "react-router-dom";
import { IoBarChart  } from "react-icons/io5";
import { ascending } from "d3-array";
import { Button, Col, Container, Row } from "shared";
import { GraphicContext } from "./components/context";
import useGraphicCallback from "./components/callback";
import LineChart from "./components/lineChart";
import DoughnutChart from "./components/doughnutChart";

import sharedStyles from "shared/styles/debug.module.css";

// The content service, reached through the gateway -- see
// visualization-server's services/gateway (default_service_table routes
// "/api/content" here) and services/content (the chart/file API itself).
// Override with REACT_APP_API_BASE_URL for a non-default gateway address.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "http://localhost:8080/api/content";

/**
 * Fetches the chart list, finds the first chart of the given chart_type,
 * and fetches its full detail (files/rows for "line", an assembled tree
 * for "doughnut" -- see services/content/content_service.hpp). null if no
 * chart of that type exists yet.
 * @param {"line"|"doughnut"} chartType
 * @return {Promise<object|null>}
 */
async function fetchChartByType(chartType) {
    const listResponse = await fetch(`${API_BASE_URL}/charts`);
    if (!listResponse.ok) throw new Error(`GET /charts: ${listResponse.status}`);
    const charts = await listResponse.json();

    const summary = charts.find(chart => chart.chart_type === chartType);
    if (!summary) return null;

    const detailResponse = await fetch(`${API_BASE_URL}/charts/${summary.id}`);
    if (!detailResponse.ok) throw new Error(`GET /charts/${summary.id}: ${detailResponse.status}`);
    return await detailResponse.json();
}

/**
 * Flattens a "line" chart's files -- each file is one named series, rows
 * are [time, value] pairs (see the {time, value} column convention) --
 * into the flat {type, time, anomaly} row array LineChart's data-access
 * callbacks expect, sorted by time ascending.
 * @param {object} chart
 * @return {[{type:string,time:string,anomaly:number}]}
 */
function flattenLineChart(chart) {
    const rows = chart.files.flatMap(file =>
        file.rows.map(([time, value]) => ({
            type: file.name,
            time,
            anomaly: +value
        }))
    );
    return rows.sort((a, b) => ascending(a.time, b.time));
}

function Graphic() {
    const [doughnutChartData, setDoughnutChartData] = useState(null);
    const [lineChartData, setLineChartData] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const { charts } = useContext(GraphicContext);
    const { line, doughnut } = useGraphicCallback();

    useEffect(() => {
        Promise.all([fetchChartByType("line"), fetchChartByType("doughnut")])
            .then(([lineChart, doughnutChart]) => {
                if (lineChart) {
                    const rows = flattenLineChart(lineChart);
                    console.log("line", rows);
                    setLineChartData(rows);
                }
                // The tree is already {name, children: [...]} / {name, value},
                // assembled server-side -- ready for d3-hierarchy as-is.
                if (doughnutChart) {
                    console.log("doughnut", doughnutChart.tree);
                    setDoughnutChartData(doughnutChart.tree);
                }
            })
            .catch(err => setLoadError(err?.message ?? String(err)));
    }, []);

    return (
        <>
          <div className={sharedStyles.container}>
            <Container fluid>
              {loadError && (
                  <Row>
                    <Col>
                      <p>Failed to load chart data from {API_BASE_URL}: {loadError}</p>
                    </Col>
                  </Row>
              )}
              <Row>
                <Col>
                  <Button disabled={!lineChartData} onClick={() => {
                      line("post", {
                          source: lineChartData,
                          x: value => new Date(value["time"]),
                          y: value => value["anomaly"],
                          type: value => value["type"],
                          config: type => {
                              switch (type) {
                                  case "GlobalAnnual":
                                      return { label: "Global Annual", color: "#ff0000" };
                                  case "GlobalMonthly":
                                      return { label: "Global Monthly", color: "#800000" };
                                  case "NHAnnual":
                                      return { label: "Northern-Hemisphere Annual", color: "#00ff00" };
                                  case "NHMonthly":
                                      return { label: "Northern-Hemisphere Monthly", color: "#008800" };
                                  case "SHAnnual":
                                      return { label: "Southern-Hemisphere Annual", color: "#0000ff" };
                                  case "SHMonthly":
                                      return { label: "Southern-Hemisphere Monthly", color: "#000088" };
                                  default:
                                      throw new Error("Invalid data");
                              }
                          }
                      });
                  }}>
                      Create Line Emitter
                  </Button>
                </Col>
                <Col>
                  <Button onClick={() =>{
                      line("put",{

                      })
                  }}>
                    Update Line Emitter
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Button disabled={!doughnutChartData} onClick={() => {
                      doughnut("post", {
                          source: doughnutChartData
                      });
                  }}>
                    Doughnut Trigger
                  </Button>
                </Col>
              </Row>
            </Container>
          </div>
          <br />
          {charts.map(({ type, ...props }, index) => {
              switch (type) {
                  case "line":
                      return (
                          <Fragment key={index}>
                            <div className={sharedStyles.container}>
                              <LineChart key={`line-chart-${index}`} {...props} />
                            </div>
                            <br />
                          </Fragment>
                      );
                  case "doughnut":
                      return (
                          <Fragment key={index}>
                            <div className={sharedStyles.container}>
                              <DoughnutChart key={`doughnut-chart-${index}`} {...props} />
                            </div>
                            <br />
                          </Fragment>
                      );
                  default:
                      return null;
              }
          })}
        </>
    );
}

const DEBUG_ROOT = "/artifact/debug";

export const graphic = {
    link: (
        <Link className={sharedStyles.link} to={`${DEBUG_ROOT}/graphic`}>
          <IoBarChart className={sharedStyles.icon} />
          <span>Graphic</span>
        </Link>
    ),
    route: key => (
        <Route key={key} path="/graphic" element={
          <>
            <div className={sharedStyles.header}>
              <h1>Graphic</h1>
            </div>
            <div className={sharedStyles.body}>
              <Graphic />
            </div>
          </>
        } />
    )
};
