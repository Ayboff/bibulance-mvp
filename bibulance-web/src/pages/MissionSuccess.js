import { useLocation, useNavigate } from "react-router-dom";

export default function MissionSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const estimatedPickup = location.state?.estimatedPickup || "—";

  /* --- STYLES BIBULANCE OFFICIELS --- */

  const pageContainer = {
    padding: 20,
    paddingBottom: 80,
    background: "linear-gradient(135deg, #ECFEFF 0%, #F3E8FF 100%)",
    minHeight: "100vh",
    textAlign: "center",
  };

  const card = {
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(10px)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    border: "1.5px solid rgba(91,242,247,0.35)",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    textAlign: "left",
    maxWidth: 520,
    margin: "0 auto 24px auto",
  };

  const title = {
    fontSize: 26,
    fontWeight: 700,
    color: "#0b1020",
    marginBottom: 10,
  };

  const subtitle = {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 1.5,
    marginBottom: 24,
  };

  const submitBtn = {
    padding: 18,
    borderRadius: 999,
    border: "none",
    background: "#5BF2F7",
    color: "#0b1020",
    fontWeight: 700,
    fontSize: 18,
    cursor: "pointer",
    width: "100%",
    maxWidth: 320,
    margin: "0 auto",
    boxShadow: "0 4px 12px rgba(91,242,247,0.4)",
  };

  return (
    <div style={pageContainer}>
      
      {/* Check animé premium */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#63FFA9,#5BF2F7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px auto",
          animation: "pop 0.5s ease-out",
        }}
      >
        <span style={{ fontSize: 60, color: "#0b1020" }}>✔</span>
      </div>

      {/* Titre */}
      <h1 style={title}>Mission envoyée avec succès</h1>

      {/* Message rassurant */}
      <p style={subtitle}>
        Votre demande a bien été prise en compte.  
        Nos équipes préparent votre prise en charge.
      </p>

      {/* Carte d'information */}
      <div style={card}>
        <strong style={{ color: "#0b1020", fontSize: 16 }}>
          Heure estimée de prise en charge :
        </strong>
        <div
          style={{
            fontSize: 22,
            marginTop: 6,
            color: "#111827",
            fontWeight: 700,
          }}
        >
          {estimatedPickup}
        </div>

        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 10 }}>
          Cette estimation s’ajuste automatiquement selon l’heure de rendez‑vous.
        </p>
      </div>

      {/* CTA */}
      <button style={submitBtn} onClick={() => navigate("/mes-transports")}>
        Voir mes transports
      </button>

      {/* Animation CSS */}
      <style>
        {`
          @keyframes pop {
            0% { transform: scale(0.6); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
