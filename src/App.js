import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Termine from "./components/Termine";
import NeuerTermin from "./components/NeuerTermin";
import NeuerUser from "./components/NeuerUser";
import UserList from "./components/UserList";
import UserEdit from "./components/UserEdit";

function App() {
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");

  const handleLogin = (token, username, role) => {
    setToken(token);
    setRole(role);
    setUsername(username);
  };

  const handleLogout = () => {
    setToken("");
    setRole("");
    setUsername("");
  };

  const isAdmin = role === "admin";

  return (
    <Router>
      <Navbar username={username} role={role} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/"
          element={
            !token
              ? <Login onLogin={handleLogin} />
              : <Termine token={token} username={username} role={role} />
          }
        />
        <Route
          path="/neuer-termin"
          element={
            isAdmin
              ? <NeuerTermin token={token} />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/neuer-user"
          element={
            isAdmin
              ? <NeuerUser token={token} />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/users"
          element={
            isAdmin
              ? <UserList token={token} />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/useredit/:id"
          element={
            token
              ? <UserEdit token={token} isAdmin={isAdmin} />
              : <Navigate to="/" />
          }
        />
        {/* Fallback für nicht gefundene Seiten */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;