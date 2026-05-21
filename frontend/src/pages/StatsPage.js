import React from "react";

const page = {
  padding: "20px 0 60px 0",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

const title = {
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 24,
  color: "#0b1020",
};

const sectionTitle = {
  fontSize: 18,
  fontWeight: 700,
  marginBottom: 12,
  color: "#0b1020",
};

const card = (borderColor) => ({
  background: "rgba(255,255,255,0.7)",
  borderRadius: 16,
  padding: "16px 20px",
  border: `1px solid ${borderColor}`,
  boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column",
  gap: 4,
});

const label = {
  fontSize: 12,
  color: "#6b7280",
  fontWeight: 500,
};

const value = {
  fontSize: 24,
  fontWeight: 800,
  color: "#0b1020",
};

const small = {
  fontSize: 11,
  color: "#6b7280",
};

const pill = (color) => ({
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 10,
  fontWeight: 700,
  color: "white",
  background: color,
});

// Variation où "plus" est bon (occupation, missions, urgences, confirmation, gains…)
function variationUpIsGood(current, previous) {
  const diff = current - previous;
  const pct = previous === 0 ? 0 : (diff / previous) * 100;
  const sign = diff > 0 ? "+" : diff < 0 ? "−" : "";
  const color = diff > 0 ? "#16a34a" : diff < 0 ? "#dc2626" : "#6b7280";
  return { diff, pct: Math.abs(Math.round(pct)), sign, color };
}

// Variation où "moins" est bon (temps d’acceptation / d’affectation)
function variationDownIsGood(current, previous) {
  const diff = current - previous;
  const pct = previous === 0 ? 0 : (diff / previous) * 100;
  const sign = diff > 0 ? "+" : diff < 0 ? "−" : "";
  // Ici, baisse = bon (vert), hausse = mauvais (rouge)
  const color = diff < 0 ? "#16a34a" : diff > 0 ? "#dc2626" : "#6b7280";
  return { diff, pct: Math.abs(Math.round(pct)), sign, color };
}

// MOCK DATA
const d = {
  missionsTotalJour: 230,
  missionsTotalHier: 210,
  urgencesJour: 18,
  urgencesHier: 15,
  tauxOccupationGlobal: 0.81,
  tauxOccupationHier: 0.76,
  tempsAcceptation: 1.8,
  tempsAcceptationHier: 2.1,
  tempsAffectation: 4.2,
  tempsAffectationHier: 4.0, // volontairement un peu meilleur hier
  tauxConfirmation: 82,
  tauxConfirmationHier: 78,
  tempsEconomiseMinutes: 112,
  tempsEconomiseHier: 96,
  appelsEvites: 74,
  appelsEvitesHier: 68,
  projectionMensuelleHeures: 56,
  vehicules: [
    { id: "VSL‑1", tempsMission: 5.3, tempsArret: 1.2, missions: 14 },
    { id: "VSL‑2", tempsMission: 4.9, tempsArret: 1.6, missions: 12 },
    { id: "AMB‑1", tempsMission: 5.7, tempsArret: 1.0, missions: 11 },
  ],
};

export default function StatsPageV4() {
  // Vue globale
  const varOcc = variationUpIsGood(d.tauxOccupationGlobal, d.tauxOccupationHier);
  const varMissions = variationUpIsGood(d.missionsTotalJour, d.missionsTotalHier);
  const varUrgences = variationUpIsGood(d.urgencesJour, d.urgencesHier);

  // Régulation
  const varAccept = variationDownIsGood(d.tempsAcceptation, d.tempsAcceptationHier);
  const varAffect = variationDownIsGood(d.tempsAffectation, d.tempsAffectationHier);
  const varConfirm = variationUpIsGood(d.tauxConfirmation, d.tauxConfirmationHier);

  // Gains
  const varGain = variationUpIsGood(
    d.tempsEconomiseMinutes,
    d.tempsEconomiseHier
  );

  return (
    <div style={page}>
      <h1 style={title}>Performance Bibulance</h1>

      {/* VUE GLOBALE */}
      <h2 style={sectionTitle}>Vue globale</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Occupation */}
        <div style={card("#63FFA9")}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={label}>Taux d’occupation</span>
            <span style={pill(varOcc.color)}>
              {varOcc.sign}
              {varOcc.pct}%
            </span>
          </div>
          <span style={value}>{Math.round(d.tauxOccupationGlobal * 100)}%</span>
          <span style={small}>Hier : {Math.round(d.tauxOccupationHier * 100)}%</span>
        </div>

        {/* Missions */}
        <div style={card("#5BF2F7")}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={label}>Missions du jour</span>
            <span style={pill(varMissions.color)}>
              {varMissions.sign}
              {varMissions.pct}%
            </span>
          </div>
          <span style={value}>{d.missionsTotalJour}</span>
          <span style={small}>Hier : {d.missionsTotalHier}</span>
        </div>

        {/* Urgences */}
        <div style={card("#FF5E79")}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={label}>Urgences absorbées</span>
            <span style={pill(varUrgences.color)}>
              {varUrgences.sign}
              {varUrgences.pct}%
            </span>
          </div>
          <span style={value}>{d.urgencesJour}</span>
          <span style={small}>Hier : {d.urgencesHier}</span>
        </div>
      </div>

      {/* RÉGULATION */}
      <h2 style={sectionTitle}>Régulation</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Acceptation (moins = mieux) */}
        <div style={card("#5BF2F7")}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={label}>Acceptation</span>
            <span style={pill(varAccept.color)}>
              {varAccept.sign}
              {varAccept.pct}%
            </span>
          </div>
          <span style={value}>{d.tempsAcceptation.toFixed(1)} min</span>
          <span style={small}>Hier : {d.tempsAcceptationHier.toFixed(1)} min</span>
        </div>

        {/* Affectation (moins = mieux, ici un peu moins bon) */}
        <div style={card("#63FFA9")}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={label}>Affectation</span>
            <span style={pill(varAffect.color)}>
              {varAffect.sign}
              {varAffect.pct}%
            </span>
          </div>
          <span style={value}>{d.tempsAffectation.toFixed(1)} min</span>
          <span style={small}>Hier : {d.tempsAffectationHier.toFixed(1)} min</span>
        </div>

        {/* Confirmation (plus = mieux) */}
        <div style={card("#C07EFF")}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={label}>Confirmation</span>
            <span style={pill(varConfirm.color)}>
              {varConfirm.sign}
              {varConfirm.pct}%
            </span>
          </div>
          <span style={value}>{d.tauxConfirmation}%</span>
          <span style={small}>Hier : {d.tauxConfirmationHier}%</span>
        </div>
      </div>

      {/* VÉHICULES */}
      <h2 style={sectionTitle}>Véhicules</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {d.vehicules.map((v) => {
          const taux = Math.round(
            (v.tempsMission / (v.tempsMission + v.tempsArret)) * 100
          );

          return (
            <div key={v.id} style={card("#e5e7eb")}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{v.id}</span>
                {taux > 80 && <span style={pill("#16a34a")}>Optimal</span>}
              </div>

              <span style={label}>Temps en mission</span>
              <span style={value}>{v.tempsMission} h</span>

              <span style={label}>Temps à l’arrêt</span>
              <span style={{ ...value, fontSize: 20 }}>{v.tempsArret} h</span>

              <span style={small}>
                Occupation : {taux}% — {v.missions} missions
              </span>
            </div>
          );
        })}
      </div>

      {/* GAINS OPÉRATIONNELS */}
      <h2 style={sectionTitle}>Gains opérationnels</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Temps économisé */}
        <div style={card("#63FFA9")}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={label}>Temps économisé</span>
            <span style={pill(varGain.color)}>
              {varGain.sign}
              {varGain.pct}%
            </span>
          </div>
          <span style={value}>{d.tempsEconomiseMinutes} min</span>
          <span style={small}>Hier : {d.tempsEconomiseHier} min</span>
        </div>

        {/* Appels évités */}
        <div style={card("#5BF2F7")}>
          <span style={label}>Appels évités</span>
          <span style={value}>{d.appelsEvites}</span>
          <span style={small}>Hier : {d.appelsEvitesHier}</span>
        </div>

        {/* Projection mensuelle */}
        <div style={card("#C07EFF")}>
          <span style={label}>Projection mensuelle</span>
          <span style={value}>{d.projectionMensuelleHeures} h</span>
        </div>
      </div>

      {/* SYNTHÈSE — sans doublon, cohérente, réaliste */}
      <h2 style={sectionTitle}>Synthèse</h2>
      <div style={card("#e5e7eb")}>
        <span style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>
          {d.missionsTotalJour} missions — {d.urgencesJour} urgences —{" "}
          {Math.round(d.tauxOccupationGlobal * 100)}% d’occupation
        </span>

        <span style={{ fontSize: 12, color: "#6b7280" }}>
          Acceptation et confirmation en amélioration.{" "}
          <span style={{ color: "#dc2626", fontWeight: 600 }}>
            Affectation plus lente ({varAffect.sign}
            {varAffect.pct}%).
          </span>
        </span>
      </div>
    </div>
  );
}
