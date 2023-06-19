import React from "react";
import { NavLink, Link } from "react-router-dom";
import { FiCpu, FiLogOut } from "react-icons/fi";
import { Button, Container } from "shared";
import { useAuth } from "auth";

import styles from "../styles/appHeader.module.css";

function navLinkClassName({ isActive }) {
    return isActive ? `${styles.link} ${styles.linkActive}` : styles.link;
}

function AppHeader() {
    const { status, user, logout } = useAuth();

    return (
        <header className={styles.header}>
          <Container className={styles.inner} component="div">
            <Link to="/" className={styles.brand}>
              <span className={styles.brandMark}><FiCpu /></span>
              Visualization
            </Link>

            <nav className={styles.nav}>
              <NavLink to="/" end className={navLinkClassName}>Charts</NavLink>
              {status === "authenticated" && (
                  <NavLink to="/devices" className={navLinkClassName}>Devices</NavLink>
              )}
            </nav>

            <div className={styles.account}>
              {status === "authenticated" && (
                  <>
                    <span className={styles.username}>{user?.name}</span>
                    <Button size="sm" outline onClick={logout}>
                      <span className={styles.logoutLabel}><FiLogOut /> Log out</span>
                    </Button>
                  </>
              )}
              {status === "anonymous" && (
                  <>
                    <Link to="/login" className={styles.link}>Log in</Link>
                    <Button size="sm" component={Link} to="/register">Register</Button>
                  </>
              )}
            </div>
          </Container>
        </header>
    );
}

export default AppHeader;
