import React from "react";

// === STYLE GLOBAL PREMIUM ===
const container = {
  padding: "10px 0",
};

const hero = {
  background: "linear-gradient(135deg, rgba(91,242,247,0.18), rgba(192,126,255,0.18))",
  borderRadius: 18,
  padding: "32px 36px",
  marginBottom: 28,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
};

const heroTitle = {
  fontSize: 32,
  fontWeight: 800,
  color: "#0b1020",
  marginBottom: 6,
};

const heroSubtitle = {
  fontSize: 16,
  color: "#4b5563",
  maxWidth: 600,
};

const card = (borderColor) => ({
  background: "#ffffff",
  borderRadius: 14,
  padding: "20px 24px",
  border: `1.5px solid ${borderColor}`,
  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column",
  gap: 8,
});

const actionCard = {
  background: "#ffffff",
  borderRadius: 14,
  padding: "22px 26px",
  border: "1.5px solid #e5e7eb",
  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
  transition: "0.2s",
};

const actionHover = {
  transform: "translateY(-3px)",
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
};

const label = {
  fontSize: 13,
  color: "#6b7280",
  fontWeight: 500,
};

const value = {
  fontSize: 32,
  fontWeight: 700,
  color: "#0b1020",
};

const sectionTitle = {
  fontSize: 22,
  fontWeight: 700,
  marginBottom: 14,
  color: "#0b1020",
};

// === ICONES THIN ===
const Icon = {
  urgent: (
    <svg width="22" height="22" stroke="#FF5E79" fill="none" strokeWidth="1.5">
      <path d="M12 2c2 3 4 4 4 7a4 4 0 11-8 0c0-3 2-4 4-7z" />
    </svg>
  ),
  calendar: (
    <svg width="22" height="22" stroke="#5BF2F7" fill="none" strokeWidth="1.5">
      <rect x="3" y="5" width="16" height="14" rx="2" />
      <path d="M3 10h16" />
    </svg>
  ),
  vehicle: (
    <svg width="22" height="22" stroke="#63FFA9" fill="none" strokeWidth="1.5">
      <rect x="3" y="8" width="16" height="8" rx="2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="15" cy="17" r="2" />
    </svg>
  ),
  arrow: (
    <svg width="20" height="20" stroke="#0b1020" fill="none" strokeWidth="1.5">
      <path d="M5 10h10M12 7l3 3-3 3" />
    </svg>
  ),
};

export default function HomePage({ setPage }) {   // ✔ IMPORTANT : AJOUT DE setPage
  const urgentes = 3;
  const programmees = 12;
  const vehicules = 5;

  return (
    <div style={container}>

      {/* HERO PREMIUM */}
      <div style={hero}>
        <h1 style={heroTitle}>Bienvenue sur Bibulance</h1>
        <p style={heroSubtitle}>
          Votre cockpit premium pour la régulation sanitaire.  
          Une interface pensée pour la rapidité, la fiabilité et la prise de décision.
        </p>
      </div>

      {/* KPIs DU JOUR */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 18,
        marginBottom: 32
      }}>
        <div style={card("#FF5E79")}>
          {Icon.urgent}
          <span style={label}>Missions urgentes en attente</span>
          <span style={value}>{urgentes}</span>
        </div>

        <div style={card("#5BF2F7")}>
          {Icon.calendar}
          <span style={label}>Missions programmées</span>
          <span style={value}>{programmees}</span>
        </div>

        <div style={card("#63FFA9")}>
          {Icon.vehicle}
          <span style={label}>Véhicules en déplacement</span>
          <span style={value}>{vehicules}</span>
        </div>
      </div>

      {/* ACTIONS RAPIDES */}
      <h2 style={sectionTitle}>Actions rapides</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 18,
        marginBottom: 40
      }}>
        
        {/* ✔ Aller vers Missions */}
        <div
          style={actionCard}
          onClick={() => setPage("missions")}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, actionHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, actionCard)}
        >
          <span style={{ fontSize: 18, fontWeight: 600, color: "#0b1020" }}>
            Voir les missions
          </span>
          {Icon.arrow}
        </div>

        {/* ✔ Aller vers Statistiques */}
        <div
          style={actionCard}
          onClick={() => setPage("stats")}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, actionHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, actionCard)}
        >
          <span style={{ fontSize: 18, fontWeight: 600, color: "#0b1020" }}>
            Voir les statistiques
          </span>
          {Icon.arrow}
        </div>
      </div>

      {/* VALEUR AJOUTÉE */}
      <h2 style={sectionTitle}>Pourquoi choisir Bibulance ?</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 18,
        marginBottom: 40
      }}>
        <div style={card("#C07EFF")}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Rapidité</span>
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            Une interface pensée pour réduire le temps d’acceptation et d’affectation.
          </p>
        </div>

        <div style={card("#5BF2F7")}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Fiabilité</span>
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            Des données centralisées, des erreurs évitées, une régulation plus sûre.
          </p>
        </div>

        <div style={card("#63FFA9")}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Efficacité</span>
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            Une vision claire de l’activité pour prendre les meilleures décisions.
          </p>
        </div>
      </div>

    </div>
  );
}
