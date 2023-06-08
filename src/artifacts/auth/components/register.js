import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Container, Row, Col } from "shared";

import { useAuth } from "./context";

import styles from "../styles/form.module.css";

function Register() {
    const { register, login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [pending, setPending] = useState(false);

    async function onSubmit(event) {
        event.preventDefault();
        setError(null);
        setPending(true);
        try {
            await register(username, password);
            await login(username, password);
            navigate("/");
        } catch (err) {
            setError(err?.message ?? String(err));
        } finally {
            setPending(false);
        }
    }

    return (
        <Container>
          <Row>
            <Col>
              <form className={styles.form} onSubmit={onSubmit}>
                <h1>Register</h1>
                {error && <p className={styles.error}>{error}</p>}
                <label className={styles.field}>
                  <span>Username</span>
                  <input className={styles.input} value={username} autoComplete="username"
                         onChange={event => setUsername(event.target.value)} required />
                </label>
                <label className={styles.field}>
                  <span>Password</span>
                  <input className={styles.input} type="password" value={password} autoComplete="new-password"
                         onChange={event => setPassword(event.target.value)} required />
                </label>
                <Button type="submit" disabled={pending}>
                  {pending ? "Creating account..." : "Create account"}
                </Button>
                <p className={styles.switch}>
                  Already have an account? <Link to="/login">Log in</Link>
                </p>
              </form>
            </Col>
          </Row>
        </Container>
    );
}

export default Register;
