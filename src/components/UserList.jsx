import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaSave, FaTimes, FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import "./UserList.css"; // Erstelle passende CSS-Datei

const API_URL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
  "https://vereins-backend-production.up.railway.app/api";

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
        err.response?.data?.error ||
        err.response?.data?.message ||
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
        err.response?.data?.error ||
        err.response?.data?.message ||
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
        err.response?.data?.error ||
        err.response?.data?.message ||
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
    <div className="userlist-container">
      <h2>User-Liste</h2>
      {msg && <div className="userlist-msg">{msg}</div>}

      <div className="userlist-toolbar">
        <button
          className="userlist-sort-btn"
          onClick={() => setSortAsc(!sortAsc)}
          title={sortAsc ? "Nach A-Z sortieren" : "Nach Z-A sortieren"}
        >
          {sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />} Sortierung
        </button>
      </div>

      <div className="userlist-table-wrapper">
        <table className="userlist-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>E-Mail</th>
              <th>Rolle</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map(user =>
              editUserId === user.id ? (
                <tr key={user.id}>
                  <td>
                    <input
                      type="text"
                      name="username"
                      value={editData.username}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <select name="role" value={editData.role} onChange={handleEditChange}>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <select name="active" value={editData.active} onChange={handleEditChange}>
                      <option value={true}>aktiv</option>
                      <option value={false}>inaktiv</option>
                    </select>
                  </td>
                  <td>
                    <button className="userlist-action-btn" onClick={() => handleUpdate(user.id)}>
                      <FaSave /> Speichern
                    </button>
                    <button className="userlist-action-btn" onClick={() => setEditUserId(null)}>
                      <FaTimes /> Abbrechen
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.active ? "aktiv" : "inaktiv"}</td>
                  <td>
                    <button className="userlist-action-btn" onClick={() => handleEdit(user)}>
                      <FaEdit /> Bearbeiten
                    </button>
                    <button className="userlist-action-btn" onClick={() => handleDelete(user.id)}>
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