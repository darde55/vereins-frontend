import React, { useState } from "react";
import axios from "axios";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

// API-URL zentral holen
const API_URL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
  "https://vereins-backend-production.up.railway.app/api";

/**
 * Admin legt einen neuen User an
 * Erwartet: gültiges JWT-Token im "token"-Prop (Admin-Rechte!)
 */
function NeuerUser({ token }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!username || !email || !password) {
      setMsg("Alle Felder sind Pflichtfelder.");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/users`, // Beispiel-Route für Admin-User-Anlage
        {
          username,
          email,
          password,
        },
        {
          headers: { Authorization: "Bearer " + token }
        }
      );
      setMsg("Benutzer erfolgreich angelegt!");
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setMsg(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Fehler beim Anlegen"
      );
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "70vh" }}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 450, width: "100%" }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Benutzer als Admin anlegen
        </Typography>
        <Box component="form" onSubmit={handleSubmit} autoComplete="off">
          <TextField
            label="Benutzername"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="E-Mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            type="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Passwort"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            type="password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Benutzer anlegen
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