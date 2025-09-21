import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import de from "date-fns/locale/de";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";

const API_URL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
  "https://vereins-backend-production.up.railway.app/api";

const locales = { "de": de };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

function Termine({ token, username, role }) {
  const [termine, setTermine] = useState([]);
  const [msg, setMsg] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ titel: "", datum: "", beschreibung: "", anzahl: 1 });

  useEffect(() => { fetchTermine(); }, []);

  const fetchTermine = async () => {
    try {
      const res = await axios.get(`${API_URL}/termine`);
      // Fallback: termine immer als Array setzen!
      setTermine(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setMsg("Fehler beim Laden der Termine");
      setTermine([]); // Auch bei Fehler: leeres Array!
    }
  };

  // Einschreiben
  const handleEinschreiben = async (id) => {
    try {
      await axios.post(
        `${API_URL}/termine/${id}/einschreiben`,
        {},
        { headers: { Authorization: "Bearer " + token } }
      );
      setMsg("Erfolgreich eingeschrieben!");
      fetchTermine();
    } catch (err) {
      setMsg(err.response?.data?.error || "Fehler beim Einschreiben");
    }
  };

  // Löschen (Admin)
  const handleDelete = async (id) => {
    if (!window.confirm("Diesen Termin wirklich löschen?")) return;
    try {
      await axios.delete(`${API_URL}/termine/${id}`, {
        headers: { Authorization: "Bearer " + token },
      });
      setMsg("Termin gelöscht.");
      fetchTermine();
    } catch (err) {
      setMsg(err.response?.data?.error || "Fehler beim Löschen");
    }
  };

  // Bearbeiten (Admin)
  const handleEditSave = async (id) => {
    try {
      await axios.put(
        `${API_URL}/termine/${id}`,
        { ...editData },
        { headers: { Authorization: "Bearer " + token } }
      );
      setMsg("Termin aktualisiert.");
      setEditId(null);
      fetchTermine();
    } catch (err) {
      setMsg(err.response?.data?.error || "Fehler beim Bearbeiten");
    }
  };

  // Kalender-Events für react-big-calendar
  const events = useMemo(
    () =>
      (Array.isArray(termine) ? termine : []).map((t) => ({
        id: t.id,
        title: t.titel,
        start: new Date(t.datum),
        end: new Date(t.datum),
        allDay: true,
        resource: t,
      })),
    [termine]
  );

  return (
    <Box sx={{ maxWidth: 1200, margin: "2rem auto" }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Termine Übersicht</Typography>
      <Paper sx={{ mb: 4, p: 2, background: "#f9f9f9", borderRadius: 2 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 350 }}
          messages={{
            next: "Nächster",
            previous: "Vorheriger",
            today: "Heute",
            month: "Monat",
            week: "Woche",
            day: "Tag",
            agenda: "Liste",
            date: "Datum",
            time: "Uhrzeit",
            event: "Termin",
            showMore: total => `+${total} mehr`
          }}
          popup
          views={["month", "agenda"]}
        />
      </Paper>

      <Typography variant="h5" sx={{ mb: 2 }}>Alle Termine (Tabelle)</Typography>
      {msg && (
        <Alert severity={msg.toLowerCase().includes("erfolg") || msg.includes("aktualisiert") || msg.includes("gelöscht") ? "success" : "error"} sx={{ mb: 2 }}>
          {msg}
        </Alert>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titel</TableCell>
              <TableCell>Datum</TableCell>
              <TableCell>Beschreibung</TableCell>
              <TableCell>Benötigt</TableCell>
              <TableCell>Angemeldet</TableCell>
              <TableCell>Aktion</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(Array.isArray(termine) ? termine : []).map((t) => {
              const istAngemeldet = t.teilnehmer?.includes(username);
              const voll = (t.teilnehmer?.length || 0) >= t.anzahl;
              const isEditing = editId === t.id;
              return (
                <TableRow key={t.id}>
                  {isEditing ? (
                    <>
                      <TableCell>
                        <TextField
                          value={editData.titel}
                          onChange={e => setEditData(d => ({ ...d, titel: e.target.value }))}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="date"
                          value={editData.datum}
                          onChange={e => setEditData(d => ({ ...d, datum: e.target.value }))}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={editData.beschreibung}
                          onChange={e => setEditData(d => ({ ...d, beschreibung: e.target.value }))}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={editData.anzahl}
                          onChange={e => setEditData(d => ({ ...d, anzahl: Number(e.target.value) }))}
                          fullWidth
                          inputProps={{ min: 1 }}
                        />
                      </TableCell>
                      <TableCell>{t.teilnehmer?.length || 0}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleEditSave(t.id)}
                          sx={{ mr: 1 }}
                        >
                          Speichern
                        </Button>
                        <Button
                          variant="outlined"
                          color="inherit"
                          size="small"
                          onClick={() => setEditId(null)}
                        >
                          Abbrechen
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{t.titel}</TableCell>
                      <TableCell>{new Date(t.datum).toLocaleDateString('de-DE')}</TableCell>
                      <TableCell>{t.beschreibung}</TableCell>
                      <TableCell align="center">{t.anzahl}</TableCell>
                      <TableCell align="center">{t.teilnehmer?.length || 0}</TableCell>
                      <TableCell>
                        {role === "admin" ? (
                          <>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={() => {
                                setEditId(t.id);
                                setEditData({
                                  titel: t.titel,
                                  datum: t.datum.slice(0, 10),
                                  beschreibung: t.beschreibung || "",
                                  anzahl: t.anzahl || 1,
                                });
                              }}
                              sx={{ mr: 1 }}
                            >
                              Bearbeiten
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleDelete(t.id)}
                            >
                              Löschen
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            disabled={istAngemeldet || voll}
                            onClick={() => handleEinschreiben(t.id)}
                          >
                            {istAngemeldet
                              ? "Bereits eingeschrieben"
                              : voll
                              ? "Voll"
                              : "Einschreiben"}
                          </Button>
                        )}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Termine;