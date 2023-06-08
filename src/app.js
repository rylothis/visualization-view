import React from "react";
import { Route, Routes } from "react-router";
import { ApiProvider, InfoContextHolder } from "api";
import { AuthProvider, Login, Register } from "auth";

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
                <Route path="*" element={<h1>Error</h1>} />
              </Routes>
            </div>
          </AuthProvider>
        </ApiProvider>
    );
}

export default App;
