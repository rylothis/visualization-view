import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "auth";

import { listCharts } from "./chartApi";

import styles from "../styles/list.module.css";

function ChartList() {
    const { status } = useAuth();
    const [charts, setCharts] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        listCharts()
            .then(data => { if (!cancelled) setCharts(data); })
            .catch(err => { if (!cancelled) setError(err?.message ?? String(err)); });
        return () => { cancelled = true; };
    }, []);

    return (
        <div className={styles.page}>
          <div className={styles.header}>
            <h1>Charts</h1>
            {status === "authenticated" && <Link to="/charts/new">New chart</Link>}
          </div>
          {error && <p>{error}</p>}
          {charts && charts.length === 0 && <p className={styles.empty}>No charts yet.</p>}
          {charts && charts.length > 0 && (
              <ul className={styles.list}>
                {charts.map(chart => (
                    <li key={chart.id}>
                      <Link className={styles.card} to={`/charts/${chart.id}`}>
                        <span className={styles.type}>{chart.chart_type}</span>
                        <h2>{chart.name}</h2>
                        {chart.description && <p>{chart.description}</p>}
                      </Link>
                    </li>
                ))}
              </ul>
          )}
        </div>
    );
}

export default ChartList;
