import React, { useState, useEffect } from "react";
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
  const [user, setUser] = useState(null); // user: {username, role, score?}

  // Persistenz für Login (lädt einmal beim Start)
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Login-Handler erwartet user-Objekt (mit username, role, ...)
  const handleLogin = (token, userObj) => {
    setToken(token);
    setUser(userObj);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const isAdmin = user?.role === "admin";

  return (
    <Router>
      <Navbar username={user?.username} role={user?.role} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/"
          element={
            !token || !user
              ? <Login onLogin={handleLogin} />
              : <Termine token={token} user={user} />
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
            token && user
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