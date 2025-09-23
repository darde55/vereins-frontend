import React, { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import MailOutlineIcon from "@mui/icons-material/Mail";
import StarIcon from "@mui/icons-material/Star";
import MenuItem from "@mui/material/MenuItem";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

// API-URL zentral holen
const API_URL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
  "https://vereins-backend-production.up.railway.app/api";

function formatDateEU(date) {
  if (!date) return "";
  return date.toLocaleDateString("de-DE");
}

function parseDateEU(str) {
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(str)) return null;
  const [day, month, year] = str.split(".");
  return new Date(`${year}-${month}-${day}T00:00:00`);
}

// Zeitformatierung (z.B. "14:30")
function formatTime(date) {
  if (!date) return "";
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

// "14:30" zu Date-Objekt
function parseTime(str) {
  if (!/^\d{2}:\d{2}$/.test(str)) return null;
  const [hours, minutes] = str.split(":").map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

const beschreibungOptionen = [
  { value: "", label: "Eigener Eintrag" },
  { value: "Schiedsrichter", label: "Schiedsrichter" },
  { value: "Griller", label: "Griller" },
  { value: "Pflege", label: "Pflege" },
];

function NeuerTermin({ token }) {
  const [titel, setTitel] = useState("");
  const [datum, setDatum] = useState(null);
  const [beginn, setBeginn] = useState(null);
  const [ende, setEnde] = useState(null);
  const [inputBeginn, setInputBeginn] = useState("");
  const [inputEnde, setInputEnde] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [beschreibungDropdown, setBeschreibungDropdown] = useState("");
  const [anzahl, setAnzahl] = useState(1);
  const [stichtag, setStichtag] = useState(null);
  const [inputDate, setInputDate] = useState("");
  const [inputStichtag, setInputStichtag] = useState("");
  const [ansprechpartnerName, setAnsprechpartnerName] = useState("");
  const [ansprechpartnerMail, setAnsprechpartnerMail] = useState("");
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState("");

  // Wenn Dropdown gewählt wird, setze Beschreibung entsprechend
  const handleBeschreibungDropdown = (e) => {
    setBeschreibungDropdown(e.target.value);
    setBeschreibung(e.target.value);
  };

  const handleBeschreibungInput = (e) => {
    setBeschreibung(e.target.value);
    setBeschreibungDropdown("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!datum) {
      setMsg("Bitte gültiges Datum wählen oder eingeben (TT.MM.JJJJ).");
      return;
    }
    if ((inputBeginn && !beginn) || (inputEnde && !ende)) {
      setMsg("Bitte gültige Uhrzeit für Beginn und Ende angeben (z.B. 14:00).");
      return;
    }
    if (ansprechpartnerMail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ansprechpartnerMail)) {
      setMsg("Bitte gültige E-Mail für Ansprechpartner eingeben.");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/termine`,
        {
          titel,
          datum: datum.toISOString().slice(0, 10),
          beginn: beginn ? formatTime(beginn) : null,
          ende: ende ? formatTime(ende) : null,
          beschreibung,
          anzahl,
          stichtag: stichtag ? stichtag.toISOString().slice(0, 10) : null,
          ansprechpartner_name: ansprechpartnerName,
          ansprechpartner_mail: ansprechpartnerMail,
          score: score ? Number(score) : 0,
        },
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      setMsg("Termin erfolgreich angelegt!");
      setTitel("");
      setDatum(null);
      setBeginn(null);
      setEnde(null);
      setInputBeginn("");
      setInputEnde("");
      setBeschreibung("");
      setBeschreibungDropdown("");
      setAnzahl(1);
      setStichtag(null);
      setInputDate("");
      setInputStichtag("");
      setAnsprechpartnerName("");
      setAnsprechpartnerMail("");
      setScore(0);
    } catch (err) {
      setMsg(err.response?.data?.error || "Fehler beim Anlegen");
    }
  };

  const handleDateChange = (date) => {
    setDatum(date);
    setInputDate(formatDateEU(date));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputDate(value);
    const parsed = parseDateEU(value);
    setDatum(parsed);
  };

  const handleStichtagChange = (date) => {
    setStichtag(date);
    setInputStichtag(formatDateEU(date));
  };

  const handleInputStichtagChange = (e) => {
    const value = e.target.value;
    setInputStichtag(value);
    const parsed = parseDateEU(value);
    setStichtag(parsed);
  };

  // Beginn/Ende: DatePicker + manuelle Eingabe
  const handleBeginnChange = (date) => {
    setBeginn(date);
    setInputBeginn(formatTime(date));
  };
  const handleInputBeginnChange = (e) => {
    setInputBeginn(e.target.value);
    setBeginn(parseTime(e.target.value));
  };
  const handleEndeChange = (date) => {
    setEnde(date);
    setInputEnde(formatTime(date));
  };
  const handleInputEndeChange = (e) => {
    setInputEnde(e.target.value);
    setEnde(parseTime(e.target.value));
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "70vh" }}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 500, width: "100%" }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Neuen Termin anlegen
        </Typography>
        <Box component="form" onSubmit={handleSubmit} autoComplete="off">
          <TextField
            label="Titel"
            value={titel}
            onChange={e => setTitel(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Box sx={{ mb: 2 }}>
            <DatePicker
              selected={datum}
              onChange={handleDateChange}
              dateFormat="dd.MM.yyyy"
              customInput={
                <TextField
                  label="Datum"
                  value={inputDate}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              }
              isClearable
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              required
            />
          </Box>
          <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
            <DatePicker
              selected={beginn}
              onChange={handleBeginnChange}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Beginn"
              dateFormat="HH:mm"
              customInput={
                <TextField
                  label="Beginn"
                  value={inputBeginn}
                  onChange={handleInputBeginnChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              }
              isClearable
            />
            <DatePicker
              selected={ende}
              onChange={handleEndeChange}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Ende"
              dateFormat="HH:mm"
              customInput={
                <TextField
                  label="Ende"
                  value={inputEnde}
                  onChange={handleInputEndeChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              }
              isClearable
            />
          </Box>
          {/* Beschreibung: Dropdown ODER Freitext */}
          <TextField
            select
            label="Beschreibung wählen"
            value={beschreibungDropdown}
            onChange={handleBeschreibungDropdown}
            fullWidth
            margin="normal"
            sx={{ mb: 1 }}
          >
            {beschreibungOptionen.map(opt => (
              <MenuItem value={opt.value} key={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Beschreibung (optional, eigener Eintrag)"
            value={beschreibungDropdown ? beschreibungDropdown : beschreibung}
            onChange={handleBeschreibungInput}
            fullWidth
            margin="normal"
            placeholder="z.B. Platzpflege, Grillen, Schiri etc."
            disabled={!!beschreibungDropdown}
          />
          <TextField
            label="Benötigte Personen"
            type="number"
            min={1}
            value={anzahl}
            onChange={e => setAnzahl(Number(e.target.value))}
            fullWidth
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PeopleIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ mb: 2 }}>
            <DatePicker
              selected={stichtag}
              onChange={handleStichtagChange}
              dateFormat="dd.MM.yyyy"
              customInput={
                <TextField
                  label="Stichtag (optional)"
                  value={inputStichtag}
                  onChange={handleInputStichtagChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              }
              isClearable
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </Box>
          <TextField
            label="Ansprechpartner Name"
            value={ansprechpartnerName}
            onChange={e => setAnsprechpartnerName(e.target.value)}
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Ansprechpartner E-Mail"
            value={ansprechpartnerMail}
            onChange={e => setAnsprechpartnerMail(e.target.value)}
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Score für Teilnahme"
            type="number"
            min={0}
            value={score}
            onChange={e => setScore(Number(e.target.value))}
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <StarIcon />
                </InputAdornment>
              ),
            }}
          />
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

export default NeuerTermin;