import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RecapIteratif() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [transports, setTransports] = useState([]);

  // 🔹 Récupération du profil utilisateur comme dans Commander
  const user = JSON.parse(localStorage.getItem("user_profile") || "{}");

  // Format FR : "Lundi 12 mai 2025"
  const formatDateFR = (isoDate) => {
    const d = new Date(isoDate);
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Génération automatique des transports
  useEffect(() => {
    if (!state) return;

    const generated = [];
    const { days, end_date, count } = state;

    const dayIndex = {
      Lundi: 1,
      Mardi: 2,
      Mercredi: 3,
      Jeudi: 4,
      Vendredi: 5,
      Samedi: 6,
      Dimanche: 0,
    };

    const start = new Date();
    const end = end_date ? new Date(end_date) : null;

    let created = 0;

    for (let i = 0; i < 200; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const dayName = Object.keys(dayIndex).find(
        (k) => dayIndex[k] === d.getDay()
      );

      if (dayName && days[dayName].active) {
        generated.push({
          date: d.toISOString().split("T")[0],
          time: days[dayName].time,
          type: days[dayName].type,
          day: dayName,
        });

        created++;

        if (count && created >= Number(count)) break;
        if (end && d > end) break;
      }
    }

    setTransports(generated);
  }, [state]);

  const removeTransport = (index) => {
    setTransports((prev) => prev.filter((_, i) => i !== index));
  };

  
const envoyerMissionsIteratives = async () => {
  try {
    for (let t of transports) {
      const mission = {
        // Patient transporté (on part du même principe que Commander : pour soi)
        firstname: user.firstname,
        lastname:  user.lastname,
        phone:     user.phone,

        // Infos patient (si tu veux les gérer plus tard, tu peux les ajouter au state)
        patient_birthdate: state.patient_birthdate || null,
        patient_social_security: state.patient_social_security || null,

        // Trajet (hérités de Commander via TransportsIteratifs)
        depart_address: state.depart_address,
        arrival_address: state.arrival_address,

        // Date / heure (spécifiques à l’itératif)
        date: t.date,
        time: t.time,

        // Transport (même champ que Commander)
        transport_type: state.transport_type,

        // Raison / commentaire (hérités de Commander)
        reason: state.reason,
        comment: state.comment || "",
      };

      console.log("MISSION ITÉRATIVE ENVOYÉE =", mission);

      const res = await fetch("http://10.10.95.133:3001/missions/particulier", {


        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mission),
      });

      if (!res.ok) {
        console.error("Réponse serveur :", await res.text());
        throw new Error("Erreur serveur");
      }
    }

    navigate("/mission-success", {
      state: { message: "Transports itératifs créés avec succès !" },
    });
  } catch (error) {
    console.error("Erreur envoi itératif :", error);
    alert("Impossible d’envoyer les transports itératifs.");
  }
};



  if (!state) {
    return <p style={{ padding: 20 }}>Aucune donnée reçue.</p>;
  }

  /* --- STYLES BIBULANCE OFFICIELS --- */

  const pageContainer = {
    padding: 20,
    paddingBottom: 80,
    background: "linear-gradient(135deg, #ECFEFF 0%, #F3E8FF 100%)",
    minHeight: "100vh",
  };

  const card = {
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(10px)",
    borderRadius: 20,
    padding: 20,
    border: "1.5px solid rgba(91,242,247,0.35)",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const deleteBtn = {
    background: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
  };

  const submitBtn = {
    marginTop: 24,
    width: "100%",
    padding: 18,
    borderRadius: 999,
    border: "none",
    background: "#5BF2F7",
    color: "#0b1020",
    fontWeight: 700,
    fontSize: 18,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(91,242,247,0.4)",
  };

  return (
    <div style={pageContainer}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 16,
            color: "#0b1020",
          }}
        >
          Récapitulatif
        </h1>

        <p style={{ color: "#4b5563", marginBottom: 20 }}>
          Voici les transports générés automatiquement.  
          Vous pouvez en supprimer si nécessaire.
        </p>

        {/* LISTE DES TRANSPORTS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {transports.map((t, index) => (
            <div key={index} style={card}>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#0b1020",
                    textTransform: "capitalize",
                  }}
                >
                  {formatDateFR(t.date)}
                </div>

                <div style={{ fontSize: 15, color: "#4b5563", marginTop: 4 }}>
                  {t.time} — {t.type === "A" ? "Aller" : "Aller‑retour"}
                </div>
              </div>

              <button style={deleteBtn} onClick={() => removeTransport(index)}>
                Supprimer
              </button>
            </div>
          ))}
        </div>

        {/* 🚀 BOUTON QUI ENVOIE LES MISSIONS */}
        <button style={submitBtn} onClick={envoyerMissionsIteratives}>
          CONFIRMER
        </button>
      </div>
    </div>
  );
}
