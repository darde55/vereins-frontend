import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Paper,
  Box,
  Chip,
  Stack,
  Avatar,
  Alert,
  Button,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import StarIcon from "@mui/icons-material/Star";
import PeopleIcon from "@mui/icons-material/People";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import SportsIcon from "@mui/icons-material/Sports";
import DeleteIcon from "@mui/icons-material/Delete";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
  "https://vereins-backend-production.up.railway.app/api";

function formatDateEU(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("de-DE");
}

function formatTimeStr(str) {
  return str || "-";
}

function getTerminIcon(titel) {
  if (titel?.toLowerCase().includes("schiedsrichter"))
    return <SportsIcon titleAccess="Schiedsrichter" sx={{ color: "#666" }} />;
  if (titel?.toLowerCase().includes("griller"))
    return <WhatshotIcon titleAccess="Griller" sx={{ color: "#d84315" }} />;
  if (titel?.toLowerCase().includes("pflege"))
    return <CleaningServicesIcon titleAccess="Pflege" sx={{ color: "#43a047" }} />;
  return <CalendarTodayIcon sx={{ color: "#333" }} />;
}

function isAdmin(userList, username) {
  const user = userList.find((u) => u.username === username);
  return user?.role === "admin";
}

function Termine({ token, username }) {
  const [termine, setTermine] = useState([]);
  const [userList, setUserList] = useState([]);
  const [myScore, setMyScore] = useState(null);
  const [err, setErr] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [anzahlEditing, setAnzahlEditing] = useState({});
  const [anzahlEditValue, setAnzahlEditValue] = useState({});

  // Daten holen
  useEffect(() => {
    async function fetchData() {
      try {
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
        const myUser = usersRes.data.find((u) => u.username === username);
        setMyScore(myUser?.score || 0);
      } catch (e) {
        setErr(e.response?.data?.error || "Fehler beim Laden");
      }
    }
    fetchData();
  }, [token, username]);

  // Score-Rangliste absteigend sortieren
  const scoreRanking = [...userList]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .map((u, i) => ({
      ...u,
      rank: i + 1,
    }));

  // Kommende Termine (ab heute)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let termineFiltered = [...termine]
    .filter((t) => {
      const date = new Date(t.datum);
      date.setHours(0, 0, 0, 0);
      return date >= today;
    })
    .sort((a, b) => new Date(a.datum) - new Date(b.datum));

  // Wenn ein Datum im Kalender ausgewählt wurde, nur Termine an diesem Tag zeigen
  if (selectedDate) {
    const selectedStr = selectedDate.toISOString().slice(0, 10);
    termineFiltered = termineFiltered.filter(
      (t) => t.datum === selectedStr
    );
  }

  // Für Kalender: Liste aller Tage mit Termin (für Markierung)
  const termineDates = termine
    .map((t) => {
      const d = new Date(t.datum);
      d.setHours(0, 0, 0, 0);
      return d;
    });

  // Markiert Tage mit Termin im Kalender (CSS-Klasse)
  function highlightWithRanges(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return termineDates.some(
      (td) => td.getTime() === d.getTime()
    )
      ? "has-termin"
      : undefined;
  }

  function getSelectedDateLabel() {
    if (!selectedDate) return "Deine nächsten Termine";
    return `Termine am ${selectedDate.toLocaleDateString("de-DE")}`;
  }

  // ADMIN: Teilnehmer hinzufügen
  async function addTeilnehmer(terminId, userToAdd) {
    if (!userToAdd) return;
    setSaving(true);
    try {
      await axios.post(`${API_URL}/termine/${terminId}/teilnehmer`, { username: userToAdd }, {
        headers: { Authorization: "Bearer " + token }
      });
      // Nach dem Hinzufügen neu laden
      const res = await axios.get(`${API_URL}/termine`, { headers: { Authorization: "Bearer " + token } });
      setTermine(res.data || []);
    } finally {
      setSaving(false);
    }
  }

  // ADMIN: Teilnehmer entfernen
  async function removeTeilnehmer(terminId, userToRemove) {
    setSaving(true);
    try {
      await axios.delete(`${API_URL}/termine/${terminId}/teilnehmer/${userToRemove}`, {
        headers: { Authorization: "Bearer " + token }
      });
      // Nach dem Entfernen neu laden
      const res = await axios.get(`${API_URL}/termine`, { headers: { Authorization: "Bearer " + token } });
      setTermine(res.data || []);
    } finally {
      setSaving(false);
    }
  }

  // ADMIN: Anzahl bearbeiten
  function startEditAnzahl(terminId, currentVal) {
    setAnzahlEditing((ae) => ({ ...ae, [terminId]: true }));
    setAnzahlEditValue((av) => ({ ...av, [terminId]: currentVal }));
  }
  function cancelEditAnzahl(terminId) {
    setAnzahlEditing((ae) => ({ ...ae, [terminId]: false }));
    setAnzahlEditValue((av) => {
      const newAV = { ...av };
      delete newAV[terminId];
      return newAV;
    });
  }
  async function saveEditAnzahl(terminId) {
    setSaving(true);
    try {
      const newVal = Number(anzahlEditValue[terminId]);
      await axios.patch(`${API_URL}/termine/${terminId}`, { anzahl: newVal }, {
        headers: { Authorization: "Bearer " + token }
      });
      // Reload
      const res = await axios.get(`${API_URL}/termine`, { headers: { Authorization: "Bearer " + token } });
      setTermine(res.data || []);
    } finally {
      setSaving(false);
      cancelEditAnzahl(terminId);
    }
  }

  return (
    <Box sx={{
      maxWidth: 1200,
      mx: "auto",
      my: 3,
      px: { xs: 1, sm: 3 },
      display: 'flex',
      flexDirection: { xs: "column", md: "row" },
      gap: 4
    }}>
      {/* Linke Spalte: Kalender & Score */}
      <Box sx={{
        flex: "0 0 410px",
        minWidth: 350,
        maxWidth: 480,
        background: "#f8f9fa",
        p: 3,
        borderRadius: 4,
        boxShadow: 2,
        mb: { xs: 3, md: 0 },
        alignSelf: "flex-start"
      }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 500, color: "#2870ae" }}>
          <CalendarTodayIcon sx={{ mr: 1, mb: "-4px" }} />
          Termin-Kalender
        </Typography>
        <Box sx={{ mb: 1, mx: "auto", width: "100%" }}>
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            highlightDates={[
              {
                'react-datepicker__day--highlighted-custom-1': termineDates
              }
            ]}
            dayClassName={highlightWithRanges}
            inline
            calendarStartDay={1}
            locale="de"
            // Kalender größer machen
            calendarContainer={({ children }) => (
              <div style={{ fontSize: "1.28rem", width: 380 }}>{children}</div>
            )}
          />
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setSelectedDate(null)}
          sx={{ mt: 1 }}
          fullWidth
        >
          Alle kommenden Termine anzeigen
        </Button>

        <Paper sx={{ p: 2, mt: 4, background: "#fff7e6" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <StarIcon color="warning" />
            <Typography variant="h6" sx={{ mr: 2 }}>
              Dein aktueller Score: <b>{myScore !== null ? myScore : "-"}</b>
            </Typography>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2, mt: 3, background: "#e6f2ff" }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Score-Rangliste
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Platz</TableCell>
                <TableCell>Benutzer</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Rolle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scoreRanking.map((u) => (
                <TableRow
                  key={u.username}
                  selected={u.username === username}
                  sx={
                    u.username === username
                      ? { backgroundColor: "#fffde7" }
                      : {}
                  }
                >
                  <TableCell>{u.rank}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 24, height: 24 }}>
                        {u.username[0]?.toUpperCase()}
                      </Avatar>
                      {u.username}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <b>{u.score || 0}</b>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={u.role}
                      color={u.role === "admin" ? "info" : "default"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {/* Rechte Spalte: Terminliste */}
      <Box sx={{ flex: 1, minWidth: 320 }}>
        <Typography variant="h4" sx={{ mb: 2, color: "#2870ae", fontWeight: 600 }}>
          {getSelectedDateLabel()}
        </Typography>
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        {termineFiltered.length === 0 && (
          <Alert severity="info">Keine (weiteren) Termine gefunden.</Alert>
        )}
        <Stack spacing={3}>
          {termineFiltered.map((t) => (
            <Accordion key={t.id} sx={{ borderRadius: 3, boxShadow: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
                  {getTerminIcon(t.titel)}
                  <Typography sx={{ minWidth: 110, fontWeight: 500 }}>
                    {formatDateEU(t.datum)}
                  </Typography>
                  <Typography sx={{ flex: 1, fontWeight: 500 }}>{t.titel}</Typography>
                  <Chip
                    icon={<PeopleIcon />}
                    label={`${t.teilnehmer?.length || 0} / ${
                      anzahlEditing[t.id]
                        ? anzahlEditValue[t.id]
                        : t.anzahl
                    }`}
                    color={
                      (t.teilnehmer?.length || 0) >= t.anzahl
                        ? "error"
                        : "success"
                    }
                    size="small"
                  />
                  {/* Admin: Anzahl bearbeiten */}
                  {isAdmin(userList, username) && (
                    anzahlEditing[t.id] ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          size="small"
                          type="number"
                          value={anzahlEditValue[t.id]}
                          onChange={e => setAnzahlEditValue(av => ({ ...av, [t.id]: e.target.value }))}
                          sx={{ width: 70 }}
                          inputProps={{ min: 1 }}
                          disabled={saving}
                        />
                        <Button
                          size="small"
                          color="success"
                          variant="contained"
                          onClick={() => saveEditAnzahl(t.id)}
                          disabled={saving}
                        >
                          Speichern
                        </Button>
                        <Button
                          size="small"
                          color="inherit"
                          variant="outlined"
                          onClick={() => cancelEditAnzahl(t.id)}
                          disabled={saving}
                        >
                          Abbrechen
                        </Button>
                      </Stack>
                    ) : (
                      <Button
                        size="small"
                        color="secondary"
                        onClick={() => startEditAnzahl(t.id, t.anzahl)}
                        disabled={saving}
                      >
                        Anzahl bearbeiten
                      </Button>
                    )
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ background: "#f6fafd", borderRadius: 2, pt: 2 }}>
                <Box sx={{ mb: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <AccessTimeIcon fontSize="small" />
                    <Typography>
                      <b>Beginn:</b> {formatTimeStr(t.beginn)}
                    </Typography>
                    <Typography>
                      <b>Ende:</b> {formatTimeStr(t.ende)}
                    </Typography>
                  </Stack>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography>
                    <b>Beschreibung:</b> {t.beschreibung || "-"}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PersonIcon fontSize="small" />
                    <Typography>
                      <b>Ansprechpartner:</b> {t.ansprechpartner_name || "-"}
                    </Typography>
                    <Typography>
                      <b>E-Mail:</b> {t.ansprechpartner_mail || "-"}
                    </Typography>
                  </Stack>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography sx={{ mb: 1 }}>
                    <b>Eingeschriebene Nutzer:</b>
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    {(t.teilnehmer && t.teilnehmer.length > 0) ? (
                      t.teilnehmer.map((name) => (
                        <Chip
                          key={name}
                          avatar={
                            <Avatar sx={{ width: 24, height: 24 }}>
                              {name[0]?.toUpperCase()}
                            </Avatar>
                          }
                          label={name}
                          color={name === username ? "primary" : "default"}
                          size="small"
                          onDelete={
                            isAdmin(userList, username)
                              ? () => removeTeilnehmer(t.id, name)
                              : undefined
                          }
                          deleteIcon={isAdmin(userList, username) ? <DeleteIcon /> : undefined}
                          disabled={saving}
                          sx={{ mb: 1 }}
                        />
                      ))
                    ) : (
                      <Typography sx={{ ml: 1 }}>Noch keine</Typography>
                    )}
                  </Stack>
                  {/* Admin: Nutzer hinzufügen */}
                  {isAdmin(userList, username) && (
                    <Box sx={{ mt: 1 }}>
                      <Select
                        displayEmpty
                        value=""
                        onChange={e => addTeilnehmer(t.id, e.target.value)}
                        size="small"
                        sx={{ minWidth: 180, mr: 2 }}
                        disabled={saving}
                      >
                        <MenuItem value="">Nutzer hinzufügen...</MenuItem>
                        {userList
                          .filter(u => !t.teilnehmer?.includes(u.username))
                          .map(u => (
                            <MenuItem key={u.username} value={u.username}>
                              {u.username}
                            </MenuItem>
                          ))}
                      </Select>
                    </Box>
                  )}
                </Box>
                <Box>
                  <Typography>
                    <b>Score für Teilnahme:</b> {t.score || 0}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Box>
      <style>
        {`
        .has-termin {
          border-radius: 50%;
          background: #ffc107 !important;
          color: #222 !important;
        }
        `}
      </style>
    </Box>
  );
}

export default Termine;