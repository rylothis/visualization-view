import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { BarChart } from "graphic";

import { getReadings, getSeries, getSummary } from "./sensorApi";
import MetricChartView from "./metricChartView";

import styles from "../styles/list.module.css";

function dayLabel(ts) {
    return new Date(ts * 1000).toISOString().slice(0, 10);
}

function dailyCo2e(rows) {
    const byDay = new Map();
    for (const row of rows) {
        if (row.co2e_kg_today == null) continue;
        const label = dayLabel(row.ts);
        byDay.set(label, Math.max(byDay.get(label) ?? 0, row.co2e_kg_today));
    }
    return Array.from(byDay.entries()).sort(([a], [b]) => (a < b ? -1 : 1)).map(([label, value]) => ({ label, value }));
}

function Stat({ label, value, unit }) {
    return (
        <li className={`${styles.card} ${styles.stat}`}>
          <span className={styles.statLabel}>{label}</span>
          <span className={styles.statValue}>
            {value}
            {unit && <span className={styles.statUnit}>{unit}</span>}
          </span>
        </li>
    );
}

function ClassroomView() {
    const { id } = useParams();
    const [readings, setReadings] = useState(null);
    const [series, setSeries] = useState(null);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setError(null);
        Promise.all([
            getReadings(id, { limit: 2000 }),
            getSeries(id, "co2_ppm", { limit: 2000 }),
            getSeries(id, "occupancy", { limit: 2000 }),
            getSeries(id, "power_kw", { limit: 2000 }),
            getSummary(id)
        ]).then(([readingsResp, co2, occupancy, power, summaryResp]) => {
            if (cancelled) return;
            setReadings(readingsResp);
            setSeries({ co2, occupancy, power });
            setSummary(summaryResp);
        }).catch(err => { if (!cancelled) setError(err?.message ?? String(err)); });
        return () => { cancelled = true; };
    }, [id]);

    const latest = readings?.rows?.length ? readings.rows[readings.rows.length - 1] : null;
    const co2eBars = useMemo(() => (readings ? dailyCo2e(readings.rows) : []), [readings]);

    return (
        <div className={styles.page}>
          <div className={styles.header}>
            <div>
              <h1>{readings?.device?.name ?? "Classroom"}</h1>
              {latest && <p className={styles.subtitle}>Last reading {new Date(latest.ts * 1000).toLocaleString()}</p>}
            </div>
            {readings?.device?.room && <span className={styles.type}>{readings.device.room}</span>}
          </div>
          {error && <p className={styles.errorBanner}>{error}</p>}

          {latest && (
              <ul className={styles.list}>
                <Stat label="Occupancy" value={latest.occupancy ?? "--"} />
                <Stat label="CO2" value={latest.co2_ppm ?? "--"} unit="ppm" />
                <Stat label="Temperature" value={latest.temperature_c ?? "--"} unit="C" />
                <Stat label="Power" value={latest.power_kw ?? "--"} unit="kW" />
                <Stat label="Energy today" value={latest.energy_kwh_today ?? "--"} unit="kWh" />
                <Stat label="CO2e today" value={latest.co2e_kg_today ?? "--"} unit="kg" />
              </ul>
          )}

          {series?.co2?.rows?.length > 0 && (
              <>
                <h2>CO2 (ppm)</h2>
                <MetricChartView id={`co2-${id}`} points={series.co2.rows} label="CO2 ppm" color="#fc5c7d" />
              </>
          )}
          {series?.occupancy?.rows?.length > 0 && (
              <>
                <h2>Occupancy</h2>
                <MetricChartView id={`occupancy-${id}`} points={series.occupancy.rows} label="Occupancy" color="#6a82fb" />
              </>
          )}
          {series?.power?.rows?.length > 0 && (
              <>
                <h2>Power (kW)</h2>
                <MetricChartView id={`power-${id}`} points={series.power.rows} label="Power kW" color="#f5a623" />
              </>
          )}
          {co2eBars.length > 0 && (
              <>
                <h2>Daily CO2e (kg)</h2>
                <BarChart source={co2eBars} />
              </>
          )}

          {summary && (
              <>
                <h2>Summary</h2>
                <ul className={styles.list}>
                  <Stat label="Total energy" value={summary.total_energy_kwh.toFixed(2)} unit="kWh" />
                  <Stat label="Total CO2e" value={summary.total_co2e_kg.toFixed(2)} unit="kg" />
                  <Stat label="Unoccupied energy" value={summary.unoccupied_energy_kwh.toFixed(2)}
                        unit={`kWh (${summary.wasted_pct.toFixed(1)}% wasted)`} />
                  <Stat label="Average occupied CO2" value={summary.avg_co2_occupied.toFixed(0)} unit="ppm" />
                  <Stat label="Max CO2" value={summary.max_co2.toFixed(0)} unit="ppm" />
                  <Stat label="Energy per person-hour" value={summary.energy_per_person_hour.toFixed(3)} unit="kWh" />
                  <Stat label="CO2e per person-hour" value={summary.co2e_per_person_hour.toFixed(3)} unit="kg" />
                </ul>
              </>
          )}
        </div>
    );
}

export default ClassroomView;
