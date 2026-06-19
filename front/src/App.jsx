import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { OrderProvider } from "./context/OrderContext.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import History from "./pages/History.jsx";
import ScanLocation from "./pages/ScanLocation.jsx";
import MachineSelect from "./pages/MachineSelect.jsx";
import MachineSelectDrop_Back from "./pages/MachineSelectDrop_Back.jsx";
import Machine_BufferDrop from "./pages/Machine_BufferDrop.jsx";
import Machine_Recall from "./pages/Machine_Recall.jsx";


function isAuthed() {
  return Boolean(localStorage.getItem("authUser"));
}

function RequireAuth({ children }) {
  return children;
}

function App() {
  return (
    <OrderProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
       
        <Route
          path="/history"
          element={
            <RequireAuth>
              <History />
            </RequireAuth>
          }
        />

         <Route
          path="/scanlocation"
          element={
            <RequireAuth>
              <ScanLocation />
            </RequireAuth>
          }
        />

        <Route
          path="/machine-select"
          element={
            <RequireAuth>
              <MachineSelect />
            </RequireAuth>
          }
        />

        <Route
          path="/machine-select-drop-or-takeback"
          element={
            <RequireAuth>
              <MachineSelectDrop_Back />
            </RequireAuth>
          }
        />

        <Route
          path="/machine-buffer-drop"
          element={
            <RequireAuth>
              <Machine_BufferDrop />
            </RequireAuth>
          }
        />

         <Route
          path="/machine-recall"
          element={
            <RequireAuth>
              <Machine_Recall />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </OrderProvider>
  );
}

export default App;
