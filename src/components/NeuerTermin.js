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

function formatDateEU(date) {
  if (!date) return "";
  return date.toLocaleDateString("de-DE");
}

function parseDateEU(str) {
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(str)) return null;
  const [day, month, year] = str.split(".");
  return new Date(`${year}-${month}-${day}T00:00:00`);
}

function NeuerTermin({ token }) {
  const [titel, setTitel] = useState("");
  const [datum, setDatum] = useState(null);
  const [beschreibung, setBeschreibung] = useState("");
  const [anzahl, setAnzahl] = useState(1);
  const [msg, setMsg] = useState("");
  const [inputDate, setInputDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!datum) {
      setMsg("Bitte gültiges Datum wählen oder eingeben (TT.MM.JJJJ).");
      return;
    }
    try {
      await axios.post(
        "http://localhost:3001/termine",
        {
          titel,
          datum: datum.toISOString().slice(0, 10),
          beschreibung,
          anzahl,
        },
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      setMsg("Termin erfolgreich angelegt!");
      setTitel("");
      setDatum(null);
      setInputDate("");
      setBeschreibung("");
      setAnzahl(1);
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

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "70vh" }}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 450, width: "100%" }}>
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
          <TextField
            label="Beschreibung"
            value={beschreibung}
            onChange={e => setBeschreibung(e.target.value)}
            fullWidth
            margin="normal"
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