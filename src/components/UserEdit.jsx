import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import LockResetIcon from "@mui/icons-material/LockReset";

function UserEdit({ token, isAdmin }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [active, setActive] = useState(1);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:3001/users/${id}`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => {
        setUser(res.data);
        setEmail(res.data.email || "");
        setRole(res.data.role);
        setActive(res.data.active);
      })
      .catch(() => setMsg("Fehler beim Laden"));
  }, [id, token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await axios.put(
        `http://localhost:3001/users/${id}`,
        {
          email,
          ...(isAdmin ? { role, active } : {}),
          ...(password ? { password } : {}),
        },
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      setMsg("Gespeichert!");
      setPassword("");
      setTimeout(() => navigate("/users"), 1000);
    } catch (err) {
      setMsg("Fehler beim Speichern");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "70vh" }}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          User bearbeiten
        </Typography>
        <Box component="form" onSubmit={handleSave} autoComplete="off">
          <TextField
            label="Benutzername"
            value={user.username || ""}
            fullWidth
            margin="normal"
            disabled
          />
          <TextField
            label="E-Mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
          />
          {isAdmin && (
            <>
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
              <FormControlLabel
                control={
                  <Switch
                    checked={!!active}
                    onChange={e => setActive(e.target.checked ? 1 : 0)}
                    color="primary"
                  />
                }
                label="Aktiv"
                sx={{ mb: 2 }}
              />
            </>
          )}
          <TextField
            label="Neues Passwort (optional)"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: <LockResetIcon sx={{ mr: 1 }} />,
            }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Speichern
          </Button>
          {msg && (
            <Alert severity={msg === "Gespeichert!" ? "success" : "error"} sx={{ mt: 2 }}>
              {msg}
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default UserEdit;