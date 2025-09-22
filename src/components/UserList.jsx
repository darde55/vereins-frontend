import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
  "https://vereins-backend-production.up.railway.app/api";

function UserList() {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMsg("Nicht eingeloggt oder kein Token gefunden.");
        setUsers([]);
        return;
      }
      const res = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: "Bearer " + token
        }
      });
      setUsers(Array.isArray(res.data) ? res.data : []);
      if (!Array.isArray(res.data) || res.data.length === 0) {
        setMsg("Keine Benutzer gefunden.");
      } else {
        setMsg("");
      }
    } catch (err) {
      setMsg(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Fehler beim Laden der User"
      );
      setUsers([]);
    }
  };

  return (
    <div>
      <h2>User-Liste</h2>
      {msg && <div style={{ color: "red" }}>{msg}</div>}
      <ul>
        {(Array.isArray(users) ? users : []).map(user => (
          <li key={user.id}>
            {user.username} ({user.email}) - Rolle: {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;