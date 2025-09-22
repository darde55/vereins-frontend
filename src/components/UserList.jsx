import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

const API_URL = "https://vereins-backend-production.up.railway.app/api";

const styles = {
  container: { maxWidth: 900, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0px 2px 12px rgba(0,0,0,0.08)" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 16 },
  th: { background: "#f5f7fa", padding: "12px 8px", borderBottom: "1px solid #e0e0e0", textAlign: "left" },
  td: { padding: "12px 8px", borderBottom: "1px solid #e0e0e0" },
  trHover: { background: "#f1f7ff" },
  actionBtn: { background: "#1976d2", color: "#fff", border: "none", marginRight: 6, padding: "6px 10px", borderRadius: 4, cursor: "pointer", fontSize: "1em", display: "inline-flex", alignItems: "center", gap: 4 },
  msg: { color: "#c62828", marginBottom: 12, fontWeight: "bold" },
  input: { padding: "6px", fontSize: "1em", borderRadius: 4, border: "1px solid #bbb" },
  select: { padding: "6px", fontSize: "1em", borderRadius: 4, border: "1px solid #bbb" }
};

function UserList() {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const [editUserId, setEditUserId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { setMsg("Nicht eingeloggt oder kein Token gefunden."); setUsers([]); return; }
      const res = await axios.get(`${API_URL}/users`, { headers: { Authorization: "Bearer " + token } });
      setUsers(Array.isArray(res.data) ? res.data : []);
      setMsg("");
    } catch (err) {
      setMsg(err?.response?.data?.error || err?.response?.data?.message || "Fehler beim Laden der User");
      setUsers([]);
    }
  };

  const handleEdit = (user) => {
    setEditUserId(user.id);
    setEditData({
      ...user,
      password: "",
      active: typeof user.active === "boolean" ? user.active : user.active === "true"
    });
  };

  const handleEditChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "active") value = value === "true";
    setEditData({ ...editData, [e.target.name]: value });
  };

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        username: editData.username,
        email: editData.email,
        role: editData.role,
        active: !!editData.active
      };
      if (editData.password) payload.password = editData.password;
      await axios.put(`${API_URL}/users/${id}`, payload, { headers: { Authorization: "Bearer " + token } });
      setMsg("User aktualisiert.");
      setEditUserId(null);
      await fetchUsers();
    } catch (err) {
      setMsg(err?.response?.data?.error || err?.response?.data?.message || "Fehler beim Aktualisieren");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Willst du diesen User wirklich löschen?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/users/${id}`, { headers: { Authorization: "Bearer " + token } });
      setMsg("User gelöscht.");
      await fetchUsers();
    } catch (err) {
      setMsg(err?.response?.data?.error || err?.response?.data?.message || "Fehler beim Löschen");
    }
  };

  return (
    <div style={styles.container}>
      <h2>User-Liste</h2>
      {msg && <div style={styles.msg}>{msg}</div>}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Username</th>
            <th style={styles.th}>E-Mail</th>
            <th style={styles.th}>Rolle</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user =>
            editUserId === user.id ? (
              <tr key={user.id} style={styles.trHover}>
                <td style={styles.td}>
                  <input type="text" name="username" value={editData.username} onChange={handleEditChange} style={styles.input} />
                </td>
                <td style={styles.td}>
                  <input type="email" name="email" value={editData.email} onChange={handleEditChange} style={styles.input} />
                </td>
                <td style={styles.td}>
                  <select name="role" value={editData.role} onChange={handleEditChange} style={styles.select}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td style={styles.td}>
                  <select name="active" value={editData.active ? "true" : "false"} onChange={handleEditChange} style={styles.select}>
                    <option value="true">aktiv</option>
                    <option value="false">inaktiv</option>
                  </select>
                </td>
                <td style={styles.td}>
                  <button style={styles.actionBtn} onClick={() => handleUpdate(user.id)}><FaSave /> Speichern</button>
                  <button style={styles.actionBtn} onClick={() => setEditUserId(null)}><FaTimes /> Abbrechen</button>
                  <div style={{ marginTop: 8 }}>
                    <input type="password" name="password" placeholder="Neues Passwort" value={editData.password} onChange={handleEditChange} style={styles.input} autoComplete="new-password" />
                    <div style={{ fontSize: "0.85em", color: "#888", marginTop: "2px" }}>Leer lassen, um das Passwort nicht zu ändern</div>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={user.id}>
                <td style={styles.td}>{user.username}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.role}</td>
                <td style={styles.td}>{user.active ? "aktiv" : "inaktiv"}</td>
                <td style={styles.td}>
                  <button style={styles.actionBtn} onClick={() => handleEdit(user)}><FaEdit /> Bearbeiten</button>
                  <button style={styles.actionBtn} onClick={() => handleDelete(user.id)}><FaTrash /> Löschen</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UserList;