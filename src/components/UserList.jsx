import React, { useEffect, useState } from "react";
import axios from "axios";

function UserList() {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setMsg("Fehler beim Laden der User");
      setUsers([]); // Fallback: leeres Array bei Fehler!
    }
  };

  return (
    <div>
      <h2>User-Liste</h2>
      {msg && <div style={{ color: "red" }}>{msg}</div>}
      <ul>
        {(Array.isArray(users) ? users : []).map(user => (
          <li key={user.id}>{user.username} ({user.email})</li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;