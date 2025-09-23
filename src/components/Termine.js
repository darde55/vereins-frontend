import React, { useEffect, useState, useMemo } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import de from "date-fns/locale/de";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FaChevronDown, FaChevronUp, FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";

const locales = { de };

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
  const [nextTermineOpen, setNextTermineOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myNextTermineList, setMyNextTermineList] = useState([]);

  // Admin: Bearbeiten Dialog
  const [editTermin, setEditTermin] = useState(null);
  const [editData, setEditData] = useState({});
  const [showUserAdd, setShowUserAdd] = useState(false);
  const [userToAdd, setUserToAdd] = useState("");

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

  // Daten laden
  async function fetchAllData() {
    setLoading(true);
    setError("");
    try {
      // --- Termine laden ---
      const res = await fetch(API_BASE + "/termine", {
        headers: { Authorization: "Bearer " + token }
      });
      if (!res.ok) throw new Error("Fehler beim Laden der Termine: " + res.status);
      const termineData = await res.json();
      // Stelle sicher, dass teilnehmer immer ein Array ist
      const termineFixed = termineData.map(t => ({
        ...t,
        teilnehmer: Array.isArray(t.teilnehmer)
          ? t.teilnehmer
          : (typeof t.teilnehmer === "string"
              ? JSON.parse(t.teilnehmer)
              : [])
      }));
      setTermine(termineFixed);

      // --- Rangliste laden ---
      const res2 = await fetch(API_BASE + "/users", {
        headers: { Authorization: "Bearer " + token }
      });
      if (!res2.ok) throw new Error("Fehler beim Laden der Nutzer: " + res2.status);
      const usersData = await res2.json();
      setRangliste(usersData);

      // --- Nächster eigener Termin + Folge-Termine ---
      const myTermine = termineFixed
        .filter(
          t =>
            t &&
            Array.isArray(t.teilnehmer) &&
            user &&
            user.username &&
            t.teilnehmer
              .map(name => (typeof name === "string" ? name.toLowerCase().trim() : ""))
              .includes(user.username.toLowerCase().trim())
        )
        .sort((a, b) => new Date(a.datum) - new Date(b.datum));
      setMyNextTermin(myTermine.length > 0 ? myTermine[0] : null);
      setMyNextTermineList(myTermine);
    } catch (e) {
      setError("Fehler beim Laden der Daten: " + e.message);
      setTermine([]);
      setRangliste([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (token && user) {
      fetchAllData();
    } else {
      setLoading(false);
      setTermine([]);
      setRangliste([]);
    }
    // eslint-disable-next-line
  }, [token, user]);

  // Einschreiben
  async function handleEinschreiben(terminId, username = user.username) {
    try {
      await fetch(`${API_BASE}/termine/${terminId}/teilnehmer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ username })
      });
      await fetchAllData();
    } catch (e) {
      alert("Fehler beim Einschreiben.");
    }
  }

  // Termin löschen (Admin)
  async function handleDeleteTermin(terminId) {
    if (!window.confirm("Diesen Termin wirklich löschen?")) return;
    try {
      await fetch(`${API_BASE}/termine/${terminId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });
      await fetchAllData();
    } catch (e) {
      alert("Fehler beim Löschen.");
    }
  }

  // Bearbeiten Dialog öffnen
  function handleBearbeiten(termin) {
    setEditTermin(termin);
    setEditData({
      titel: termin.titel,
      beschreibung: termin.beschreibung,
      datum: termin.datum,
      beginn: termin.beginn || "",
      ende: termin.ende || "",
      anzahl: termin.anzahl,
      stichtag: termin.stichtag || "",
      ansprechpartner: termin.ansprechpartner || "",
      ansprechpartner_email: termin.ansprechpartner_email || "",
      score: termin.score || 0
    });
    setShowUserAdd(false);
    setUserToAdd("");
  }

  // Bearbeiten speichern (Admin)
  async function handleEditSave(e) {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/termine/${editTermin.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(editData)
      });
      setEditTermin(null);
      await fetchAllData();
    } catch (e) {
      alert("Fehler beim Bearbeiten.");
    }
  }

  // Admin: User manuell einschreiben
  async function handleUserAdd(e) {
    e.preventDefault();
    if (!userToAdd) return;
    await handleEinschreiben(editTermin.id, userToAdd);
    setUserToAdd("");
    setShowUserAdd(false);
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("de-DE");
  }

  if (!user || !token) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <h2>Bitte einloggen, um Termine zu sehen.</h2>
      </div>
    );
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
                      {/* Bearbeiten-Button für Admin */}
                      {user?.role === "admin" && (
                        <>
                          <button
                            onClick={() => handleBearbeiten(t)}
                            title="Bearbeiten"
                            style={{ marginRight: 8, cursor: "pointer", background: "#fffbe0", border: "1px solid #d1a100", color: "#d1a100", borderRadius: 6, padding: "0.32em 0.7em" }}
                          >
                            <FaEdit style={{ marginRight: 4, verticalAlign: "middle" }} />
                            Bearbeiten
                          </button>
                          <button
                            onClick={() => handleDeleteTermin(t.id)}
                            title="Löschen"
                            style={{ marginRight: 8, cursor: "pointer", background: "#ffefef", border: "1px solid #b30000", color: "#b30000", borderRadius: 6, padding: "0.32em 0.7em" }}
                          >
                            <FaTrash style={{ marginRight: 4, verticalAlign: "middle" }} />
                            Löschen
                          </button>
                          <button
                            onClick={() => {
                              setEditTermin(t);
                              setShowUserAdd(true);
                            }}
                            title="User einschreiben"
                            style={{ marginRight: 8, cursor: "pointer", background: "#e0ffe0", border: "1px solid #249c24", color: "#249c24", borderRadius: 6, padding: "0.32em 0.7em" }}
                          >
                            <FaUserPlus style={{ marginRight: 4, verticalAlign: "middle" }} />
                            User einschreiben
                          </button>
                        </>
                      )}
                      {/* Einschreiben-Button für eingeloggte User, wenn noch nicht eingeschrieben */}
                      {Array.isArray(t.teilnehmer) &&
                        user &&
                        user.username &&
                        !t.teilnehmer
                          .map(name => (typeof name === "string" ? name.toLowerCase().trim() : ""))
                          .includes(user.username.toLowerCase().trim()) && (
                          <button
                            onClick={() => handleEinschreiben(t.id)}
                            style={{ background: "#e0f7fa", border: "1px solid #00b8d4", color: "#006064", borderRadius: 6, padding: "0.32em 0.7em", cursor: "pointer" }}
                          >
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
                        style={{ marginLeft: 8, cursor: "pointer", background: "#f3f3f3", border: "1px solid #bbb", borderRadius: 6, padding: "0.32em 0.7em" }}
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
                        <b>Stichtag:</b> {t.stichtag ? formatDate(t.stichtag) : "–"}
                      </div>
                      <div>
                        <b>Beschreibung:</b> {t.beschreibung || "–"}
                      </div>
                      <div>
                        <b>Ansprechpartner:</b> {t.ansprechpartner || "–"}
                        {t.ansprechpartner_email && (
                          <> (
                            <a href={`mailto:${t.ansprechpartner_email}`}>
                              {t.ansprechpartner_email}
                            </a>
                          )</>
                        )}
                      </div>
                      <div>
                        <b>Score:</b> {t.score || 0}
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

      {/* Admin: Bearbeiten-Dialog */}
      {editTermin && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99
        }}>
          <form
            onSubmit={handleEditSave}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              minWidth: 350,
              boxShadow: "0 4px 16px #0004",
              display: "flex",
              flexDirection: "column",
              gap: 10
            }}>
            <b>Termin bearbeiten</b>
            <input
              value={editData.titel}
              onChange={e => setEditData(ed => ({ ...ed, titel: e.target.value }))}
              placeholder="Titel"
              required
            />
            <input
              value={editData.beschreibung}
              onChange={e => setEditData(ed => ({ ...ed, beschreibung: e.target.value }))}
              placeholder="Beschreibung"
            />
            <input
              type="date"
              value={editData.datum}
              onChange={e => setEditData(ed => ({ ...ed, datum: e.target.value }))}
              required
            />
            <input
              type="date"
              value={editData.stichtag}
              onChange={e => setEditData(ed => ({ ...ed, stichtag: e.target.value }))}
              placeholder="Stichtag"
            />
            <input
              type="time"
              value={editData.beginn}
              onChange={e => setEditData(ed => ({ ...ed, beginn: e.target.value }))}
              placeholder="Beginn"
            />
            <input
              type="time"
              value={editData.ende}
              onChange={e => setEditData(ed => ({ ...ed, ende: e.target.value }))}
              placeholder="Ende"
            />
            <input
              type="number"
              value={editData.anzahl}
              onChange={e => setEditData(ed => ({ ...ed, anzahl: e.target.value }))}
              placeholder="Maximale Teilnehmer"
            />
            <input
              value={editData.ansprechpartner}
              onChange={e => setEditData(ed => ({ ...ed, ansprechpartner: e.target.value }))}
              placeholder="Ansprechpartner"
            />
            <input
              value={editData.ansprechpartner_email}
              onChange={e => setEditData(ed => ({ ...ed, ansprechpartner_email: e.target.value }))}
              placeholder="E-Mail Ansprechpartner"
              type="email"
            />
            <input
              type="number"
              value={editData.score}
              onChange={e => setEditData(ed => ({ ...ed, score: e.target.value }))}
              placeholder="Score für Termin"
              min={0}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" style={{ flex: 1, background: "#e0ffe0", border: "1px solid #249c24", color: "#249c24", borderRadius: 6, padding: "0.32em 0.7em" }}>Speichern</button>
              <button type="button" style={{ flex: 1, background: "#ffe0e0", border: "1px solid #d00", color: "#d00", borderRadius: 6, padding: "0.32em 0.7em" }} onClick={() => setEditTermin(null)}>Abbrechen</button>
            </div>
          </form>
        </div>
      )}

      {/* Admin: User manuell einschreiben */}
      {showUserAdd && editTermin && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
        }}>
          <form
            onSubmit={handleUserAdd}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              minWidth: 350,
              boxShadow: "0 4px 16px #0004",
              display: "flex",
              flexDirection: "column",
              gap: 10
            }}>
            <b>User manuell einschreiben</b>
            <select
              value={userToAdd}
              onChange={e => setUserToAdd(e.target.value)}
              required
            >
              <option value="">User wählen …</option>
              {rangliste
                .filter(u =>
                  !editTermin.teilnehmer.includes(u.username) // nur noch nicht eingeschriebene anzeigen
                )
                .map(u => (
                  <option key={u.username} value={u.username}>{u.username}</option>
                ))}
            </select>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" style={{ flex: 1, background: "#e0ffe0", border: "1px solid #249c24", color: "#249c24", borderRadius: 6, padding: "0.32em 0.7em" }}>Einschreiben</button>
              <button type="button" style={{ flex: 1, background: "#ffe0e0", border: "1px solid #d00", color: "#d00", borderRadius: 6, padding: "0.32em 0.7em" }} onClick={() => setShowUserAdd(false)}>Abbrechen</button>
            </div>
          </form>
        </div>
      )}

      <h2>
        Deine nächsten Termine{" "}
        <button
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: "1em",
            verticalAlign: "middle"
          }}
          onClick={() => setNextTermineOpen(open => !open)}
        >
          {nextTermineOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </h2>
      {myNextTermineList && myNextTermineList.length > 0 && nextTermineOpen && (
        <div style={{ marginBottom: 24 }}>
          {myNextTermineList.map((termin, i) => (
            <div
              key={termin.id}
              style={{
                background: "#e0ffe0",
                padding: 18,
                borderRadius: 10,
                marginBottom: 12
              }}
            >
              <b>{termin.titel}</b> am {formatDate(termin.datum)}
              <div>{termin.beschreibung}</div>
            </div>
          ))}
        </div>
      )}
      {!nextTermineOpen && myNextTermin && (
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
      )}
      {myNextTermineList && myNextTermineList.length === 0 && (
        <div>Du bist für keinen Termin eingeschrieben.</div>
      )}

      <h2>Rangliste</h2>
      {loading ? (
        <div>Lade Rangliste...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : Array.isArray(rangliste) && rangliste.length > 0 ? (
        <div style={{
          overflowX: "auto",
          marginTop: 16,
          borderRadius: 12,
          boxShadow: "0 2px 8px #0001"
        }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              background: "#fff",
              fontSize: "1.1em",
              borderRadius: 12,
              overflow: "hidden"
            }}
          >
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={{ padding: "12px 8px", fontWeight: 600, borderBottom: "2px solid #eaeaea" }}>#</th>
                <th style={{ padding: "12px 8px", fontWeight: 600, borderBottom: "2px solid #eaeaea" }}>Name</th>
                <th style={{ padding: "12px 8px", fontWeight: 600, borderBottom: "2px solid #eaeaea" }}>Score</th>
                <th style={{ padding: "12px 8px", fontWeight: 600, borderBottom: "2px solid #eaeaea" }}>Rolle</th>
              </tr>
            </thead>
            <tbody>
              {rangliste
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map((u, i) => (
                  <tr
                    key={u.username}
                    style={{
                      background: i % 2 === 0 ? "#f5f7fa" : "#fff",
                      fontWeight: user?.username === u.username ? "bold" : "normal"
                    }}
                  >
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #efefef" }}>{i + 1}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #efefef" }}>{u.username}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #efefef" }}>{u.score}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #efefef" }}>{u.role}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>Keine Rangliste gefunden.</div>
      )}
    </div>
  );
}

export default Termine;