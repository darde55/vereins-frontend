import React, { useEffect, useState } from "react";
import Calendar from "react-calendar"; // oder react-big-calendar
import "react-calendar/dist/Calendar.css";
import { FaChevronDown, FaChevronUp, FaEdit } from "react-icons/fa";

function Termine({ user, apiUrl, token }) {
  const [termine, setTermine] = useState([]);
  const [rangliste, setRangliste] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState({});
  const [myNextTermin, setMyNextTermin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Termine und Rangliste laden
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Termine
        const res = await fetch(apiUrl + "/termine", {
          headers: { Authorization: "Bearer " + token }
        });
        const termineData = await res.json();
        setTermine(termineData);

        // Rangliste (alle users)
        const res2 = await fetch(apiUrl + "/users", {
          headers: { Authorization: "Bearer " + token }
        });
        setRangliste(await res2.json());

        // Nächster Termin, an dem User eingetragen ist
        const myTermine = termineData
          .filter(t => t.teilnehmer && t.teilnehmer.includes(user.username))
          .sort((a, b) => new Date(a.datum) - new Date(b.datum));
        setMyNextTermin(myTermine[0] || null);

      } catch (e) {
        setTermine([]);
        setRangliste([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [apiUrl, token, user.username]);

  // Einschreiben-Handler
  async function handleEinschreiben(terminId) {
    await fetch(apiUrl + `/termine/${terminId}/teilnehmer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ username: user.username })
    });
    // Reload Termine nach dem Einschreiben
    window.location.reload();
  }

  // Bearbeiten-Handler für Admin (hier evtl. Modal öffnen, Dummy)
  function handleBearbeiten(terminId) {
    alert("Bearbeiten von Termin " + terminId);
    // Hier ein Modal oder Seite zum Bearbeiten öffnen
  }

  // Kalender-Events vorbereiten
  const kalenderEvents = termine.map(t => ({
    date: new Date(t.datum),
    title: t.titel
  }));

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* 1. Großer Kalender */}
      <h2>Kalender</h2>
      <Calendar
        tileContent={({ date, view }) => {
          // Zeige Termin-Titel am jeweiligen Datum
          const events = kalenderEvents.filter(ev =>
            ev.date.toDateString() === date.toDateString()
          );
          return events.length > 0 ? (
            <div style={{ fontSize: 9, color: "blue" }}>
              {events.map(ev => ev.title).join(", ")}
            </div>
          ) : null;
        }}
      />

      {/* 2. Termin-Liste */}
      <h2>Alle Termine</h2>
      {loading ? <div>Lade Termine...</div> : (
        <div>
          {termine.map(t => (
            <div key={t.id} style={{
              background: "#f7f7fa",
              margin: "16px 0",
              borderRadius: 8,
              padding: 16,
              boxShadow: "0 1px 4px #0001"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <b>{t.titel}</b> <span style={{ color: "#666" }}>{t.datum}</span>
                </div>
                <div>
                  {user.role === "admin" && (
                    <button onClick={() => handleBearbeiten(t.id)} title="Bearbeiten" style={{ marginRight: 8 }}>
                      <FaEdit />
                    </button>
                  )}
                  {!t.teilnehmer?.includes(user.username) && (
                    <button onClick={() => handleEinschreiben(t.id)}>
                      Einschreiben
                    </button>
                  )}
                  <button onClick={() =>
                    setSelectedDetails(sd => ({
                      ...sd, [t.id]: !sd[t.id]
                    }))
                  } style={{ marginLeft: 8 }}>
                    {selectedDetails[t.id] ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
              </div>
              {/* Details */}
              {selectedDetails[t.id] && (
                <div style={{ marginTop: 10, color: "#222" }}>
                  <div><b>Beginn:</b> {t.beginn}</div>
                  <div><b>Ende:</b> {t.ende}</div>
                  <div><b>Beschreibung:</b> {t.beschreibung}</div>
                  <div>
                    <b>Teilnehmer:</b> {t.teilnehmer?.length || 0} / {t.anzahl}
                    <div>
                      {t.teilnehmer?.map(name => (
                        <span key={name} style={{ marginRight: 8 }}>{name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. Nächster eigener Termin */}
      <h2>Dein nächster Termin</h2>
      {myNextTermin ? (
        <div style={{
          background: "#e0ffe0",
          padding: 16,
          borderRadius: 8,
          marginBottom: 24
        }}>
          <b>{myNextTermin.titel}</b> am {myNextTermin.datum}
          <div>{myNextTermin.beschreibung}</div>
        </div>
      ) : (
        <div>Du bist für keinen Termin eingeschrieben.</div>
      )}

      {/* 4. Rangliste */}
      <h2>Rangliste</h2>
      <table style={{
        width: "100%",
        marginTop: 16,
        borderCollapse: "collapse",
        boxShadow: "0 1px 4px #0001"
      }}>
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
            .sort((a, b) => b.score - a.score)
            .map((u, i) => (
              <tr key={u.username} style={{
                background: user.username === u.username ? "#ffffcc" : "#fff"
              }}>
                <td style={{ padding: "8px 4px" }}>{i + 1}</td>
                <td>{u.username}</td>
                <td>{u.score}</td>
                <td>{u.role}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default Termine;