import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "shared";
import { useAuth } from "auth";

import { createDevice } from "./sensorApi";

import styles from "../styles/form.module.css";

function DeviceForm() {
    const { authFetch } = useAuth();
    const [name, setName] = useState("");
    const [room, setRoom] = useState("");
    const [emissionFactor, setEmissionFactor] = useState("0.12");
    const [created, setCreated] = useState(null);
    const [error, setError] = useState(null);
    const [pending, setPending] = useState(false);

    async function onSubmit(event) {
        event.preventDefault();
        setError(null);
        setPending(true);
        try {
            const device = await createDevice(authFetch, { name, room, emission_factor: Number(emissionFactor) });
            setCreated(device);
        } catch (err) {
            setError(err?.message ?? String(err));
        } finally {
            setPending(false);
        }
    }

    if (created) {
        return (
            <div className={styles.form} style={{ maxWidth: 560 }}>
              <h1>Device registered</h1>
              <p>Copy these into the device's firmware config now -- the API key will not be shown again.</p>
              <p>Device ID: <code>{created.id}</code></p>
              <p>API key: <code>{created.api_key}</code></p>
              <Link to={`/devices/${created.id}`}>Go to classroom view</Link>
            </div>
        );
    }

    return (
        <form className={styles.form} onSubmit={onSubmit} style={{ maxWidth: 560 }}>
          <h1>New device</h1>
          {error && <p className={styles.error}>{error}</p>}
          <label className={styles.field}>
            <span>Name</span>
            <input className={styles.input} value={name} onChange={event => setName(event.target.value)} required />
          </label>
          <label className={styles.field}>
            <span>Room</span>
            <input className={styles.input} value={room} onChange={event => setRoom(event.target.value)} required />
          </label>
          <label className={styles.field}>
            <span>Grid emission factor (kgCO2e/kWh)</span>
            <input className={styles.input} type="number" step="0.01" value={emissionFactor}
                   onChange={event => setEmissionFactor(event.target.value)} />
          </label>
          <Button type="submit" disabled={pending}>{pending ? "Creating..." : "Create device"}</Button>
        </form>
    );
}

export default DeviceForm;
