import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "shared";
import { useAuth } from "auth";

import { listDevices, revokeDevice, rotateDevice } from "./sensorApi";

import styles from "../styles/list.module.css";

function DeviceList() {
    const { authFetch } = useAuth();
    const [devices, setDevices] = useState(null);
    const [error, setError] = useState(null);
    const [rotatedKey, setRotatedKey] = useState(null);

    function reload() {
        listDevices(authFetch).then(setDevices).catch(err => setError(err?.message ?? String(err)));
    }

    useEffect(reload, [authFetch]);

    async function onRotate(id) {
        setError(null);
        try {
            const { api_key } = await rotateDevice(authFetch, id);
            setRotatedKey({ id, api_key });
        } catch (err) {
            setError(err?.message ?? String(err));
        }
    }

    async function onRevoke(id) {
        if (!window.confirm("Revoke this device? It will no longer be able to post readings.")) return;
        setError(null);
        try {
            await revokeDevice(authFetch, id);
            reload();
        } catch (err) {
            setError(err?.message ?? String(err));
        }
    }

    return (
        <div className={styles.page}>
          <div className={styles.header}>
            <h1>Devices</h1>
            <Link to="/devices/new">New device</Link>
          </div>
          {error && <p>{error}</p>}
          {rotatedKey && (
              <p>
                New API key for {rotatedKey.id} (copy it now, it will not be shown again):{" "}
                <code>{rotatedKey.api_key}</code>
              </p>
          )}
          {devices && devices.length === 0 && <p className={styles.empty}>No devices yet.</p>}
          {devices && devices.length > 0 && (
              <ul className={styles.list}>
                {devices.map(device => (
                    <li key={device.id} className={styles.card}>
                      <span className={styles.type}>{device.room}{device.revoked ? " · revoked" : ""}</span>
                      <h2><Link to={`/devices/${device.id}`}>{device.name}</Link></h2>
                      <Button size="sm" onClick={() => onRotate(device.id)}>Rotate key</Button>
                      {" "}
                      <Button size="sm" color="#dc3545" onClick={() => onRevoke(device.id)}>Revoke</Button>
                    </li>
                ))}
              </ul>
          )}
        </div>
    );
}

export default DeviceList;
