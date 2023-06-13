import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { DoughnutChart } from "graphic";
import { useAuth } from "auth";

import { getChart } from "./chartApi";
import LineChartView from "./lineChartView";

import styles from "../styles/list.module.css";

function ChartDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [chart, setChart] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setChart(null);
        setError(null);
        getChart(id)
            .then(data => { if (!cancelled) setChart(data); })
            .catch(err => { if (!cancelled) setError(err?.message ?? String(err)); });
        return () => { cancelled = true; };
    }, [id]);

    const isOwner = !!(user && chart && String(chart.user_id) === String(user.sub));

    return (
        <div className={styles.page}>
          <div className={styles.header}>
            <h1>{chart?.name ?? "Chart"}</h1>
            {isOwner && (
                <span>
                  <Link to={`/charts/${id}/edit`}>Edit</Link>
                </span>
            )}
          </div>
          {error && <p>{error}</p>}
          {chart?.description && <p>{chart.description}</p>}
          {chart?.chart_type === "line" && <LineChartView chart={chart} />}
          {chart?.chart_type === "doughnut" && chart.tree && <DoughnutChart source={chart.tree} />}
        </div>
    );
}

export default ChartDetail;
