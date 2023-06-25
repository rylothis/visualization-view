import React from "react";
import { Outlet, Route, Routes } from "react-router";
import { ApiProvider, InfoContextHolder } from "api";
import { AuthProvider, Login, ProtectedRoute, Register } from "auth";
import { ChartDetail, ChartForm, ChartList, ClassroomView, DeviceForm, DeviceList } from "dashboard";

import AppHeader from "./components/appHeader";
import Debug from "./debug";

function Shell() {
    return (
        <div className="App">
          <AppHeader />
          <main>
            <Outlet />
          </main>
        </div>
    );
}

function App() {
    return (
        <ApiProvider>
          <AuthProvider>
            <InfoContextHolder />
            <Routes>
              <Route path="/artifact/debug/*" element={<Debug />} />
              <Route element={<Shell />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<ChartList />} />
                <Route path="/charts/new" element={<ProtectedRoute><ChartForm mode="create" /></ProtectedRoute>} />
                <Route path="/charts/:id" element={<ChartDetail />} />
                <Route path="/charts/:id/edit" element={<ProtectedRoute><ChartForm mode="edit" /></ProtectedRoute>} />
                <Route path="/devices" element={<ProtectedRoute><DeviceList /></ProtectedRoute>} />
                <Route path="/devices/new" element={<ProtectedRoute><DeviceForm /></ProtectedRoute>} />
                <Route path="/devices/:id" element={<ClassroomView />} />
                <Route path="*" element={<h1>Error</h1>} />
              </Route>
            </Routes>
          </AuthProvider>
        </ApiProvider>
    );
}

export default App;
