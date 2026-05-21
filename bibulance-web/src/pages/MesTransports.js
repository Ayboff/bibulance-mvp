import { useEffect, useState } from "react";

export default function MesTransports() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);

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

  const calculerHeureEstimee = (rdv_time) => {
    if (!rdv_time) return "—";
    const d = new Date(rdv_time);
    d.setMinutes(d.getMinutes() - 45);
    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://10.10.95.133:3001/missions", {


          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
        });

        const data = await res.json();
        console.log("DATA MOBILE =", data);

        // ⭐ CORRECTION : filtrer sur data, pas sur missions
        const missionsMobile = data
          .filter((m) =>
            (m.source_platform || "").toLowerCase().includes("bibulance")
          )
          .map((m) => {
            let rdv = null;

            if (m.rdv_time && typeof m.rdv_time === "string") {
              const raw = m.rdv_time.includes("T")
                ? m.rdv_time
                : m.rdv_time.replace(" ", "T");

              const d = new Date(raw);
              if (!isNaN(d.getTime())) rdv = raw;
            }

            return {
              ...m,
              rdv_time: rdv,
              emitter_facility: m.emitter_facility || "Adresse non renseignée",
              destination_facility:
                m.destination_facility || "Adresse non renseignée",
            };
          });

        // ⭐ CORRECTION : setMissions(missionsMobile)
        setMissions(missionsMobile);
      } catch (e) {
        console.error("ERREUR FETCH :", e);
      }

      setLoading(false);
    }

    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();

  const upcoming = missions
    .filter((m) => m.rdv_time && new Date(m.rdv_time) > now)
    .sort((a, b) => new Date(a.rdv_time) - new Date(b.rdv_time));

  const past = missions
    .filter((m) => m.rdv_time && new Date(m.rdv_time) <= now)
    .sort((a, b) => new Date(b.rdv_time) - new Date(a.rdv_time));

  return (
    <div style={pageContainer}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            marginBottom: 16,
            color: "#0b1020",
          }}
        >
          Mes transports
        </h1>

        {loading && (
          <p style={{ color: "#6b7280", textAlign: "center" }}>
            Chargement…
          </p>
        )}

        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 12,
            color: "#0b1020",
          }}
        >
          À venir
        </h2>

        {upcoming.length === 0 && (
          <p style={{ color: "#6b7280", marginBottom: 20 }}>
            Aucun transport à venir.
          </p>
        )}

        {upcoming.map((m) => (
          <div key={m.id} style={card}>
  
  {/* Ligne 1 : Date + statut */}
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div style={{ fontSize: 18, fontWeight: 700, color: "#0b1020" }}>
      {new Date(m.rdv_time).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </div>

    <div
      style={{
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 700,
        background:
          m.status === "urgente"
            ? "rgba(255,94,121,0.15)"
            : "rgba(91,242,247,0.15)",
        color: m.status === "urgente" ? "#7a0014" : "#003b44",
      }}
    >
      {m.status === "urgente" ? "Urgente" : "Programmée"}
    </div>
  </div>

  {/* Ligne 2 : Trajet simplifié */}
  <div style={{ marginTop: 14, fontSize: 18, fontWeight: 600, color: "#0b1020" }}>
    {m.emitter_facility} → {m.destination_facility}
  </div>

  {/* Ligne 3 : Type de transport */}
  <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
    <span style={{ fontSize: 24 }}>
      {m.vehicle_type === "AMB" ? "🚑" : "🚕"}
    </span>
    <span style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>
      {m.vehicle_type === "AMB"
        ? "Couché (Ambulance)"
        : "Assis (Taxi / VSL)"}
    </span>
  </div>

  {/* Ligne 4 : PEC */}
  <div style={{ marginTop: 16, fontSize: 15, color: "#4b5563" }}>
    Heure estimée de prise en charge :{" "}
    <strong>{calculerHeureEstimee(m.rdv_time)}</strong>
  </div>

</div>

          
        ))}

        <div
          onClick={() => setShowPast(!showPast)}
          style={{
            marginTop: 20,
            marginBottom: 12,
            fontSize: 18,
            fontWeight: 700,
            color: "#0b1020",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Transports passés</span>
          <span style={{ fontSize: 22 }}>{showPast ? "▲" : "▼"}</span>
        </div>

        {showPast && (
          <div>
            {past.length === 0 && (
              <p style={{ color: "#6b7280" }}>Aucun transport passé.</p>
            )}

            {past.map((m) => (
              <div key={m.id} style={card}>
                <div
                  style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}
                >
                  Date & heure
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#0b1020",
                    marginBottom: 16,
                  }}
                >
                  {new Date(m.rdv_time).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div
                  style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}
                >
                  Trajet
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: "#111827",
                    marginBottom: 16,
                  }}
                >
                  {m.emitter_facility} → {m.destination_facility}
                </div>

                <div
                  style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}
                >
                  Type de transport
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: "#111827",
                    marginBottom: 16,
                  }}
                >
                  {m.vehicle_type === "AMB"
                    ? "Ambulance (couché)"
                    : "VSL / Taxi (assis)"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
