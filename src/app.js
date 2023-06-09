import React from "react";
import { Route, Routes } from "react-router";
import { ApiProvider, InfoContextHolder } from "api";
import { AuthProvider, Login, ProtectedRoute, Register } from "auth";
import { ChartDetail, ChartForm, ChartList } from "dashboard";

import Debug from "./debug";

function App() {
    return (
        <ApiProvider>
          <AuthProvider>
            <InfoContextHolder />
            <div className="App">
              <Routes>
                <Route path="/artifact/debug/*" element={<Debug />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<ChartList />} />
                <Route path="/charts/new" element={<ProtectedRoute><ChartForm mode="create" /></ProtectedRoute>} />
                <Route path="/charts/:id" element={<ChartDetail />} />
                <Route path="/charts/:id/edit" element={<ProtectedRoute><ChartForm mode="edit" /></ProtectedRoute>} />
                <Route path="*" element={<h1>Error</h1>} />
              </Routes>
            </div>
          </AuthProvider>
        </ApiProvider>
    );
}

export default App;
