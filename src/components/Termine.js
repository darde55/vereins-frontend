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
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

const API_URL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
  "https://vereins-backend-production.up.railway.app/api";

function isAdmin(userList, username) {
  const user = userList.find((u) => u.username === username);
  return user?.role === "admin";
}

function Termine({ token, username }) {
  // States
  const [termine, setTermine] = useState([]);
  const [userList, setUserList] = useState([]);
  const [err, setErr] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  // Admin: Termin anlegen
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

  // Lade Termine und Nutzerliste
  useEffect(() => {
    async function fetchData() {
      try {
        setErr("");
        const [termineRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/termine`, {
            headers: { Authorization: "Bearer " + token },
          }),
          axios.get(`${API_URL}/users`, {
            headers: { Authorization: "Bearer " + token },
          }),
        ]);
        setTermine(termineRes.data || []);
        setUserList(usersRes.data || []);
      } catch (e) {
        setErr("Fehler beim Laden der Daten");
      }
    }
    fetchData();
  }, [token]);

  // Sortiere User für Score-Ranking
  const scoreRanking = [...userList]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .map((u, i) => ({
      ...u,
      rank: i + 1,
    }));

  // Kalender Datum schön anzeigen
  function getSelectedDateLabel() {
    if (!selectedDate) return "Deine nächsten Termine";
    return `Termine am ${selectedDate.toLocaleDateString("de-DE")}`;
  }

  // Termine nach Datum filtern, falls ein Datum ausgewählt ist
  const angezeigteTermine = selectedDate
    ? termine.filter(
        (t) =>
          t.datum &&
          new Date(t.datum).toDateString() ===
            selectedDate.toDateString()
      )
    : termine;

  // ADMIN: TERMIN ANLEGEN
  async function handleCreateTermin(e) {
    e.preventDefault();
    setCreateErr("");
    setCreateSaving(true);
    try {
      await axios.post(`${API_URL}/termine`, createData, {
        headers: { Authorization: "Bearer " + token },
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
        headers: { Authorization: "Bearer " + token },
      });
      setTermine(res.data || []);
    } catch (e) {
      setCreateErr(e.response?.data?.error || "Fehler beim Anlegen");
    }
    setCreateSaving(false);
  }

  // Handler für Datumsauswahl
  function handleDateChange(e) {
    const val = e.target.value;
    if (!val) {
      setSelectedDate(null);
    } else {
      setSelectedDate(new Date(val));
    }
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", my: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Vereins-Termine
      </Typography>

      {err && <Alert severity="error">{err}</Alert>}

      {/* Datumsauswahl */}
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Datum filtern"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={selectedDate ? selectedDate.toISOString().slice(0, 10) : ""}
          onChange={handleDateChange}
          sx={{ mr: 2 }}
        />
        <Button
          onClick={() => setSelectedDate(null)}
          disabled={!selectedDate}
          variant="outlined"
        >
          Filter zurücksetzen
        </Button>
      </Box>

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
                    onChange={(e) =>
                      setCreateData((d) => ({ ...d, titel: e.target.value }))
                    }
                  />
                  <TextField
                    label="Datum"
                    type="date"
                    required
                    InputLabelProps={{ shrink: true }}
                    value={createData.datum}
                    onChange={(e) =>
                      setCreateData((d) => ({ ...d, datum: e.target.value }))
                    }
                  />
                  <TextField
                    label="Beginn"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    value={createData.beginn}
                    onChange={(e) =>
                      setCreateData((d) => ({ ...d, beginn: e.target.value }))
                    }
                  />
                  <TextField
                    label="Ende"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    value={createData.ende}
                    onChange={(e) =>
                      setCreateData((d) => ({ ...d, ende: e.target.value }))
                    }
                  />
                  <TextField
                    label="Beschreibung"
                    multiline
                    minRows={2}
                    value={createData.beschreibung}
                    onChange={(e) =>
                      setCreateData((d) => ({
                        ...d,
                        beschreibung: e.target.value,
                      }))
                    }
                  />
                  <TextField
                    label="Max. Teilnehmer"
                    type="number"
                    required
                    inputProps={{ min: 1 }}
                    value={createData.anzahl}
                    onChange={(e) =>
                      setCreateData((d) => ({
                        ...d,
                        anzahl: Number(e.target.value),
                      }))
                    }
                  />
                  <TextField
                    label="Score für Teilnahme"
                    type="number"
                    value={createData.score}
                    onChange={(e) =>
                      setCreateData((d) => ({
                        ...d,
                        score: Number(e.target.value),
                      }))
                    }
                  />
                  <TextField
                    label="Ansprechpartner Name"
                    value={createData.ansprechpartner_name}
                    onChange={(e) =>
                      setCreateData((d) => ({
                        ...d,
                        ansprechpartner_name: e.target.value,
                      }))
                    }
                  />
                  <TextField
                    label="Ansprechpartner E-Mail"
                    type="email"
                    value={createData.ansprechpartner_mail}
                    onChange={(e) =>
                      setCreateData((d) => ({
                        ...d,
                        ansprechpartner_mail: e.target.value,
                      }))
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

      <Typography variant="h6" sx={{ mb: 1 }}>
        {getSelectedDateLabel()}
      </Typography>

      {/* Terminliste */}
      <Paper>
        <List>
          {angezeigteTermine.length === 0 && (
            <ListItem>
              <ListItemText primary="Keine Termine gefunden." />
            </ListItem>
          )}
          {angezeigteTermine.map((t) => (
            <React.Fragment key={t.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={`${t.titel} (${new Date(t.datum).toLocaleDateString("de-DE")}${
                    t.beginn ? ", " + t.beginn : ""
                  }${t.ende ? " - " + t.ende : ""})`}
                  secondary={
                    <>
                      {t.beschreibung && (
                        <>
                          <span>{t.beschreibung}</span>
                          <br />
                        </>
                      )}
                      <span>
                        Max. Teilnehmer: <b>{t.anzahl}</b>
                        {t.score ? <> | Score: <b>{t.score}</b></> : null}
                      </span>
                      <br />
                      {t.ansprechpartner_name && (
                        <>
                          Ansprechpartner: {t.ansprechpartner_name}
                          {t.ansprechpartner_mail && (
                            <> ({t.ansprechpartner_mail})</>
                          )}
                          <br />
                        </>
                      )}
                      <span>
                        Teilnehmer:{" "}
                        {Array.isArray(t.teilnehmer) && t.teilnehmer.length > 0
                          ? t.teilnehmer.join(", ")
                          : "Keine"}
                      </span>
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Score-Ranking */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Rangliste (Score)</Typography>
        <List>
          {scoreRanking.map((u) => (
            <ListItem key={u.username}>
              <ListItemText
                primary={`${u.rank}. ${u.username}`}
                secondary={`Score: ${u.score || 0}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}

export default Termine;