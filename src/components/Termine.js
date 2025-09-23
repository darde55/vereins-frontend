// ... (dein bisheriger Import bleibt gleich)
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Paper,
  Alert,
  // ... weitere MUI-Imports wie gehabt
} from "@mui/material";
// ... weitere Importe wie gehabt

const API_URL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
  "https://vereins-backend-production.up.railway.app/api";

function isAdmin(userList, username) {
  const user = userList.find((u) => u.username === username);
  return user?.role === "admin";
}

function Termine({ token, username }) {
  // ... (dein bisheriger State & useEffect bleibt gleich)
  const [termine, setTermine] = useState([]);
  const [userList, setUserList] = useState([]);
  const [err, setErr] = useState("");
  // Admin: Anlegen-Formular
  const [showCreate, setShowCreate] = useState(false);
  const [createData, setCreateData] = useState({
    titel: "",
    datum: "",
    beginn: "",
    ende: "",
    beschreibung: "",
    anzahl: 1,
    score: 0,
    ansprechpartner_name: "",
    ansprechpartner_mail: "",
  });
  const [createErr, setCreateErr] = useState("");
  const [createSaving, setCreateSaving] = useState(false);

  // ... dein useEffect zum Laden der Daten bleibt gleich

  // Rangliste: Score absteigend sortieren!
  const scoreRanking = [...userList]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .map((u, i) => ({
      ...u,
      rank: i + 1,
    }));

  // Kalender Datum schön anzeigen:
  function getSelectedDateLabel() {
    if (!selectedDate) return "Deine nächsten Termine";
    return `Termine am ${selectedDate.toLocaleDateString("de-DE")}`;
  }

  // ADMIN: TERMIN ANLEGEN
  async function handleCreateTermin(e) {
    e.preventDefault();
    setCreateErr("");
    setCreateSaving(true);
    try {
      await axios.post(`${API_URL}/termine`, createData, {
        headers: { Authorization: "Bearer " + token }
      });
      setShowCreate(false);
      setCreateData({
        titel: "",
        datum: "",
        beginn: "",
        ende: "",
        beschreibung: "",
        anzahl: 1,
        score: 0,
        ansprechpartner_name: "",
        ansprechpartner_mail: "",
      });
      // Nach Anlegen neu laden
      const res = await axios.get(`${API_URL}/termine`, {
        headers: { Authorization: "Bearer " + token }
      });
      setTermine(res.data || []);
    } catch (e) {
      setCreateErr(e.response?.data?.error || "Fehler beim Anlegen");
    }
    setCreateSaving(false);
  }

  // ... (Rest deiner Komponente, z.B. Terminliste, bleibt gleich)

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", my: 2 }}>
      {/* Admin: Termin anlegen */}
      {isAdmin(userList, username) && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant={showCreate ? "outlined" : "contained"}
            color="primary"
            onClick={() => setShowCreate((s) => !s)}
            sx={{ mb: 1 }}
          >
            {showCreate ? "Abbrechen" : "Neuen Termin anlegen"}
          </Button>
          {showCreate && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Termin anlegen
              </Typography>
              <form onSubmit={handleCreateTermin}>
                <Stack spacing={2}>
                  <TextField
                    label="Titel"
                    required
                    value={createData.titel}
                    onChange={e =>
                      setCreateData(d => ({ ...d, titel: e.target.value }))
                    }
                  />
                  <TextField
                    label="Datum"
                    type="date"
                    required
                    InputLabelProps={{ shrink: true }}
                    value={createData.datum}
                    onChange={e =>
                      setCreateData(d => ({ ...d, datum: e.target.value }))
                    }
                  />
                  <TextField
                    label="Beginn"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    value={createData.beginn}
                    onChange={e =>
                      setCreateData(d => ({ ...d, beginn: e.target.value }))
                    }
                  />
                  <TextField
                    label="Ende"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    value={createData.ende}
                    onChange={e =>
                      setCreateData(d => ({ ...d, ende: e.target.value }))
                    }
                  />
                  <TextField
                    label="Beschreibung"
                    multiline
                    minRows={2}
                    value={createData.beschreibung}
                    onChange={e =>
                      setCreateData(d => ({ ...d, beschreibung: e.target.value }))
                    }
                  />
                  <TextField
                    label="Max. Teilnehmer"
                    type="number"
                    required
                    inputProps={{ min: 1 }}
                    value={createData.anzahl}
                    onChange={e =>
                      setCreateData(d => ({ ...d, anzahl: Number(e.target.value) }))
                    }
                  />
                  <TextField
                    label="Score für Teilnahme"
                    type="number"
                    value={createData.score}
                    onChange={e =>
                      setCreateData(d => ({ ...d, score: Number(e.target.value) }))
                    }
                  />
                  <TextField
                    label="Ansprechpartner Name"
                    value={createData.ansprechpartner_name}
                    onChange={e =>
                      setCreateData(d => ({ ...d, ansprechpartner_name: e.target.value }))
                    }
                  />
                  <TextField
                    label="Ansprechpartner E-Mail"
                    type="email"
                    value={createData.ansprechpartner_mail}
                    onChange={e =>
                      setCreateData(d => ({ ...d, ansprechpartner_mail: e.target.value }))
                    }
                  />
                  {createErr && <Alert severity="error">{createErr}</Alert>}
                  <Button
                    type="submit"
                    variant="contained"
                    color="success"
                    disabled={createSaving}
                  >
                    Termin speichern
                  </Button>
                </Stack>
              </form>
            </Paper>
          )}
        </Box>
      )}

      {/* ... (deine Terminliste, Score etc. wie gehabt) */}
      <Typography variant="h6" sx={{ mb: 1 }}>
        {getSelectedDateLabel()}
      </Typography>
      {/* ... (Rest bleibt gleich) */}
    </Box>
  );
}

export default Termine;