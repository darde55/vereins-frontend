import React, { useEffect, useState } from "react";
import axios from "axios";

function UserList() {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    try {
      // Hole das Token aus localStorage (oder passe es ggf. an, wo du es speicherst)
      const token = localStorage.getItem("token");
      if (!token) {
        setMsg("Nicht eingeloggt oder kein Token gefunden.");
        setUsers([]);
        return;
      }
      const res = await axios.get("/api/users", {
        headers: {
          Authorization: "Bearer " + token
        }
      });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // Fehlerbehandlung inkl. spezifischer Backend-Fehlermeldung, falls vorhanden
      setMsg(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Fehler beim Laden der User"
      );
      setUsers([]); // Fallback: leeres Array bei Fehler!
    }
  };

  return (
    <div>
      <h2>User-Liste</h2>
      {msg && <div style={{ color: "red" }}>{msg}</div>}
      <ul>
        {(Array.isArray(users) ? users : []).map(user => (
          <li key={user.id}>{user.username} ({user.email}) - Rolle: {user.role}</li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;