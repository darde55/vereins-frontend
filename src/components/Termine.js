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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import StarIcon from "@mui/icons-material/Star";
import PeopleIcon from "@mui/icons-material/People";

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

function Termine({ token, username }) {
  const [termine, setTermine] = useState([]);
  const [userList, setUserList] = useState([]);
  const [myScore, setMyScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // User-Liste und Score laden (Admin sieht alle, User nur sich selbst)
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setErr("");
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
      setLoading(false);
    }
    fetchData();
  }, [token, username]);

  // Sortiere User nach Score absteigend
  const scoreRanking = [...userList]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .map((u, i) => ({
      ...u,
      rank: i + 1,
    }));

  // Kommende Termine (ab heute)
  const today = new Date();
  const upcoming = [...termine]
    .filter((t) => new Date(t.datum) >= today)
    .sort((a, b) => new Date(a.datum) - new Date(b.datum));

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", my: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Termine & Rangliste
      </Typography>
      {err && <Alert severity="error">{err}</Alert>}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <StarIcon color="warning" />
          <Typography variant="h6" sx={{ mr: 2 }}>
            Dein aktueller Score:{" "}
            <b>{myScore !== null ? myScore : "-"}</b>
          </Typography>
        </Stack>
      </Paper>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Score-Rangliste
        </Typography>
        <Table>
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

      <Typography variant="h6" sx={{ mb: 1 }}>
        Deine nächsten Termine
      </Typography>
      {upcoming.length === 0 && (
        <Alert severity="info">Keine kommenden Termine.</Alert>
      )}
      <Stack spacing={2}>
        {upcoming.map((t) => (
          <Accordion key={t.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
                <CalendarTodayIcon fontSize="small" />
                <Typography sx={{ minWidth: 100 }}>
                  {formatDateEU(t.datum)}
                </Typography>
                <Typography sx={{ flex: 1 }}>{t.titel}</Typography>
                <Chip
                  icon={<PeopleIcon />}
                  label={`${t.teilnehmer?.length || 0} / ${t.anzahl}`}
                  color={
                    (t.teilnehmer?.length || 0) >= t.anzahl
                      ? "error"
                      : "success"
                  }
                  size="small"
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
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
                <Stack direction="row" spacing={1}>
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
                      />
                    ))
                  ) : (
                    <Typography sx={{ ml: 1 }}>Noch keine</Typography>
                  )}
                </Stack>
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
  );
}

export default Termine;