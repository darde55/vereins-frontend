import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaChevronDown, FaChevronUp, FaEdit } from "react-icons/fa";

// Großes Kalender-Design für Übersichtlichkeit
const calendarStyle = {
  width: "100%",
  maxWidth: "1100px",
  minHeight: "480px",
  margin: "0 auto 32px auto",
  fontSize: "1.22rem",
  boxShadow: "0 2px 8px #0002",
  borderRadius: "18px",
  padding: "18px",
  background: "#fff"
};

function Termine({ user, apiUrl, token }) {
  const [termine, setTermine] = useState([]);
  const [rangliste, setRangliste] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState({});
  const [myNextTermin, setMyNextTermin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [calendarValue, setCalendarValue] = useState(new Date());

  // Daten holen
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        // === Termine laden ===
        const res = await fetch(apiUrl + "/termine", {
          headers: { Authorization: "Bearer " + token }
        });
        const termineData = await res.json();
        if (!Array.isArray(termineData)) throw new Error("Termine-Format ungültig!");
        setTermine(termineData);

        // === Rangliste laden ===
        const res2 = await fetch(apiUrl + "/users", {
          headers: { Authorization: "Bearer " + token }
        });
        const usersData = await res2.json();
        if (!Array.isArray(usersData)) throw new Error("Rangliste-Format ungültig!");
        setRangliste(usersData);

        // === Nächster eigener Termin berechnen ===
        const myTermine = termineData
          .filter(
            t =>
              t &&
              Array.isArray(t.teilnehmer) &&
              user &&
              user.username &&
              t.teilnehmer.includes(user.username)
          )
          .sort((a, b) => new Date(a.datum) - new Date(b.datum));
        setMyNextTermin(myTermine[0] || null);
      } catch (e) {
        setError("Fehler beim Laden der Daten: " + e.message);
        setTermine([]);
        setRangliste([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [apiUrl, token, user?.username]);

  // Einschreiben
  async function handleEinschreiben(terminId) {
    try {
      await fetch(apiUrl + `/termine/${terminId}/teilnehmer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ username: user.username })
      });
      window.location.reload();
    } catch (e) {
      alert("Fehler beim Einschreiben.");
    }
  }

  // Bearbeiten (Dummy)
  function handleBearbeiten(terminId) {
    alert("Bearbeiten von Termin " + terminId);
  }

  // Kalender-Events für Markierung
  const kalenderEvents = Array.isArray(termine)
    ? termine
        .filter(t => t && t.datum && t.titel)
        .map(t => ({
          date: new Date(t.datum),
          title: t.titel
        }))
    : [];

  // Tage mit Terminen markieren (V6: CSS-Klasse dynamisch setzen)
  function tileClassName({ date }) {
    if (
      kalenderEvents.some(ev => ev.date.toDateString() === date.toDateString())
    ) {
      return "highlight-day";
    }
    return null;
  }

  // Termin-Titel auf Kalendertag anzeigen
  function tileContent({ date }) {
    const events = kalenderEvents.filter(
      ev => ev.date.toDateString() === date.toDateString()
    );
    return events.length > 0 ? (
      <div style={{
        fontSize: "1em",
        color: "#1d56b3",
        fontWeight: 600,
        marginTop: 2
      }}>
        {events.map(ev => ev.title).join(", ")}
      </div>
    ) : null;
  }

  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", padding: "20px" }}>
      <h2 style={{ marginTop: 0 }}>Kalender</h2>
      <div style={calendarStyle}>
        <Calendar
          value={calendarValue}
          onChange={setCalendarValue}
          tileContent={tileContent}
          tileClassName={tileClassName}
          showNeighboringMonth={false}
          prev2Label={null}
          next2Label={null}
          // calendarType gibt es in v6 NICHT mehr!
        />
      </div>
      <style>
        {`
        .highlight-day {
          background: #e6f0ff !important;
          border-radius: 50% !important;
        }
        .react-calendar {
          border: none !important;
        }
        .react-calendar__tile--active {
          background: #206bff !important;
          color: white !important;
        }
        `}
      </style>

      <h2>Alle Termine</h2>
      {loading ? (
        <div>Lade Termine...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <div>
          {Array.isArray(termine) && termine.length > 0 ? (
            termine.map(t =>
              t ? (
                <div
                  key={t.id}
                  style={{
                    background: "#f5f7fa",
                    margin: "18px 0",
                    borderRadius: 10,
                    padding: 20,
                    boxShadow: "0 1px 4px #0001"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <b style={{ fontSize: "1.12em" }}>{t.titel}</b>{" "}
                      <span style={{ color: "#666" }}>{t.datum}</span>
                    </div>
                    <div>
                      {user?.role === "admin" && (
                        <button
                          onClick={() => handleBearbeiten(t.id)}
                          title="Bearbeiten"
                          style={{ marginRight: 8 }}
                        >
                          <FaEdit />
                        </button>
                      )}
                      {Array.isArray(t.teilnehmer) &&
                        user &&
                        user.username &&
                        !t.teilnehmer.includes(user.username) && (
                          <button onClick={() => handleEinschreiben(t.id)}>
                            Einschreiben
                          </button>
                        )}
                      <button
                        onClick={() =>
                          setSelectedDetails(sd => ({
                            ...sd,
                            [t.id]: !sd[t.id]
                          }))
                        }
                        style={{ marginLeft: 8 }}
                      >
                        {selectedDetails[t.id] ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </div>
                  </div>
                  {selectedDetails[t.id] && (
                    <div style={{ marginTop: 10, color: "#222" }}>
                      <div>
                        <b>Beginn:</b> {t.beginn || "–"}
                      </div>
                      <div>
                        <b>Ende:</b> {t.ende || "–"}
                      </div>
                      <div>
                        <b>Beschreibung:</b> {t.beschreibung || "–"}
                      </div>
                      <div>
                        <b>Teilnehmer:</b>{" "}
                        {Array.isArray(t.teilnehmer) ? t.teilnehmer.length : 0} /{" "}
                        {t.anzahl}
                        <div style={{ marginTop: 4 }}>
                          {Array.isArray(t.teilnehmer) &&
                            t.teilnehmer.map(name => (
                              <span
                                key={name}
                                style={{
                                  marginRight: 8,
                                  background: "#e0eaff",
                                  borderRadius: 5,
                                  padding: "2px 8px",
                                  fontSize: "0.98em"
                                }}
                              >
                                {name}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null
            )
          ) : (
            <div>Keine Termine gefunden.</div>
          )}
        </div>
      )}

      <h2>Dein nächster Termin</h2>
      {myNextTermin ? (
        <div
          style={{
            background: "#e0ffe0",
            padding: 18,
            borderRadius: 10,
            marginBottom: 24
          }}
        >
          <b>{myNextTermin.titel}</b> am {myNextTermin.datum}
          <div>{myNextTermin.beschreibung}</div>
        </div>
      ) : (
        <div>Du bist für keinen Termin eingeschrieben.</div>
      )}

      <h2>Rangliste</h2>
      {loading ? (
        <div>Lade Rangliste...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : Array.isArray(rangliste) && rangliste.length > 0 ? (
        <table
          style={{
            width: "100%",
            marginTop: 16,
            borderCollapse: "collapse",
            boxShadow: "0 1px 4px #0001"
          }}
        >
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: "8px 4px" }}>#</th>
              <th>Name</th>
              <th>Score</th>
              <th>Rolle</th>
            </tr>
          </thead>
          <tbody>
            {rangliste
              .sort((a, b) => (b.score || 0) - (a.score || 0))
              .map((u, i) => (
                <tr
                  key={u.username}
                  style={{
                    background: user?.username === u.username ? "#ffffcc" : "#fff"
                  }}
                >
                  <td style={{ padding: "8px 4px" }}>{i + 1}</td>
                  <td>{u.username}</td>
                  <td>{u.score}</td>
                  <td>{u.role}</td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <div>Keine Rangliste gefunden.</div>
      )}
    </div>
  );
}

export default Termine;