import { useState, useEffect } from "react";

export default function Compte() {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    birthdate: "",
    gender: "",
    social_security: "",
    phone: "",
    email: "",
    favorite_addresses: [],
  });

  // Charger les données sauvegardées
  useEffect(() => {
    const saved = localStorage.getItem("user_profile");
    if (saved) {
      setForm(JSON.parse(saved));
    }
  }, []);

  // Sauvegarde automatique
  useEffect(() => {
    localStorage.setItem("user_profile", JSON.stringify(form));
  }, [form]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addFavoriteAddress = () => {
    const address = prompt("Ajouter une adresse favorite :");
    if (address) {
      setForm((prev) => ({
        ...prev,
        favorite_addresses: [...prev.favorite_addresses, address],
      }));
    }
  };

  const removeFavoriteAddress = (index) => {
    setForm((prev) => ({
      ...prev,
      favorite_addresses: prev.favorite_addresses.filter((_, i) => i !== index),
    }));
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

  const title = {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
    color: "#0b1020",
  };

  const labelStyle = {
    display: "block",
    fontSize: 14,
    marginBottom: 6,
    color: "#4b5563",
  };

  const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1.5px solid #D3E8FF",
  background: "rgba(255,255,255,0.7)",
  fontSize: 15,
  outline: "none",
};

  return (
    <div style={pageContainer}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            marginBottom: 20,
            color: "#0b1020",
          }}
        >
          Mon compte
        </h1>

        {/* IDENTITÉ */}
        <div style={card}>
          <h2 style={title}>Identité</h2>

          <Input
            label="Prénom"
            value={form.firstname}
            onChange={(v) => handleChange("firstname", v)}
            inputStyle={inputStyle}
            labelStyle={labelStyle}
          />

          <Input
            label="Nom"
            value={form.lastname}
            onChange={(v) => handleChange("lastname", v)}
            inputStyle={inputStyle}
            labelStyle={labelStyle}
          />

          <Input
            type="date"
            label="Date de naissance"
            value={form.birthdate}
            onChange={(v) => handleChange("birthdate", v)}
            inputStyle={inputStyle}
            labelStyle={labelStyle}
          />

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Genre</label>
            <select
              value={form.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              style={inputStyle}
            >
              <option value="">Sélectionner</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <Input
            label="Numéro de sécurité sociale"
            value={form.social_security}
            onChange={(v) => handleChange("social_security", v)}
            inputStyle={inputStyle}
            labelStyle={labelStyle}
          />
        </div>

        {/* CONTACT */}
        <div style={card}>
          <h2 style={title}>Contact</h2>

          <Input
            label="Téléphone"
            value={form.phone}
            onChange={(v) => handleChange("phone", v)}
            inputStyle={inputStyle}
            labelStyle={labelStyle}
          />

          <Input
            label="Email"
            value={form.email}
            onChange={(v) => handleChange("email", v)}
            inputStyle={inputStyle}
            labelStyle={labelStyle}
          />
        </div>

        {/* ADRESSES FAVORITES */}
        <div style={card}>
          <h2 style={title}>Adresses favorites</h2>

          {form.favorite_addresses.length === 0 && (
            <p style={{ color: "#6b7280", fontSize: 14 }}>
              Aucune adresse enregistrée.
            </p>
          )}

          {form.favorite_addresses.map((addr, index) => (
            <div
              key={index}
              style={{
                background: "rgba(243,244,246,0.7)",
                padding: 12,
                borderRadius: 12,
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #E5E7EB",
              }}
            >
              <span>{addr}</span>
              <button
                onClick={() => removeFavoriteAddress(index)}
                style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 10,
                  fontWeight: 600,
                }}
              >
                Supprimer
              </button>
            </div>
          ))}

          <button
            onClick={addFavoriteAddress}
            style={{
              marginTop: 12,
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "1.5px solid #D3E8FF",
              background: "rgba(255,255,255,0.7)",
              fontWeight: 600,
              color: "#003b44",
            }}
          >
            Ajouter une adresse
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- COMPONENT INPUT PREMIUM --- */

function Input({ label, value, onChange, type = "text", inputStyle, labelStyle }) {
  return (
    <div style={{ marginBottom: 16 }}>
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
