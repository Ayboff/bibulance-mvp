import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Commander() {
  const navigate = useNavigate();

  // Chargement du profil utilisateur
  const user = JSON.parse(localStorage.getItem("user_profile") || "{}");

  const [form, setForm] = useState({
  // Trajet
  depart_address: "",
  arrival_address: "",

  // Raison
  reason: "",
  reason_other: "",

  // Date / heure
  date: "",
  time: "",
  estimated_pickup: "",
  trip_type: "aller",
  return_date: "",
  return_time: "",
  estimated_pickup_return: "",

  // Transport
  transport_type: "",

  // Particularités
  accompagnant: false,
  deambulateur: false,
  fauteuil: false,
  bmr: false,
  oxygene: false,
  comment: "",

  // Commande pour un proche ?
  ordered_for_someone: false,

  // Suggestions séparées
  addressSuggestionsDepart: [],
  addressSuggestionsArrival: [],

  // Demandeur (si proche)
  relative_firstname: "",
  relative_lastname: "",
  relative_relation: "",
  relative_phone: user.phone || "",

  // Patient transporté
  patient_firstname: "",
  patient_lastname: "",
  patient_birthdate: "",
  patient_social_security: "",
  patient_phone: "",

  // Auto‑remplissage
  auto_depart_address: user.address || "",
  auto_arrival_address: "",
});


  const computeEstimatedPickup = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const d = new Date();
    d.setHours(h);
    d.setMinutes(m - 45);
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (form.time) {
      setForm((prev) => ({
        ...prev,
        estimated_pickup: computeEstimatedPickup(prev.time),
      }));
    }
  }, [form.time]);

  useEffect(() => {
    if (form.return_time) {
      setForm((prev) => ({
        ...prev,
        estimated_pickup_return: computeEstimatedPickup(prev.return_time),
      }));
    }
  }, [form.return_time]);
  // AUTO-REMPLISSAGE INTELLIGENT AU CHARGEMENT
useEffect(() => {
  // Si commande pour soi-même → on remplit automatiquement
  if (!form.ordered_for_someone) {
    setForm((prev) => ({
      ...prev,
      depart_address: user.address || prev.depart_address,
    }));
  }
}, [form.ordered_for_someone]);
// Sauvegarde automatique de la dernière adresse d'arrivée
useEffect(() => {
  if (form.arrival_address) {
    localStorage.setItem("last_arrival_address", form.arrival_address);
  }
}, [form.arrival_address]);
useEffect(() => {
  const lastArrival = localStorage.getItem("last_arrival_address");
  if (lastArrival && !form.arrival_address) {
    setForm((prev) => ({ ...prev, arrival_address: lastArrival }));
  }
}, []);



  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  // ⭐ DEBOUNCE GLOBAL POUR NOMINATIM
let debounceTimer = null;

// ⭐ AUTOCOMPLÉTION D’ADRESSES (Nominatim + Debounce)
const fetchAddressSuggestions = (query, field) => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    if (!query || query.length < 3) {
      setForm((prev) => ({
        ...prev,
        addressSuggestionsDepart: [],
        addressSuggestionsArrival: []
      }));
      return;
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&addressdetails=1&limit=5&countrycodes=fr`;

      const res = await fetch(url, {
        headers: { "User-Agent": "Bibulance-MVP/1.0" }
      });

      const data = await res.json();

      // Nettoyage
      const cleaned = data.map((item) => {
        const a = item.address || {};
        const street = [a.house_number, a.road].filter(Boolean).join(" ");
        const city = a.city || a.town || a.village || "";
        const postcode = a.postcode || "";
        return {
          ...item,
          cleaned_label: `${street}, ${postcode} ${city}`.trim()
        };
      });

      setForm((prev) => ({
        ...prev,
        [field === "depart" ? "addressSuggestionsDepart" : "addressSuggestionsArrival"]: cleaned
      }));
    } catch (error) {
      console.error("Erreur Nominatim :", error);
    }
  }, 400);
};


// ⭐ GÉOLOCALISATION AUTOMATIQUE
const fillAddressFromGPS = () => {
  if (!navigator.geolocation) {
    alert("La géolocalisation n'est pas supportée.");
    return;
    
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;

      const res = await fetch(url, {
        headers: { "User-Agent": "Bibulance-MVP/1.0" }
      });

      const data = await res.json();
      const a = data.address || {};

      const street = [a.house_number, a.road].filter(Boolean).join(" ");
      const city = a.city || a.town || a.village || "";
      const postcode = a.postcode || "";

      const finalAddress = `${street}, ${postcode} ${city}`;

      setForm((prev) => ({
        ...prev,
        depart_address: finalAddress
      }));
    } catch (error) {
      console.error(error);
      alert("Impossible de récupérer votre adresse.");
    }
  });
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ Vérification identité obligatoire
 // 🧩 CAS 1 : Le patient commande pour lui-même
if (!form.ordered_for_someone) {
  if (
    !user.firstname ||
    !user.lastname ||
    !user.social_security ||
    !user.phone
  ) {
    alert(
      "Pour commander un transport, vous devez d'abord renseigner votre nom, prénom, numéro de sécurité sociale et téléphone."
    );
    navigate("/compte");
    return;
  }
}

// 🧩 CAS 2 : Un proche commande → on vérifie uniquement le patient transporté
if (form.ordered_for_someone) {
  if (
    !form.patient_firstname ||
    !form.patient_lastname ||
    !form.patient_birthdate ||
    !form.patient_social_security
  ) {
    alert("Veuillez renseigner toutes les informations du patient transporté.");
    return;
  }
}

if (form.ordered_for_someone) {
  if (
    !form.patient_firstname ||
    !form.patient_lastname ||
    !form.patient_birthdate ||
    !form.patient_social_security
  ) {
    alert("Veuillez renseigner toutes les informations du patient transporté.");
    return;
  }
}

  // ✅ Construction de la mission EXACTEMENT comme attendue par le dashboard
  const mission = {
  // Patient transporté
  firstname: form.ordered_for_someone ? form.patient_firstname : user.firstname,
  lastname: form.ordered_for_someone ? form.patient_lastname : user.lastname,
  phone: form.ordered_for_someone ? form.patient_phone : user.phone,

  // Infos patient essentielles
  patient_birthdate: form.patient_birthdate,
  patient_social_security: form.patient_social_security,

  // Trajet
  depart_address: form.depart_address,
  arrival_address: form.arrival_address,
  date: form.date,
  time: form.time,
  transport_type: form.transport_type,
  reason: form.reason === "Autre" ? form.reason_other : form.reason,
  comment: form.comment,
};




  console.log("Mission envoyée :", mission);

  try {
const response = await fetch("http://192.168.66.50:3001/missions/particulier", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(mission),
});



    if (!response.ok) {
      throw new Error("Erreur lors de l’envoi de la mission");
    }

    const createdMission = await response.json();

    const missionId =
      createdMission.id ||
      `mobile-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    navigate("/mission-success", {
      state: {
        missionId,
        estimatedPickup: form.estimated_pickup,
      },
    });
  } catch (error) {
    console.error(error);
    alert("Impossible d’envoyer la mission. Réessayez plus tard.");
  }
};




  return (
    
    
    <div style={pageContainer}>
      <div style={formWrapper}>

        {/* ⭐ LOGO BIBULANCE (100% FONCTIONNEL) */}
      <img
  src="/logo-bibulance.png"
  alt="Logo Bibulance"
  style={{
    width: 320,
    height: "auto",
    display: "block",
    margin: "0 auto 24px auto",
  }}
/>











      {/* HEADER PREMIUM ACCESSIBLE */}
     <div style={{ marginTop: "0px" }}>
  {/* Section Trajet */}
</div>

     


        <form onSubmit={handleSubmit}>
          {/* BLOC : QUI COMMANDE ? */}
<div style={card}>
  <h2 style={sectionTitle}>Je commande  pour…</h2>

  <label style={radioLine}>
    <input
      type="radio"
      name="ordered_for_someone"
      checked={!form.ordered_for_someone}
      onChange={() => handleChange("ordered_for_someone", false)}
      style={radioInput}
    />
    <span style={radioText}>Moi-même</span>
  </label>

  <label style={radioLine}>
    <input
      type="radio"
      name="ordered_for_someone"
      checked={form.ordered_for_someone}
      onChange={() => handleChange("ordered_for_someone", true)}
      style={radioInput}
    />
    <span style={radioText}>Pour un proche</span>
  </label>
</div>
{form.ordered_for_someone && (
  <div style={card}>
    <h2 style={sectionTitle}>Informations du demandeur</h2>

    <Input
      label="Votre prénom"
      value={form.relative_firstname}
      onChange={(v) => handleChange("relative_firstname", v)}
    />

    <Input
      label="Votre nom"
      value={form.relative_lastname}
      onChange={(v) => handleChange("relative_lastname", v)}
    />

    <Input
      label="Lien avec le patient (ex : Fils, Voisin, Aidant)"
      value={form.relative_relation}
      onChange={(v) => handleChange("relative_relation", v)}
    />

    <Input
      label="Votre téléphone"
      value={form.relative_phone}
      onChange={(v) => handleChange("relative_phone", v)}
    />
  </div>
)}
{form.ordered_for_someone && (
  <div style={card}>
    <h2 style={sectionTitle}>Patient transporté</h2>

    <Input
      label="Prénom du patient"
      value={form.patient_firstname}
      onChange={(v) => handleChange("patient_firstname", v)}
    />

    <Input
      label="Nom du patient"
      value={form.patient_lastname}
      onChange={(v) => handleChange("patient_lastname", v)}
    />

    <Input
      type="date"
      label="Date de naissance"
      value={form.patient_birthdate}
      onChange={(v) => handleChange("patient_birthdate", v)}
    />

    <Input
      label="Numéro de sécurité sociale"
      value={form.patient_social_security}
      onChange={(v) => handleChange("patient_social_security", v)}
    />

    <Input
      label="Téléphone du patient (optionnel)"
      value={form.patient_phone}
      onChange={(v) => handleChange("patient_phone", v)}
    />
  </div>
)}

          {/* BLOC 1 : TRAJET */}
          <div style={card}>
  <h2 style={sectionTitle}>Trajet</h2>

  {/* WRAPPER GLOBAL QUI PERMET AUX SUGGESTIONS DE SORTIR DU CARD */}
  <div style={{ position: "relative", overflow: "visible" }}>
    
    <button
      type="button"
      onClick={fillAddressFromGPS}
      style={{
        marginBottom: 12,
        padding: "10px 14px",
        borderRadius: 12,
        background: "#ECFEFF",
        border: "1px solid #5BF2F7",
        fontSize: 16,
        cursor: "pointer"
      }}
    >
      📍 Utiliser ma position
    </button>

    <Input
      label="Adresse de départ"
      value={form.depart_address}
      onChange={(v) => {
        handleChange("depart_address", v);
        fetchAddressSuggestions(v, "depart");
      }}
    />

    {/* ⭐ SUGGESTIONS SORTENT DU CARD GRÂCE AU WRAPPER */}
    {form.addressSuggestionsDepart.length > 0 && (
      <div style={suggestionsBox}>
        {form.addressSuggestionsDepart.map((s) => (
          <div
            key={s.place_id || s.osm_id}
            style={suggestionItem}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(91,242,247,0.12)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            onClick={() => {
              handleChange("depart_address", s.cleaned_label);
              handleChange("addressSuggestionsDepart", []);
            }}
          >
            {s.cleaned_label}
          </div>
        ))}
      </div>
    )}
  </div>



<div style={{ position: "relative", overflow: "visible" }}>
  <Input
    label="Adresse d’arrivée"
    value={form.arrival_address}
    onChange={(v) => {
      handleChange("arrival_address", v);
      fetchAddressSuggestions(v, "arrival");
    }}
  />

  {form.addressSuggestionsArrival.length > 0 && (
    <div style={suggestionsBox}>
      {form.addressSuggestionsArrival.map((s) => (
        <div
          key={s.place_id || s.osm_id}
          style={suggestionItem}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(91,242,247,0.12)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          onClick={() => {
            handleChange("arrival_address", s.cleaned_label);
            handleChange("addressSuggestionsArrival", []);
          }}
        >
          {s.cleaned_label}
        </div>
      ))}
    </div>
  )}
</div>



          </div>

          {/* BLOC 2 : RAISON */}
          <div style={card}>
            <h2 style={sectionTitle}>Raison du transport</h2>
            <div style={radioGroup}>
              {[
                "Consultation / Examen",
                "Hospitalisation",
                "Sortie d’hospitalisation / EHPAD",
                "Chimiothérapie",
                "Dialyse",
                "Radiothérapie",
                "Permission médicale",
                "Autre",
              ].map((item) => (
                <label key={item} style={radioLine}>
                  <input
                    type="radio"
                    name="reason"
                    value={item}
                    checked={form.reason === item}
                    onChange={() => handleChange("reason", item)}
                    style={radioInput}
                  />
                  <span style={radioText}>{item}</span>
                </label>
              ))}
            </div>

            {form.reason === "Autre" && (
              <input
                type="text"
                placeholder="Précisez la raison"
                value={form.reason_other}
                onChange={(e) => handleChange("reason_other", e.target.value)}
                style={inputStyle}
              />
            )}
          </div>

          {/* BLOC 3 : DATE + HEURE + PEC */}
          <div style={card}>
            <h2 style={sectionTitle}>Date et heure</h2>
            <Input
              type="date"
              label="Date du transport"
              value={form.date}
              onChange={(v) => handleChange("date", v)}
            />
            <Input
              type="time"
              label="Heure de rendez-vous"
              value={form.time}
              onChange={(v) => handleChange("time", v)}
            />

            {form.estimated_pickup && (
              <EstimatedBox
                label="Heure de prise en charge estimée"
                value={form.estimated_pickup}
              />
            )}
          </div>

          {/* BLOC 4 : TYPE DE TRAJET */}
          <div style={card}>
            <h2 style={sectionTitle}>Type de trajet</h2>

            <label style={radioLine}>
              <input
                type="radio"
                name="trip_type"
                value="aller"
                checked={form.trip_type === "aller"}
                onChange={() => handleChange("trip_type", "aller")}
                style={radioInput}
              />
              <span style={radioText}>Aller simple</span>
            </label>

            <label style={radioLine}>
              <input
                type="radio"
                name="trip_type"
                value="aller-retour"
                checked={form.trip_type === "aller-retour"}
                onChange={() => handleChange("trip_type", "aller-retour")}
                style={radioInput}
              />
              <span style={radioText}>Aller-retour</span>
            </label>

            <div
  style={iteratifCard}
  onClick={() => navigate("/iteratif", { state: form })}
>

              <h3 style={iteratifTitle}>Transports itératifs</h3>
              <p style={iteratifText}>
                Programmez des transports réguliers (dialyse, chimio, etc.).
              </p>
            </div>
          </div>

          {/* BLOC RETOUR */}
          {form.trip_type === "aller-retour" && (
            <div style={card}>
              <h2 style={sectionTitle}>Retour</h2>
              <Input
                type="date"
                label="Date du retour"
                value={form.return_date}
                onChange={(v) => handleChange("return_date", v)}
              />
              <Input
                type="time"
                label="Heure du rendez-vous retour"
                value={form.return_time}
                onChange={(v) => handleChange("return_time", v)}
              />

              {form.estimated_pickup_return && (
                <EstimatedBox
                  label="Heure de prise en charge estimée (retour)"
                  value={form.estimated_pickup_return}
                />
              )}
            </div>
          )}

          {/* BLOC 5 : TYPE DE TRANSPORT */}
          <div style={card}>
            <h2 style={sectionTitle}>Type de transport</h2>

            <div
              onClick={() => handleChange("transport_type", "ambulance")}
              style={{
                ...transportChoice,
                border:
                  form.transport_type === "ambulance"
                    ? "2px solid #5BF2F7"
                    : "1px solid #E5E7EB",
                background:
                  form.transport_type === "ambulance" ? "#ECFEFF" : "#fff",
              }}
            >
              <span style={transportIcon}>🚑</span>
              <div>
                <div style={transportTitle}>Couché (Ambulance)</div>
                <div style={transportSubtitle}>
                  Pour les transports nécessitant un brancard.
                </div>
              </div>
            </div>

            <div
              onClick={() => handleChange("transport_type", "vsl")}
              style={{
                ...transportChoice,
                border:
                  form.transport_type === "vsl"
                    ? "2px solid #5BF2F7"
                    : "1px solid #E5E7EB",
                background:
                  form.transport_type === "vsl" ? "#ECFEFF" : "#fff",
              }}
            >
              <span style={transportIcon}>🚕</span>
              <div>
                <div style={transportTitle}>Assis (Taxi / VSL)</div>
                <div style={transportSubtitle}>
                  Pour les transports assis médicalisés.
                </div>
              </div>
            </div>
          </div>

          {/* BLOC 6 : PARTICULARITÉS */}
          <div style={card}>
            <h2 style={sectionTitle}>Particularités</h2>

            <ToggleLine
              label="Accompagnant"
              value={form.accompagnant}
              onChange={(v) => handleChange("accompagnant", v)}
            />
            <ToggleLine
              label="Déambulateur"
              value={form.deambulateur}
              onChange={(v) => handleChange("deambulateur", v)}
            />
            <ToggleLine
              label="Fauteuil roulant pliable"
              value={form.fauteuil}
              onChange={(v) => handleChange("fauteuil", v)}
            />
            <ToggleLine
              label="Isolement / BMR"
              value={form.bmr}
              onChange={(v) => handleChange("bmr", v)}
            />
            <ToggleLine
              label="Oxygène"
              value={form.oxygene}
              onChange={(v) => handleChange("oxygene", v)}
            />

            <div style={{ marginTop: 16 }}>
  <label style={labelStyle}>Commentaire</label>
  <textarea
    value={form.comment}
    onChange={(e) => handleChange("comment", e.target.value)}
    placeholder="Informations supplémentaires (facultatif)"
    style={textareaStyle}
  />
</div>

          </div>

          <button style={submitBtn} type="submit">
            COMMANDER LE TRANSPORT
          </button>
        </form>
      </div>
    </div>
  );
}
/* --- COMPONENTS PREMIUM ACCESSIBLES --- */

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}


function EstimatedBox({ label, value }) {
  return (
    <div style={estimatedBox}>
      <strong style={{ fontSize: 16 }}>{label} :</strong>
      <div style={{ fontSize: 18, marginTop: 4 }}>{value}</div>

      <div style={asterisk}>
        * Cette estimation s’ajuste automatiquement pour rester précise.
      </div>
    </div>
  );
}

function ToggleLine({ label, value, onChange }) {
  return (
    <div style={toggleLine}>
      <span style={{ fontSize: 16 }}>{label}</span>

      <div
        onClick={() => onChange(!value)}
        style={{
          ...toggleContainer,
          background: value ? "#5BF2F7" : "#D1D5DB",
        }}
      >
        <div
          style={{
            ...toggleCircle,
            left: value ? 22 : 2,
          }}
        />
      </div>
    </div>
  );
}

/* --- STYLES PREMIUM ACCESSIBLES --- */

const pageContainer = {
  padding: 20,
  paddingBottom: 80,
  background: "linear-gradient(135deg, #ECFEFF 0%, #F3E8FF 100%)",
  minHeight: "100vh",
  position: "relative",
zIndex: 1,
};

const formWrapper = {
  maxWidth: 520,
  margin: "0 auto",
};

const headerBlock = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginBottom: 24,
  position: "relative",
  zIndex: 1,
};



const headerIcon = {
  fontSize: 40,
};

const headerTitle = {
  fontSize: 28,
  fontWeight: 800,
  margin: 0,
  color: "#0b1020",
};

const headerSubtitle = {
  fontSize: 16,
  color: "#4b5563",
  marginTop: 4,
  lineHeight: "22px",
};

const card = {
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(10px)",
  borderRadius: 20,
  padding: 24,          // au lieu de 20
  marginBottom: 24,
  border: "1.5px solid rgba(91,242,247,0.35)",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  overflow: "visible",

};


const sectionTitle = {
  fontSize: 20,
  fontWeight: 700,
  marginBottom: 16,
  color: "#0b1020",
};

const labelStyle = {
  display: "block",
  fontSize: 16,
  marginBottom: 6,
  color: "#374151",
  fontWeight: 600,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",   // ← AJOUTE CETTE LIGNE
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #CBD5E1",
  fontSize: 17,
  background: "#ffffff",
};


const textareaStyle = {
  width: "100%",
  boxSizing: "border-box",   // ← AJOUTE CETTE LIGNE
  minHeight: 90,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #CBD5E1",
  fontSize: 17,
  background: "#ffffff",
  resize: "vertical",        // ← BONUS UX : permet de redimensionner verticalement
};


const radioGroup = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const radioLine = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "10px 0",
};

const radioInput = {
  width: 22,
  height: 22,
};

const radioText = {
  fontSize: 18,
  color: "#0b1020",
};

const estimatedBox = {
  marginTop: 16,
  padding: 16,
  background: "#F1F5F9",
  borderRadius: 14,
  border: "1px solid #E2E8F0",
};

const asterisk = {
  fontSize: 14,
  color: "#6B7280",
  marginTop: 6,
};

const iteratifCard = {
  marginTop: 16,
  padding: 16,
  background: "#F8FAFC",
  borderRadius: 14,
  border: "1px solid #E2E8F0",
  cursor: "pointer",
};

const iteratifTitle = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
};

const iteratifText = {
  margin: "6px 0 0 0",
  fontSize: 15,
  color: "#4b5563",
};

const transportChoice = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: 16,
  borderRadius: 14,
  marginBottom: 14,
  cursor: "pointer",
};

const transportIcon = {
  fontSize: 28,
};

const transportTitle = {
  fontSize: 18,
  fontWeight: 700,
};

const transportSubtitle = {
  fontSize: 14,
  color: "#6b7280",
};

const toggleLine = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
};

const toggleContainer = {
  width: 46,
  height: 26,
  borderRadius: 999,
  position: "relative",
  cursor: "pointer",
  transition: "0.2s",
};

const toggleCircle = {
  width: 22,
  height: 22,
  borderRadius: "50%",
  background: "#fff",
  position: "absolute",
  top: 2,
  transition: "0.2s",
  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
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
  fontSize: 20,
  letterSpacing: 0.5,
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(91,242,247,0.4)",
};

const suggestionsBox = {
  position: "absolute",
  top: "100%",
  left: "50%",
  transform: "translateX(-50%)",
  width: "95%",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(12px)",
  borderRadius: 16,
  border: "1px solid rgba(91,242,247,0.35)",
  boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
  zIndex: 99999, // 🔥 MAXIMUM
  marginTop: 6,
  overflow: "hidden",
  animation: "fadeIn 0.15s ease-out",
};

const suggestionItem = {
  padding: "14px 18px",
  fontSize: 16,
  color: "#0b1020",
  cursor: "pointer",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
  transition: "background 0.15s",
  
};
