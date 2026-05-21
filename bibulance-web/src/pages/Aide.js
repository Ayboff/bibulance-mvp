export default function Aide() {
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

  const titleStyle = {
    fontSize: 18,
    fontWeight: 600,
    color: "#0b1020",
    marginBottom: 12,
  };

  const textStyle = {
    fontSize: 15,
    color: "#374151",
    lineHeight: "22px",
    marginBottom: 10,
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
          Aide & Informations
        </h1>

        {/* 1️⃣ À propos */}
        <div style={card}>
          <div style={titleStyle}>À propos de Bibulance Mobile</div>
          <p style={textStyle}>
            Bibulance Mobile vous permet de commander facilement un transport
            sanitaire (VSL, Taxi conventionné ou Ambulance) et de suivre votre
            demande en toute simplicité.
          </p>
          <p style={textStyle}>
            Notre mission : rendre vos déplacements médicaux plus simples,
            plus rapides et plus rassurants.
          </p>
        </div>

        {/* 2️⃣ Fonctionnement */}
        <div style={card}>
          <div style={titleStyle}>Comment fonctionne votre transport ?</div>

          <p style={textStyle}>
            <strong>1. Vous envoyez votre demande</strong><br />
            Vous indiquez votre trajet, la date, l’heure et votre type de transport.
          </p>

          <p style={textStyle}>
            <strong>2. Votre transport est confirmé</strong><br />
            Une équipe de régulation valide votre demande auprès d’un transporteur agréé.
          </p>

          <p style={textStyle}>
            <strong>3. Votre véhicule arrive</strong><br />
            Vous recevez une heure estimée de prise en charge dès qu’un véhicule est affecté.
          </p>
        </div>

        {/* 3️⃣ Documents */}
        <div style={card}>
          <div style={titleStyle}>Documents nécessaires</div>
          <p style={textStyle}>• Prescription médicale de transport (si nécessaire)</p>
          <p style={textStyle}>• Carte Vitale</p>
          <p style={textStyle}>• Pièce d’identité</p>
          <p style={textStyle}>
            Vous pouvez faire une demande même si vous n’avez pas encore votre prescription.
          </p>
        </div>

        {/* 4️⃣ FAQ */}
        <div style={card}>
          <div style={titleStyle}>Questions fréquentes</div>

          <p style={textStyle}>
            <strong>Puis-je modifier ou annuler un transport ?</strong><br />
            Oui, via le numéro indiqué dans votre SMS de confirmation.
          </p>

          <p style={textStyle}>
            <strong>Comment est calculée l’heure estimée ?</strong><br />
            Elle dépend du trafic, de la distance et de la disponibilité des véhicules.
          </p>

          <p style={textStyle}>
            <strong>Puis-je commander pour un proche ?</strong><br />
            Oui, tant que les informations sont exactes.
          </p>
        </div>

        {/* 5️⃣ Contact */}
        <div style={card}>
          <div style={titleStyle}>Contact & Assistance</div>
          <p style={textStyle}>Notre équipe est disponible pour vous accompagner.</p>
          <p style={textStyle}>📱 Numéro indiqué dans votre SMS de confirmation</p>
          <p style={textStyle}>📧 support@bibulance.fr</p>
          <p style={textStyle}>🕒 7j/7 — 6h à 22h</p>
        </div>

        {/* 6️⃣ Sécurité */}
        <div style={card}>
          <div style={titleStyle}>Sécurité & Confidentialité</div>
          <p style={textStyle}>
            Vos données sont protégées et utilisées uniquement pour organiser votre transport.
            Bibulance respecte les normes RGPD et les exigences du secteur de la santé.
          </p>
        </div>
      </div>
    </div>
  );
}
