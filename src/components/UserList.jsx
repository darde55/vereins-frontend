import React, { useEffect, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";

// API-URL zentral holen
const API_URL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
  "https://vereins-backend-production.up.railway.app/api";

function UserList({ token }) {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: "Bearer " + token }
      });
      setUsers(res.data);
      setMsg("");
    } catch (err) {
      setMsg("Fehler beim Laden der Benutzer");
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Wirklich löschen?")) return;
    try {
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: { Authorization: "Bearer " + token }
      });
      fetchUsers();
    } catch (err) {
      setMsg("Fehler beim Löschen");
    }
  };

  const handleLock = async (id, active) => {
    try {
      await axios.put(
        `${API_URL}/users/${id}`,
        { active: active ? 0 : 1 },
        {
          headers: { Authorization: "Bearer " + token }
        }
      );
      fetchUsers();
    } catch (err) {
      setMsg("Fehler beim Sperren/Entsperren");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(
        `${API_URL}/users/search?username=${encodeURIComponent(search)}`,
        {
          headers: { Authorization: "Bearer " + token }
        }
      );
      setUsers(res.data);
      setMsg("");
    } catch (err) {
      setMsg("Fehler bei Suche");
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "2rem auto" }}>
      <Paper elevation={4} sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Benutzerverwaltung
        </Typography>
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 2, display: "flex", gap: 2 }}>
          <TextField
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Suchen nach Username..."
            size="small"
            variant="outlined"
          />
          <Button type="submit" variant="contained" color="primary">
            Suchen
          </Button>
          <Button type="button" variant="outlined" onClick={fetchUsers}>
            Alle zeigen
          </Button>
        </Box>
        {msg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {msg}
          </Alert>
        )}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>E-Mail</TableCell>
                <TableCell>Rolle</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>
                    <Typography color={u.active ? "green" : "red"}>
                      {u.active ? "aktiv" : "gesperrt"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton color="primary" onClick={() => window.location.href = `/useredit/${u.id}`}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(u.id)}>
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        color={u.active ? "warning" : "success"}
                        onClick={() => handleLock(u.id, u.active)}
                        title={u.active ? "Sperren" : "Entsperren"}
                      >
                        {u.active ? <LockIcon /> : <LockOpenIcon />}
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
export default UserList;