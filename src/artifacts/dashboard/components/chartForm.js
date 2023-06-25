import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "shared";
import { useAuth } from "auth";

import { createChart, deleteChart, expectedColumns, getChart, updateChart } from "./chartApi";
import { parseCsvRows, readFileAsText } from "./csv";

import styles from "../styles/form.module.css";

function ChartForm({ mode }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authFetch } = useAuth();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [chartType, setChartType] = useState("line");
    const [existingFiles, setExistingFiles] = useState([]);
    const [deletedUrls, setDeletedUrls] = useState([]);
    const [pendingFiles, setPendingFiles] = useState([]);
    const [fileName, setFileName] = useState("");
    const [fileInfo, setFileInfo] = useState("");
    const [error, setError] = useState(null);
    const [pending, setPending] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (mode !== "edit") return;
        let cancelled = false;
        getChart(id).then(chart => {
            if (cancelled) return;
            setName(chart.name);
            setDescription(chart.description ?? "");
            setChartType(chart.chart_type);
            setExistingFiles(chart.files.map(file => ({ url: file.url, name: file.name, info: file.info })));
        }).catch(err => setError(err?.message ?? String(err)));
        return () => { cancelled = true; };
    }, [mode, id]);

    async function onAddFile() {
        setError(null);
        const file = fileInputRef.current?.files?.[0];
        if (!file) { setError("choose a CSV file first"); return; }
        if (!fileName) { setError("series name is required"); return; }
        try {
            const text = await readFileAsText(file);
            const columns = expectedColumns(chartType);
            const rows = parseCsvRows(text, columns);
            setPendingFiles(files => [...files, { name: fileName, info: fileInfo, columns, rows }]);
            setFileName("");
            setFileInfo("");
            fileInputRef.current.value = "";
        } catch (err) {
            setError(err?.message ?? String(err));
        }
    }

    function removePendingFile(index) {
        setPendingFiles(files => files.filter((_, i) => i !== index));
    }

    function toggleDeleteExisting(url) {
        setDeletedUrls(urls => (urls.includes(url) ? urls.filter(u => u !== url) : [...urls, url]));
    }

    async function onSubmit(event) {
        event.preventDefault();
        setError(null);
        setPending(true);
        try {
            if (mode === "create") {
                const chart = await createChart(authFetch, {
                    name,
                    description,
                    chart_type: chartType,
                    files: pendingFiles
                });
                navigate(`/charts/${chart.id}`);
            } else {
                const files = [
                    ...deletedUrls.map(url => ({ operation: "delete", url })),
                    ...pendingFiles.map(file => ({ operation: "insert", ...file }))
                ];
                await updateChart(authFetch, { id, name, description, files });
                navigate(`/charts/${id}`);
            }
        } catch (err) {
            setError(err?.message ?? String(err));
        } finally {
            setPending(false);
        }
    }

    async function onDeleteChart() {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        setPending(true);
        try {
            await deleteChart(authFetch, id);
            navigate("/");
        } catch (err) {
            setError(err?.message ?? String(err));
            setPending(false);
        }
    }

    return (
        <form className={styles.form} onSubmit={onSubmit} style={{ maxWidth: 560 }}>
          <h1>{mode === "create" ? "New chart" : "Edit chart"}</h1>
          {error && <p className={styles.error}>{error}</p>}

          <label className={styles.field}>
            <span>Name</span>
            <input className={styles.input} value={name} onChange={event => setName(event.target.value)} required />
          </label>

          <label className={styles.field}>
            <span>Description</span>
            <input className={styles.input} value={description} onChange={event => setDescription(event.target.value)} />
          </label>

          <label className={styles.field}>
            <span>Chart type</span>
            <select className={styles.input} value={chartType} disabled={mode === "edit"}
                    onChange={event => setChartType(event.target.value)}>
              <option value="line">line (columns: time, value)</option>
              <option value="doughnut">doughnut (columns: path, value)</option>
            </select>
          </label>

          {existingFiles.length > 0 && (
              <fieldset>
                <legend>Existing series</legend>
                {existingFiles.map(file => (
                    <label key={file.url} style={{ display: "block" }}>
                      <input type="checkbox" checked={deletedUrls.includes(file.url)}
                             onChange={() => toggleDeleteExisting(file.url)} />
                      {" "}{file.name} {deletedUrls.includes(file.url) ? "(will be deleted)" : ""}
                    </label>
                ))}
              </fieldset>
          )}

          <fieldset>
            <legend>Add series from CSV</legend>
            <p>Header row must be exactly: {expectedColumns(chartType).join(",")}</p>
            <label className={styles.field}>
              <span>Series name</span>
              <input className={styles.input} value={fileName} onChange={event => setFileName(event.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Series info (optional)</span>
              <input className={styles.input} value={fileInfo} onChange={event => setFileInfo(event.target.value)} />
            </label>
            <input type="file" accept=".csv" ref={fileInputRef} />
            <Button type="button" onClick={onAddFile}>Add series</Button>
            {pendingFiles.length > 0 && (
                <ul>
                  {pendingFiles.map((file, index) => (
                      <li key={`${file.name}-${index}`}>
                        {file.name} ({file.rows.length} rows)
                        {" "}
                        <Button type="button" size="sm" onClick={() => removePendingFile(index)}>Remove</Button>
                      </li>
                  ))}
                </ul>
            )}
          </fieldset>

          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : mode === "create" ? "Create chart" : "Save changes"}
          </Button>

          {mode === "edit" && (
              <Button type="button" outline color="#dc2626" disabled={pending} onClick={onDeleteChart}>
                Delete chart
              </Button>
          )}
        </form>
    );
}

export default ChartForm;
