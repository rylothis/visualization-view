import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { parseResponse } from "api";

import { decodeJwt } from "./jwt";

const USER_BASE_URL = process.env.REACT_APP_USER_BASE_URL ?? "http://localhost:8080/api/user";
const CLIENT_ID = process.env.REACT_APP_OAUTH_CLIENT_ID ?? "dashboard-web";
const REFRESH_TOKEN_KEY = "auth.refreshToken";

export const AuthContext = createContext(null);

function userFromToken(accessToken) {
    const claims = decodeJwt(accessToken);
    if (!claims) return null;
    return { sub: claims.sub, name: claims.name, scope: claims.scope };
}

async function exchangeToken(form) {
    const response = await fetch(`${USER_BASE_URL}/oauth/token`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(form).toString()
    });
    const { state, data } = await parseResponse(response);
    if (state !== "success") throw new Error(data?.error_description ?? data?.error ?? "login failed");
    return data;
}

function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(null);
    const [user, setUser] = useState(null);
    const [status, setStatus] = useState("loading");
    const refreshingRef = useRef(null);

    const applyToken = useCallback(tokenResponse => {
        localStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
        setAccessToken(tokenResponse.access_token);
        setUser(userFromToken(tokenResponse.access_token));
        setStatus("authenticated");
    }, []);

    const clearSession = useCallback(() => {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        setAccessToken(null);
        setUser(null);
        setStatus("anonymous");
    }, []);

    const refresh = useCallback(() => {
        if (refreshingRef.current) return refreshingRef.current;

        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!storedRefreshToken) {
            clearSession();
            return Promise.resolve(null);
        }

        refreshingRef.current = exchangeToken({
            grant_type: "refresh_token",
            client_id: CLIENT_ID,
            refresh_token: storedRefreshToken
        })
            .then(tokenResponse => {
                applyToken(tokenResponse);
                return tokenResponse.access_token;
            })
            .catch(() => {
                clearSession();
                return null;
            })
            .finally(() => {
                refreshingRef.current = null;
            });

        return refreshingRef.current;
    }, [applyToken, clearSession]);

    useEffect(() => {
        void refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = useCallback(async (username, password) => {
        const tokenResponse = await exchangeToken({ grant_type: "password", client_id: CLIENT_ID, username, password });
        applyToken(tokenResponse);
    }, [applyToken]);

    const register = useCallback(async (name, password) => {
        const response = await fetch(`${USER_BASE_URL}/users`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name, password })
        });
        const { state, data } = await parseResponse(response);
        if (state !== "success") throw new Error(data?.error_description ?? data?.error ?? "registration failed");
        return data;
    }, []);

    const logout = useCallback(() => clearSession(), [clearSession]);

    const authFetch = useCallback(async (url, options = {}) => {
        const withAuth = token => ({
            ...options,
            headers: { ...(options.headers ?? {}), ...(token ? { authorization: `Bearer ${token}` } : {}) }
        });

        const response = await fetch(url, withAuth(accessToken));
        if (response.status !== 401) return response;

        const refreshedToken = await refresh();
        if (!refreshedToken) return response;

        return fetch(url, withAuth(refreshedToken));
    }, [accessToken, refresh]);

    const value = useMemo(
        () => ({ status, user, accessToken, login, register, logout, authFetch }),
        [status, user, accessToken, login, register, logout, authFetch]
    );

    return (
        <AuthContext.Provider value={value}>
          {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export default AuthProvider;
