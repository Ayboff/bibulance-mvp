import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";


export default function TransportsIteratifs() {
  const navigate = useNavigate();
  const { state: commanderForm } = useLocation();

  // 🔹 Récupération du profil utilisateur (comme Commander)
  const user = JSON.parse(localStorage.getItem("user_profile") || "{}");

  const days = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];
const getDefaultTime = () => {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

  const [form, setForm] = useState({
  ...(commanderForm || {}),

  days: {
    Lundi:    { active: false, time: getDefaultTime(), type: "A" },
    Mardi:    { active: false, time: getDefaultTime(), type: "A" },
    Mercredi: { active: false, time: getDefaultTime(), type: "A" },
    Jeudi:    { active: false, time: getDefaultTime(), type: "A" },
    Vendredi: { active: false, time: getDefaultTime(), type: "A" },
    Samedi:   { active: false, time: getDefaultTime(), type: "A" },
    Dimanche: { active: false, time: getDefaultTime(), type: "A" },
  },

  end_date: "",
  count: "",
});



  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          active: !prev.days[day].active,
        },
      },
    }));
  };

  const updateDayField = (day, field, value) => {
    setForm((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          [field]: value,
        },
      },
    }));
  };

  // 🔥 ENVOI COMPLET VERS RecapIteratif
  const handleSubmit = () => {
    navigate("/iteratif/recap", {
      state: {
        ...form,
        user, // 🔥 obligatoire pour RecapIteratif
      },
    });
  };

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
    padding: 24,
    marginBottom: 24,
    border: "1.5px solid rgba(91,242,247,0.35)",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  };

  const dayCard = (active) => ({
    ...card,
    padding: 18,
    marginBottom: 16,
    border: active
      ? "2px solid #5BF2F7"
      : "1.5px solid rgba(91,242,247,0.35)",
    background: active
      ? "rgba(255,255,255,0.95)"
      : "rgba(255,255,255,0.75)",
    cursor: "pointer",
  });

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #CBD5E1",
    fontSize: 16,
    background: "#ffffff",
  };

  const smallBtn = (selected) => ({
    padding: "6px 12px",
    borderRadius: 10,
    border: selected ? "2px solid #5BF2F7" : "1px solid #CBD5E1",
    background: selected ? "#ECFEFF" : "#fff",
    fontWeight: 600,
    cursor: "pointer",
  });

  const submitBtn = {
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
            marginBottom: 20,
            color: "#0b1020",
          }}
        >
          Transports itératifs
        </h1>

        {/* ⭐ SECTION : ADRESSES */}
        <div style={card}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Trajet
          </h2>

          <label style={{ fontSize: 14, color: "#374151" }}>
            Adresse de départ
          </label>
          <input
            type="text"
            value={form.depart_address}
            onChange={(e) =>
              setForm({ ...form, depart_address: e.target.value })
            }
            placeholder="Ex : 2 Rue Pierre de Ronsard, Toulouse"
            style={{ ...inputStyle, marginTop: 6, marginBottom: 16 }}
          />

          <label style={{ fontSize: 14, color: "#374151" }}>
            Adresse d’arrivée
          </label>
          <input
            type="text"
            value={form.arrival_address}
            onChange={(e) =>
              setForm({ ...form, arrival_address: e.target.value })
            }
            placeholder="Ex : CHU Corbeil"
            style={{ ...inputStyle, marginTop: 6 }}
          />
        </div>

        {/* ⭐ SECTION : TYPE DE TRANSPORT */}
        <div style={card}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Type de transport
          </h2>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              style={smallBtn(form.transport_type === "AMB")}
              onClick={() => setForm({ ...form, transport_type: "AMB" })}
            >
              Ambulance (couché)
            </button>

            <button
              type="button"
              style={smallBtn(form.transport_type === "VSL")}
              onClick={() => setForm({ ...form, transport_type: "VSL" })}
            >
              VSL / Taxi (assis)
            </button>
          </div>
        </div>

        {/* ⭐ SECTION : RAISON */}
        <div style={card}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Raison du transport
          </h2>

          <input
            type="text"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Ex : Consultation, Dialyse, Examen…"
            style={inputStyle}
          />
        </div>

        {/* ⭐ SECTION : COMMENTAIRE */}
        <div style={card}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Commentaire
          </h2>

          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            placeholder="Informations complémentaires"
            style={{ ...inputStyle, height: 90 }}
          />
        </div>

        {/* ⭐ SECTION : JOURS */}
        <div style={card}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Sélection des jours
          </h2>

          {days.map((day) => {
            const d = form.days[day];
            return (
              <div
                key={day}
                style={dayCard(d.active)}
                onClick={() => toggleDay(day)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <strong style={{ fontSize: 16 }}>{day}</strong>

                  <div
                    style={{
                      width: 46,
                      height: 26,
                      borderRadius: 999,
                      background: d.active ? "#5BF2F7" : "#D1D5DB",
                      position: "relative",
                      transition: "0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "#fff",
                        position: "absolute",
                        top: 2,
                        left: d.active ? 22 : 2,
                        transition: "0.2s",
                      }}
                    />
                  </div>
                </div>

                {d.active && (
                  <div style={{ marginTop: 16 }}>
                    <label style={{ fontSize: 14, color: "#374151" }}>
                      Heure
                    </label>
                    <input
  type="time"
  value={form.days[day].time}
  onClick={(e) => e.stopPropagation()}   // 🔥 empêche toggleDay
  onChange={(e) => updateDayField(day, "time", e.target.value)}
  style={{ ...inputStyle, marginTop: 6 }}
/>


                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        marginTop: 14,
                      }}
                    >
                      <button
  type="button"
  onClick={(e) => {
    e.stopPropagation();                 // 🔥 empêche toggleDay
    updateDayField(day, "type", "A");
  }}
  style={smallBtn(d.type === "A")}
>
  Aller
</button>


                      <button
  type="button"
  onClick={(e) => {
    e.stopPropagation();                 // 🔥 empêche toggleDay
    updateDayField(day, "type", "AR");
  }}
  style={smallBtn(d.type === "AR")}
>
  Aller-retour
</button>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ⭐ SECTION : DURÉE */}
        <div style={card}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Durée
          </h2>

          <label style={{ fontSize: 14, color: "#374151" }}>
            Jusqu’à une date
          </label>
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            style={{ ...inputStyle, marginTop: 6, marginBottom: 16 }}
          />

          <div
            style={{
              textAlign: "center",
              margin: "12px 0",
              color: "#6b7280",
              fontWeight: 600,
            }}
          >
            OU
          </div>

          <label style={{ fontSize: 14, color: "#374151" }}>
            Nombre de transports
          </label>
          <input
            type="number"
            placeholder="Ex : 12"
            value={form.count}
            onChange={(e) => setForm({ ...form, count: e.target.value })}
            style={{ ...inputStyle, marginTop: 6 }}
          />
        </div>

        <p style={{ color: "#4b5563", fontSize: 14, marginBottom: 20 }}>
          Après avoir appuyé sur "Suivant", vous verrez un récapitulatif des
          transports générés automatiquement.
        </p>

        <button style={submitBtn} onClick={handleSubmit}>
          SUIVANT
        </button>
      </div>
    </div>
  );
}
