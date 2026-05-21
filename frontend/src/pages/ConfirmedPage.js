// src/pages/ConfirmedPage.js
import React from "react";
import { Calendar } from "lucide-react";
// === même logique d'affichage que dans App.js ===

const platformLogos = {
  Amblea: "/amblea.png",
  Paramedic: "/paramedic.png",
  PTAH: "/ptah.png",
  SPS: "/sps.png",
  Bibulance: "/bibulance.png",
  "SCR'Urgences": "/scrurgences.png",
  "Bibulance Mobile": "/bibulance.png",
  bibulance_mobile: "/bibulance.png",
};

const PlatformTag = ({ platform }) => {
  const logo = platformLogos[platform];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 90,
        width: 90,
      }}
    >
      {logo && (
        <img
          src={logo}
          alt={platform}
          style={{
            width: 80,
            height: 80,
            objectFit: "contain",
          }}
        />
      )}
    </div>
  );
};

// === COLONNE ÉTAT (copiée depuis App.js) ===
const EtatCell = ({ mission }) => {
  let badgeLabel = "";
  let badgeColor = "";

  if (mission.platform_cancelled) {
    badgeLabel = "Annulée plateforme";
    badgeColor = "rgba(229,231,235,0.6)";
  } else if (mission.platform_refused) {
    badgeLabel = "Refusée plateforme";
    badgeColor = "rgba(255,94,121,0.22)";
  } else if (mission.accepted_bibulance && mission.platform_confirmation) {
    badgeLabel = "Acceptée plateforme";
    badgeColor = "rgba(91,242,247,0.22)";
  } else if (mission.accepted_bibulance && !mission.platform_confirmation) {
    badgeLabel = "En attente plateforme";
    badgeColor = "rgba(192,126,255,0.22)";
  } else {
    badgeLabel = "Acceptée Bibulance";
    badgeColor = "rgba(99,255,169,0.22)";
  }

  const trajetTypes = ["aller", "retour", "aller-retour"];
  const trajet = trajetTypes[mission.id % 3];

  const trajetEmoji =
    trajet === "aller" ? "➡️" : trajet === "retour" ? "⬅️" : "🔁";

  const missionNumber = 10000 + mission.id;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          background: badgeColor,
          padding: "3px 8px",
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 700,
          color: "#0b1020",
          width: "fit-content",
        }}
      >
        {badgeLabel}
      </span>

      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#1f2937",
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        <span>#{missionNumber}</span>
        <span>{mission.vehicle_type}</span>
        <span>{trajetEmoji}</span>
      </div>
    </div>
  );
};

// === COLONNE TRAJET (copiée depuis App.js) ===
const TrajetCell = ({ mission }) => {
  const rdv = new Date(mission.rdv_time);
  const pickup = new Date(rdv.getTime() - 14 * 60000);

  const formatTime = (d) =>
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const trajetTypes = ["aller", "retour", "aller-retour"];
  const trajet = trajetTypes[mission.id % 3];

  const waveTop = trajet === "aller" ? "~" : "";
  const waveBottom = trajet === "retour" ? "~" : "";

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 10, fontSize: 12 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minWidth: 60,
          textAlign: "right",
          fontWeight: 700,
          color: "#0b1020",
          lineHeight: "16px",
        }}
      >
        <span>
          {waveTop}
          {formatTime(pickup)}
        </span>
        <span>
          {waveBottom}
          {formatTime(rdv)}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 2,
          paddingBottom: 2,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#5BF2F7",
          }}
        />
        <div
          style={{
            width: 3,
            flexGrow: 1,
            background: "#5BF2F7",
            borderRadius: 2,
            margin: "2px 0",
          }}
        />
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#5BF2F7",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontWeight: 600,
              color: "#0b1020",
              whiteSpace: "nowrap",
            }}
          >
            {mission.emitter_facility}
          </span>
          {mission.emitter_address && (
            <span style={{ color: "#4b5563", whiteSpace: "normal" }}>
              {mission.emitter_address}
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontWeight: 600,
              color: "#0b1020",
              whiteSpace: "nowrap",
            }}
          >
            {mission.destination_facility}
          </span>
          {mission.destination_address && (
            <span style={{ color: "#4b5563", whiteSpace: "normal" }}>
              {mission.destination_address}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ConfirmedPage = ({ missions, th, td }) => {
  if (!missions || missions.length === 0) {
    return (
      <div style={{ background: "#ffffff", padding: 16, borderRadius: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
        Aucune mission confirmée.
      </div>
    );
  }

  // Regroupement par date
  const groupedByDate = missions.reduce((acc, m) => {
    const d = new Date(m.rdv_time.replace(" ", "T"));
    const key = isNaN(d.getTime()) ? "Sans date" : d.toISOString().split("T")[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort();

  const formatDate = (dateStr) => {
    if (dateStr === "Sans date") return "Sans date";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  };

  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 24, fontWeight: 700, color: "#1f2937" }}>
        Missions confirmées
      </h2>

      {sortedDates.map((dateKey) => (
        <div key={dateKey} style={{ marginBottom: 32 }}>
          {/* HEADER DATE */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(236,254,255,0.85) 0%, rgba(243,232,255,0.85) 100%)",
backdropFilter: "blur(10px)",
border: "1px solid rgba(255,255,255,0.4)",
boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
borderRadius: 10,
padding: "6px 14px",
fontSize: 15,
fontWeight: 700,
color: "#0b1020",
display: "flex",
alignItems: "center",
gap: 6,
            }}>
              <Calendar size={15} style={{ flexShrink: 0 }} /> {formatDate(dateKey)}
            </div>
            <div style={{
              fontSize: 13,
              color: "#6b7280",
              fontWeight: 600,
            }}>
              {groupedByDate[dateKey].length} mission{groupedByDate[dateKey].length > 1 ? "s" : ""}
            </div>
          </div>

          {/* TABLE DU GROUPE */}
          <div style={{
            background: "#ffffff",
            padding: "10px 14px",
            borderRadius: 14,
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            border: "2px solid #5BF2F7",
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 4 }}>
              <thead>
                <tr>
                  <th style={{ ...th, width: 110, padding: "4px 6px", textAlign: "center" }}>État</th>
                  <th style={{ ...th, width: 260, padding: "4px 6px", textAlign: "center" }}>Trajet</th>
                  <th style={{ ...th, width: 160, padding: "4px 6px" }}>Patient</th>
                  <th style={{ ...th, width: 70, padding: "4px 6px" }}>Source</th>
                </tr>
              </thead>
              <tbody>
                {groupedByDate[dateKey].map((m) => (
                  <tr key={m.id}>
                    <td style={{ ...td, padding: "3px 4px", fontSize: 10, width: 110 }}>
                      <EtatCell mission={m} />
                    </td>
                    <td style={{ ...td, padding: "3px 4px", width: 260 }}>
                      <TrajetCell mission={m} />
                    </td>
                    <td style={{ ...td, padding: "3px 4px", fontSize: 12 }}>
                      <span style={{ fontWeight: 600, color: "#0b1020" }}>
                        {m.patient_last_name} {m.patient_first_name}
                      </span>
                    </td>
                    <td style={{ ...td, padding: "3px 4px", textAlign: "center" }}>
                      <PlatformTag platform={m.source_platform} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConfirmedPage;
