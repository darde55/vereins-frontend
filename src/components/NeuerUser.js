import React, { useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

function NeuerUser({ token }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await axios.post(
        "http://localhost:3001/users",
        { username, password, role, email },
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      setMsg("User erfolgreich angelegt!");
      setUsername("");
      setPassword("");
      setRole("user");
      setEmail("");
    } catch (err) {
      setMsg(err.response?.data?.error || "Fehler beim Anlegen");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "70vh" }}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <PersonAddIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h5">Neuen Benutzer anlegen</Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit} autoComplete="off">
          <TextField
            label="Benutzername"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Passwort"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="E-Mail"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            select
            label="Rolle"
            value={role}
            onChange={e => setRole(e.target.value)}
            fullWidth
            margin="normal"
          >
            <MenuItem value="user">user</MenuItem>
            <MenuItem value="admin">admin</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Anlegen
          </Button>
          {msg && (
            <Alert severity={msg.includes("erfolgreich") ? "success" : "error"} sx={{ mt: 2 }}>
              {msg}
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default NeuerUser;