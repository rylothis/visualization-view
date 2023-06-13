import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "./context";

function ProtectedRoute({ children }) {
    const { status } = useAuth();

    if (status === "loading") return null;
    if (status !== "authenticated") return <Navigate to="/login" replace />;

    return children;
}

export default ProtectedRoute;
