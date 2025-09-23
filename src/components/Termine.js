import React, { useEffect, useState, useMemo } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import de from "date-fns/locale/de";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FaChevronDown, FaChevronUp, FaEdit } from "react-icons/fa";

const locales = {
  "de": de,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const API_BASE = "https://vereins-backend-production.up.railway.app/api";

function Termine({ user, token }) {
  const [termine, setTermine] = useState([]);
  const [rangliste, setRangliste] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState({});
  const [myNextTermin, setMyNextTermin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Events für react-big-calendar vorbereiten
  const events = useMemo(() => {
    if (!Array.isArray(termine)) return [];
    return termine.map(t => ({
      id: t.id,
      title: t.titel,
      start: new Date(t.datum + (t.beginn ? "T" + t.beginn : "")),
      end: new Date(t.datum + (t.ende ? "T" + t.ende : "")),
      allDay: !t.beginn || !t.ende,
      resource: t,
    }));
  }, [termine]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        // --- Termine laden ---
        const res = await fetch(API_BASE + "/termine", {
          headers: { Authorization: "Bearer " + token }
        });
        if (!res.ok) throw new Error("Fehler beim Laden der Termine: " + res.status);
        const termineData = await res.json();
        if (!Array.isArray(termineData)) throw new Error("Termine-Format ungültig!");
        setTermine(termineData);

        // --- Rangliste laden ---
        const res2 = await fetch(API_BASE + "/users", {
          headers: { Authorization: "Bearer " + token }
        });
        if (!res2.ok) throw new Error("Fehler beim Laden der Nutzer: " + res2.status);
        const usersData = await res2.json();
        if (!Array.isArray(usersData)) throw new Error("Rangliste-Format ungültig!");
        setRangliste(usersData);

        // --- Nächster eigener Termin ---
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
    // eslint-disable-next-line
  }, [token, user?.username]);

  // Einschreiben
  async function handleEinschreiben(terminId) {
    try {
      await fetch(`${API_BASE}/termine/${terminId}/teilnehmer`, {
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

  function handleBearbeiten(terminId) {
    alert("Bearbeiten von Termin " + terminId);
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("de-DE");
  }

  return (
    <div style={{ maxWidth: 1250, margin: "0 auto", padding: "32px" }}>
      <h2 style={{ marginTop: 0 }}>Kalender</h2>
      <div style={{
        width: "100%",
        maxWidth: "1200px",
        minHeight: "520px",
        margin: "0 auto 32px auto",
        fontSize: "1.13rem",
        boxShadow: "0 2px 16px #0002",
        borderRadius: "22px",
        padding: "16px",
        background: "#fff"
      }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 540 }}
          views={["month", "week", "day"]}
          culture="de"
          popup
          messages={{
            next: "nächster",
            previous: "vorheriger",
            today: "heute",
            month: "Monat",
            week: "Woche",
            day: "Tag",
            agenda: "Agenda"
          }}
          eventPropGetter={event => ({
            style: {
              backgroundColor: "#e6f0ff",
              color: "#1d56b3",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              fontSize: "1em"
            }
          })}
          tooltipAccessor={event =>
            `${event.title} (${event.resource.beschreibung || ""})`
          }
        />
      </div>

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
                      <span style={{ color: "#666" }}>{formatDate(t.datum)}</span>
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
          <b>{myNextTermin.titel}</b> am {formatDate(myNextTermin.datum)}
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