import React from "react";

const HomePage = ({ setPage }) => {
  return (
    <div style={{ padding: 20 }}>
      {/* TITRE */}
      <h1
        style={{
          textAlign: "center",
          width: "100%",
          marginBottom: 10,
          fontSize: 32,
          fontWeight: 600,
          color: "#1f2937",
          letterSpacing: 0.5,
        }}
      >
        Bienvenue sur Bibulance
      </h1>

      {/* SOUS-TITRE */}
      <p
        style={{
          textAlign: "center",
          fontSize: 16,
          color: "#4b5563",
          marginBottom: 30,
        }}
      >
        Tableau de bord premium pour la régulation des transports sanitaires.
      </p>

      {/* CARTES D'ACTIONS RAPIDES */}
      <div
        style={{
          display: "flex",
          gap: 20,
          justifyContent: "center",
          marginBottom: 40,
        }}
      >
        {/* Carte Missions */}
        <div
          onClick={() => setPage("missions")}
          style={{
            width: 260,
            padding: 20,
            borderRadius: 16,
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-4px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h3 style={{ margin: 0, fontSize: 20, color: "#0b1020" }}>
            🚑 Missions
          </h3>
          <p style={{ marginTop: 8, fontSize: 14, color: "#6b7280" }}>
            Accéder à la liste complète des missions en temps réel.
          </p>
        </div>

        {/* Carte Statistiques */}
        <div
          onClick={() => setPage("stats")}
          style={{
            width: 260,
            padding: 20,
            borderRadius: 16,
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-4px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h3 style={{ margin: 0, fontSize: 20, color: "#0b1020" }}>
            📊 Statistiques
          </h3>
          <p style={{ marginTop: 8, fontSize: 14, color: "#6b7280" }}>
            Visualiser les performances et les indicateurs clés.
          </p>
        </div>

        {/* Carte Commandes */}
        <div
          style={{
            width: 260,
            padding: 20,
            borderRadius: 16,
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            opacity: 0.6,
            cursor: "not-allowed",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 20, color: "#0b1020" }}>
            📦 Commandes
          </h3>
          <p style={{ marginTop: 8, fontSize: 14, color: "#6b7280" }}>
            Bientôt disponible.
          </p>
        </div>
      </div>

      {/* BLOC INFO */}
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: 20,
          borderRadius: 16,
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          textAlign: "center",
        }}
      >
        <h3 style={{ margin: 0, fontSize: 18, color: "#1f2937" }}>
          Pourquoi Bibulance ?
        </h3>
        <p style={{ marginTop: 10, fontSize: 15, color: "#4b5563" }}>
          Une interface pensée pour les régulateurs, optimisée pour la rapidité,
          la lisibilité et la prise de décision en situation réelle.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
