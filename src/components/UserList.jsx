import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaSave, FaTimes, FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";

const API_URL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
  "https://vereins-backend-production.up.railway.app/api";

const styles = {
  container: {
    maxWidth: 900,
    margin: "40px auto",
    padding: 24,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0px 2px 12px rgba(0,0,0,0.08)"
  },
  tableWrapper: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 16
  },
  th: {
    background: "#f5f7fa",
    padding: "12px 8px",
    borderBottom: "1px solid #e0e0e0",
    textAlign: "left"
  },
  td: {
    padding: "12px 8px",
    borderBottom: "1px solid #e0e0e0"
  },
  trHover: {
    background: "#f1f7ff"
  },
  actionBtn: {
    background: "#1976d2",
    color: "#fff",
    border: "none",
    marginRight: 6,
    padding: "6px 10px",
    borderRadius: 4,
    cursor: "pointer",
    transition: "background 0.18s",
    fontSize: "1em",
    display: "inline-flex",
    alignItems: "center",
    gap: 4
  },
  toolbar: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 8,
    gap: 12
  },
  sortBtn: {
    background: "#607d8b",
    color: "#fff",
    border: "none",
    padding: "7px 16px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "1em",
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "background 0.18s"
  },
  msg: {
    color: "#c62828",
    marginBottom: 12,
    fontWeight: "bold"
  },
  input: {
    padding: "6px",
    fontSize: "1em",
    borderRadius: 4,
    border: "1px solid #bbb"
  },
  select: {
    padding: "6px",
    fontSize: "1em",
    borderRadius: 4,
    border: "1px solid #bbb"
  }
};

function UserList() {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const [editUserId, setEditUserId] = useState(null);
  const [editData, setEditData] = useState({});
  const [sortAsc, setSortAsc] = useState(true);

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
      setMsg("");
    } catch (err) {
      setMsg(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Fehler beim Laden der User"
      );
      setUsers([]);
    }
  };

  const handleEdit = (user) => {
    setEditUserId(user.id);
    setEditData({ ...user });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/users/${id}`,
        {
          username: editData.username,
          email: editData.email,
          role: editData.role,
          active: editData.active
        },
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );
      setMsg("User aktualisiert.");
      setEditUserId(null);
      fetchUsers();
    } catch (err) {
      setMsg(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Fehler beim Aktualisieren"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Willst du diesen User wirklich löschen?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: {
          Authorization: "Bearer " + token
        }
      });
      setMsg("User gelöscht.");
      fetchUsers();
    } catch (err) {
      setMsg(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Fehler beim Löschen"
      );
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (a.username.toLowerCase() < b.username.toLowerCase()) return sortAsc ? -1 : 1;
    if (a.username.toLowerCase() > b.username.toLowerCase()) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div style={styles.container}>
      <h2>User-Liste</h2>
      {msg && <div style={styles.msg}>{msg}</div>}

      <div style={styles.toolbar}>
        <button
          style={styles.sortBtn}
          onClick={() => setSortAsc(!sortAsc)}
          title={sortAsc ? "Nach A-Z sortieren" : "Nach Z-A sortieren"}
        >
          {sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />} Sortierung
        </button>
      </div>

      <div style={styles.tableWrapper}>
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
            {sortedUsers.map(user =>
              editUserId === user.id ? (
                <tr key={user.id} style={styles.trHover}>
                  <td style={styles.td}>
                    <input
                      type="text"
                      name="username"
                      value={editData.username}
                      onChange={handleEditChange}
                      style={styles.input}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      style={styles.input}
                    />
                  </td>
                  <td style={styles.td}>
                    <select name="role" value={editData.role} onChange={handleEditChange} style={styles.select}>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <select name="active" value={editData.active} onChange={handleEditChange} style={styles.select}>
                      <option value={true}>aktiv</option>
                      <option value={false}>inaktiv</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.actionBtn} onClick={() => handleUpdate(user.id)}>
                      <FaSave /> Speichern
                    </button>
                    <button style={styles.actionBtn} onClick={() => setEditUserId(null)}>
                      <FaTimes /> Abbrechen
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={user.id}>
                  <td style={styles.td}>{user.username}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{user.role}</td>
                  <td style={styles.td}>{user.active ? "aktiv" : "inaktiv"}</td>
                  <td style={styles.td}>
                    <button style={styles.actionBtn} onClick={() => handleEdit(user)}>
                      <FaEdit /> Bearbeiten
                    </button>
                    <button style={styles.actionBtn} onClick={() => handleDelete(user.id)}>
                      <FaTrash /> Löschen
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserList;