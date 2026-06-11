import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import StatsPage from "./pages/StatsPage";
import ConfirmedPage from "./pages/ConfirmedPage";
import { Home, ListChecks, CheckCircle, BarChart2, CalendarCheck, Siren, Clock, RefreshCw, Smartphone, CalendarDays, Search, ArrowRight, ArrowLeft, Repeat2 } from "lucide-react";
import { io } from "socket.io-client";


function safeDate(value) {
  if (!value) return null;
  const d = new Date(value.replace(" ", "T"));
  return isNaN(d.getTime()) ? null : d;
}
const TimelineItem = ({ label, date, done }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: done ? "#63FFA9" : "#ccc",
        marginRight: 10,
      }}
    />
    <div>
      <div style={{ fontWeight: done ? "bold" : "normal", color: "#1f2933" }}>
        {label}
      </div>
      {date && (
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          {new Date(date).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
      )}
    </div>
  </div>
);

// === COLONNE ÉTAT (VERSION BIBULANCE FINALE) ===
const EtatCell = ({ mission }) => {
  let badgeLabel = "";
  let badgeColor = "";
  

  // === WORKFLOW BIBULANCE DANS L’ORDRE EXACT ===
  if (mission.platform_cancelled) {
    badgeLabel = "Annulée plateforme";
    badgeColor = "rgba(229,231,235,0.6)"; // gris
  } 
  else if (mission.platform_refused) {
    badgeLabel = "Refusée plateforme";
    badgeColor = "rgba(255,94,121,0.22)"; // rouge
  } 
  else if (mission.accepted_bibulance && mission.platform_confirmation) {
    badgeLabel = "Acceptée plateforme";
    badgeColor = "rgba(91,242,247,0.22)"; // bleu
  } 
  else if (mission.accepted_bibulance && !mission.platform_confirmation) {
    badgeLabel = "En attente plateforme";
    badgeColor = "rgba(192,126,255,0.22)"; // violet
  } 
  else {
    badgeLabel = "Mission entrante";
    badgeColor = "rgba(99,255,169,0.22)"; // vert
  }

  // === TYPE DE TRAJET (temporaire : aléatoire) ===
  const trajetTypes = ["aller", "retour", "aller-retour"];
  const trajet = trajetTypes[mission.id % 3];

  const trajetIcon = 
  trajet === "aller" ? <ArrowRight size={14} /> :
  trajet === "retour" ? <ArrowLeft size={14} /> :
  <Repeat2 size={14} />;


  // === NUMÉRO DE MISSION (style SPS) ===
  const missionNumber = 10000 + mission.id;


  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      
      {/* BADGE WORKFLOW */}
      <span
        style={{
          background: badgeColor,
          padding: "3px 8px",
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 700,
          color: "#0b1020",
          width: "fit-content",
        }}
      >
        {badgeLabel}
      </span>

      {/* INFOS COMPACTES */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#1f2937",
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        <span>#{missionNumber}</span>
        <span>{mission.vehicle_type}</span>
        <span>{trajetIcon}</span>

      </div>
    </div>
  );
};
const TrajetCell = ({ mission }) => {
  const rdv = new Date(mission.rdv_time);
  const pickup = new Date(rdv.getTime() - 14 * 60000);

  const formatTime = (d) =>
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const trajetTypes = ["aller", "retour", "aller-retour"];
  const trajet = trajetTypes[mission.id % 3];

  const waveTop = trajet === "aller" ? "~" : "";
  const waveBottom = trajet === "retour" ? "~" : "";
  

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 10, fontSize: 12 }}>

      {/* COLONNE HEURES */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minWidth: 60,
          textAlign: "right",
          fontWeight: 700,
          color: "#0b1020",
          lineHeight: "16px",
        }}
      >
        <span>{waveTop}{formatTime(pickup)}</span>
        <span>{waveBottom}{formatTime(rdv)}</span>
      </div>

      {/* COLONNE BARRE FLEX + POINTS ALIGNÉS */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 2,
          paddingBottom: 2,
        }}
      >
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#5BF2F7" }} />

        <div
          style={{
            width: 3,
            flexGrow: 1,
            background: "#5BF2F7",
            borderRadius: 2,
            margin: "2px 0",
          }}
        />

        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#5BF2F7" }} />
      </div>

      {/* COLONNE TEXTES */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

        {/* DÉPART */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontWeight: 600,
              color: "#0b1020",
              whiteSpace: "nowrap",
            }}
          >
            {mission.emitter_facility}
          </span>

          {mission.emitter_address && (
            <span style={{ color: "#4b5563", whiteSpace: "normal" }}>
              {mission.emitter_address}
            </span>
          )}
        </div>

        {/* ARRIVÉE */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontWeight: 600,
              color: "#0b1020",
              whiteSpace: "nowrap",
            }}
          >
            {mission.destination_facility}
          </span>

          {mission.destination_address && (
            <span style={{ color: "#4b5563", whiteSpace: "normal" }}>
              {mission.destination_address}
            </span>
          )}
        </div>

      </div>
    </div>
  );
};














function App() {
  
  const [missions, setMissions] = useState([]);
  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  useEffect(() => {
  document.body.style.background = "linear-gradient(135deg, #F9FCFE 0%, #F4F8FB 100%)";
  document.body.style.margin = 0;
  document.body.style.padding = 0;
}, []);

useEffect(() => {
  if (!selectedMissionId) return;

  setCountdown(300); // reset à chaque sélection

  const interval = setInterval(() => {
    setCountdown(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [selectedMissionId]);

const formatTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

  const [page, setPage] = useState("missions");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
  new Date().toISOString().split("T")[0]
  
  
  
  
);

  const formatHeaderDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};
  

  const vehiclesByType = {
    VSL: ["VSL 12", "VSL 18"],
    AMB: ["AMB 3", "AMB 7"],
  };

  useEffect(() => {
  async function loadMissions() {
    try {
      const missionsPlateformes = await fetch(`${process.env.REACT_APP_API_URL}/missions`)

  .then((r) => r.json())
  .then((list) =>
    list.map((m, index) => ({
      ...m,
      // ⭐ NORMALISATION ID : supprime les "fake" et force un ID numérique
      id: Number(m.id) || index + 1,
      // ⭐ Empêche les "0" dans le panneau régulateur
      assigned_vehicle: m.assigned_vehicle || "",
    }))
  );

      const missionsParticuliersTransformees = [];

      const platforms = ["Amblea", "Paramedic", "PTAH", "SPS", "SCR'Urgences"];

      const patients = [
        ["Martin", "Luc"],
        ["Durand", "Sophie"],
        ["Bernard", "Alain"],
        ["Moreau", "Claire"],
        ["Petit", "Nicolas"],
        ["Lefevre", "Julie"],
        ["Roux", "Thomas"],
        ["Fournier", "Emma"],
        ["Girard", "Paul"],
        ["Andre", "Laura"],
      ];

      const facilities = [
        {
          name: "Centre Hospitalier Départemental Stell — Unité de Gériatrie Aiguë",
          address: "1 Rue Charles de Gaulle, 92500 Rueil-Malmaison",
        },
        {
          name: "CHRD5 — Site Courbevoie — SSR Cardio-Vasculaire",
          address: "30 Rue Kilford, 92400 Courbevoie",
        },
        {
          name: "Hôpital de Neuilly-sur-Seine — Médecine Gériatrique",
          address: "36 Boulevard du Général Leclerc, 92200 Neuilly-sur-Seine",
        },
        {
          name: "Hôpital Foch",
          address: "40 Rue Worth, 92150 Suresnes",
        },
        {
          name: "Hôpital Américain",
          address: "63 Boulevard Victor Hugo, 92200 Neuilly-sur-Seine",
        },
        {
          name: "Institut Mutualiste Montsouris",
          address: "42 Boulevard Jourdan, 75014 Paris",
        },
        {
          name: "Clinique Rochebrune — GP2, 2ème étage",
          address: "4 Rue de la Porte Jaune, 92380 Garches",
        },
        {
          name: "Hôpital La Cité des Fleurs — UF4, 4ème étage",
          address: "1 Rue de la Cité des Fleurs, 92400 Courbevoie",
        },
        {
          name: "Clinique Pasteur",
          address: "12 Rue du Dr Roux, 91000 Évry",
        },
        {
          name: "Clinique du Plateau — Bâtiment A",
          address: "3 Avenue du Plateau, 92230 Gennevilliers",
        },
        {
          name: "Hôpital Sud",
          address: "14 Boulevard des Myrtilles, 91000 Évry",
        },
        {
          name: "Centre de Dialyse",
          address: "5 Rue des Moulins, 91000 Évry",
        },
        {
          name: "EHPAD Les Lilas",
          address: "8 Rue des Acacias, 91000 Évry",
        },
        {
          name: "Domicile",
          address: null,
        },
      ];

      const vehicleTypes = ["VSL", "AMB"];
      const baseDate = new Date();

      const generateMission = (id) => {
        id = Number(id);
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const patient = patients[Math.floor(Math.random() * patients.length)];
        const from = facilities[Math.floor(Math.random() * facilities.length)];
        let to = facilities[Math.floor(Math.random() * facilities.length)];
        if (to === from) {
          to = facilities[Math.floor(Math.random() * facilities.length)];
        }
        const rdv = new Date(baseDate.getTime() + id * 15 * 60000);

        return {
          id,
          rdv_time: rdv.toISOString().slice(0, 16).replace("T", " "),
          status: platform === "SCR'Urgences" ? "urgente" : "programmee",
          patient_last_name: patient[0],
          patient_first_name: patient[1],
          emitter_facility: from.name,
          emitter_address: from.address,
          destination_facility: to.name,
          destination_address: to.address,
          vehicle_type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
          source_platform: platform,
          accepted_bibulance: false,
          platform_confirmation: false,
          assigned_vehicle: null,
          is_locked: false,
          accepted_at: null,
          platform_confirmed_at: null,
          assigned_at: null,
        };
      };

      const randomMissions = Array.from({ length: 20 }, (_, i) => generateMission(i + 6));

      const allMissions = [
        ...missionsPlateformes,
        ...missionsParticuliersTransformees,
        ...randomMissions,
      ].filter(
  (m) =>
    platformLogos[m.source_platform] &&
    m.patient_last_name &&
    m.emitter_facility &&
    m.id < 10030   // ⬅️ SUPPRIME UNIQUEMENT LES 20 MISSIONS BACKEND
);

      allMissions.sort((a, b) => {
  const da = safeDate(a.rdv_time);
  const db = safeDate(b.rdv_time);
  if (!da && !db) return 0;
  if (!da) return 1;
  if (!db) return -1;
  return da - db;
});


      setMissions(allMissions);
    } catch (e) {
      console.error(e);
    }
  }

// 🔥 1) Chargement initial
loadMissions();


// 🔥 2) WebSocket temps réel (VERSION SOCKET.IO)


const socket = io(process.env.REACT_APP_API_URL);

socket.on("connect", () => {
  console.log("Socket.IO connecté :", socket.id);
});

// Quand une mission est créée → recharger
socket.on("mission_created", (mission) => {
  console.log("Nouvelle mission :", mission);
  loadMissions();
});

// Quand une mission est mise à jour → recharger
socket.on("mission_updated", (data) => {
  console.log("Mission mise à jour :", data);
  loadMissions();
});

return () => {
  socket.disconnect();
  console.log("Socket.IO déconnecté");
};

}, []); // ← IMPORTANT : tableau vide pour éviter les connexions multiples
  const priorityOrder = {
    urgente: 0,
    programmee: 1,
    affectee: 2,
    terminee: 3,
  };

  const statusStyle = (status) => {
    if (status === "urgente")
      return { background: "rgba(255,94,121,0.06)", color: "#7a0014" };
    if (status === "programmee")
      return { background: "rgba(91,242,247,0.04)", color: "#003b44" };
    if (status === "affectee")
      return { background: "rgba(99,255,169,0.06)", color: "#004d2e" };
    if (status === "terminee")
      return { background: "#f3f4f6", color: "#6b7280" };
    return {};
  };

  const updateSuggestions = (value) => {
    const text = value.toLowerCase();

    if (!text) {
      setSuggestions([]);
      return;
    }

    const pool = missions.flatMap((m) => [
      m.patient_last_name,
      m.patient_first_name,
      m.emitter_facility,
      m.destination_facility,
      m.source_platform,
      m.vehicle_type,
      String(m.id),
    ]);

    const unique = [...new Set(pool.filter(Boolean))];

    const filtered = unique
      .filter((item) => item.toLowerCase().includes(text))
      .slice(0, 8);

    setSuggestions(filtered);
  };

  const badge = {
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  };

  const platformLogos = {
    Amblea: "/amblea.png",
    Paramedic: "/paramedic.png",
    PTAH: "/ptah.png",
    SPS: "/sps.png",
    Bibulance: "/bibulance.png",
    "SCR'Urgences": "/scrurgences.png",
    "Bibulance Mobile": "/bibulance.png",
    bibulance_mobile: "/bibulance.png",
  };

  const PlatformTag = ({ platform }) => {
    
    const logo = platformLogos[platform];
    

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 90,
          width: 90,
        }}
      >
        {logo && (
          <img
            src={logo}
            alt={platform}
            style={{
              width: 80,
              height: 80,
              objectFit: "contain",
            }}
          />
        )}
      </div>
    );
  };

  const acceptanceBadge = (accepted) => ({
    ...badge,
    background: accepted ? "#63FFA9" : "#e5e7eb",
    color: accepted ? "#064e3b" : "#6b7280",
    marginRight: 4,
  });

  const isAffectable = (mission) =>
    mission.accepted_bibulance &&
    mission.platform_confirmation &&
    !mission.is_locked;

  const acceptBibulance = (missionId) => {
    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId
          ? {
              ...m,
              accepted_bibulance: true,
              accepted_at: new Date().toISOString(),
            }
          : m
      )
    );
  };

  const confirmPlatform = (missionId) => {
  setMissions((prev) =>
    prev.map((m) =>
      m.id === missionId
        ? {
            ...m,
            platform_confirmation: true,
            platform_confirmed_at: new Date().toISOString(),
          }
        : m
    )
  );

  // 🔥 AJOUT : basculer automatiquement vers la page Confirmées
 
};

  const refuseBibulance = (missionId) => {
    setMissions((prev) => prev.filter((m) => m.id !== missionId));
    setSelectedMissionId(null);
  };

  const assignVehicle = (missionId, vehicle) => {
    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId
          ? {
              ...m,
              assigned_vehicle: vehicle,
              is_locked: true,
              status: "affectee",
              assigned_at: new Date().toISOString(),
            }
          : m
      )
    );
  };

  const unassignVehicle = (missionId) => {
    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId
          ? {
              ...m,
              assigned_vehicle: null,
              is_locked: false,
              status: "programmee",
              assigned_at: null,
            }
          : m
      )
    );
  };

  const selectedMission = missions.find((m) => m.id === selectedMissionId);
const confirmedMissions = missions.filter(
  (m) => m.accepted_bibulance && m.platform_confirmation
);

  const availableVehicles = selectedMission
    ? vehiclesByType[selectedMission.vehicle_type] || []
    : [];
const today = new Date().toISOString().split("T")[0];

const filteredMissions = missions.filter((m) => {

  // 1) Filtre par date
  if (m.rdv_time) {
    let missionDate = null;
const d = safeDate(m.rdv_time);
if (d) missionDate = d.toISOString().split("T")[0];
if (missionDate !== selectedDate) return false;

  }

  // 2) Filtre statut
  const statusOK = filterStatus === "all" || m.status === filterStatus;

  // 3) Filtre plateforme
  const platformOK =
    filterPlatform === "all" || m.source_platform === filterPlatform;

  // 4) Filtre recherche
  const searchText = search.toLowerCase();
  const matchesSearch =
    m.patient_last_name?.toLowerCase().includes(searchText) ||
    m.patient_first_name?.toLowerCase().includes(searchText) ||
    m.emitter_facility?.toLowerCase().includes(searchText) ||
    m.destination_facility?.toLowerCase().includes(searchText) ||
    m.source_platform?.toLowerCase().includes(searchText) ||
    m.vehicle_type?.toLowerCase().includes(searchText) ||
    String(m.id).includes(searchText);

  if (!statusOK || !platformOK || !matchesSearch) return false;

  // 🔥🔥🔥 AJOUT ICI : exclure les missions confirmées
  if (m.accepted_bibulance && m.platform_confirmation) return false;

  return true;
});

const missionsDuJour = filteredMissions.length;
const urgentes = filteredMissions.filter((m) => m.status === "urgente").length;
const enAttenteBibulance = filteredMissions.filter(
  (m) => !m.accepted_bibulance
).length;
const enAttentePlateforme = filteredMissions.filter(
  (m) => m.accepted_bibulance && !m.platform_confirmation
).length;
const affectees = filteredMissions.filter((m) => m.is_locked).length;
const bibulanceMobileDuJour = filteredMissions.filter(
  (m) =>
    m.source_platform?.toLowerCase() === "bibulance mobile" ||
    m.source_platform?.toLowerCase() === "bibulance_mobile" ||
    m.source_platform?.toLowerCase() === "bibulance"
).length;



  const sortedMissions = [...filteredMissions].sort((a, b) => {
    const statusDiff =
      (priorityOrder[a.status] ?? 99) - (priorityOrder[b.status] ?? 99);
    if (statusDiff !== 0) return statusDiff;
    const da = safeDate(a.rdv_time);
const db = safeDate(b.rdv_time);
if (!da && !db) return 0;
if (!da) return 1;
if (!db) return -1;
return da - db;

  });

  const add20RandomMissions = () => {
    setMissions((prev) => {
      const platforms = ["Amblea", "Paramedic", "PTAH", "SPS", "SCR'Urgences"];
      const patients = [
        ["Martin", "Luc"],
        ["Durand", "Sophie"],
        ["Bernard", "Alain"],
        ["Moreau", "Claire"],
        ["Petit", "Nicolas"],
        ["Lefevre", "Julie"],
        ["Roux", "Thomas"],
        ["Fournier", "Emma"],
        ["Girard", "Paul"],
        ["Andre", "Laura"],
      ];
      const facilities = [
  {
    name: "Centre Hospitalier Départemental Stell — Unité de Gériatrie Aiguë",
    address: "1 Rue Charles de Gaulle, 92500 Rueil-Malmaison",
  },
  {
    name: "CHRD5 — Site Courbevoie — SSR Cardio-Vasculaire",
    address: "30 Rue Kilford, 92400 Courbevoie",
  },
  {
    name: "Hôpital de Neuilly-sur-Seine — Médecine Gériatrique",
    address: "36 Boulevard du Général Leclerc, 92200 Neuilly-sur-Seine",
  },
  {
    name: "Hôpital Foch",
    address: "40 Rue Worth, 92150 Suresnes",
  },
  {
    name: "Hôpital Américain",
    address: "63 Boulevard Victor Hugo, 92200 Neuilly-sur-Seine",
  },
  {
    name: "Institut Mutualiste Montsouris",
    address: "42 Boulevard Jourdan, 75014 Paris",
  },
  {
    name: "Clinique Rochebrune — GP2, 2ème étage",
    address: "4 Rue de la Porte Jaune, 92380 Garches",
  },
  {
    name: "Hôpital La Cité des Fleurs — UF4, 4ème étage",
    address: "1 Rue de la Cité des Fleurs, 92400 Courbevoie",
  },
  {
    name: "Clinique Pasteur",
    address: "12 Rue du Dr Roux, 91000 Évry",
  },
  {
    name: "Clinique du Plateau — Bâtiment A",
    address: "3 Avenue du Plateau, 92230 Gennevilliers",
  },
  {
    name: "Hôpital Sud",
    address: "14 Boulevard des Myrtilles, 91000 Évry",
  },
  {
    name: "Centre de Dialyse",
    address: "5 Rue des Moulins, 91000 Évry",
  },
  {
    name: "EHPAD Les Lilas",
    address: "8 Rue des Acacias, 91000 Évry",
  },
  {
    name: "Domicile",
    address: null,
  },
];

      const vehicleTypes = ["VSL", "AMB"];
      const baseDate = new Date();

      const maxId = prev.reduce((max, m) => {
        const n = Number(m.id);
        return Number.isFinite(n) ? Math.max(max, n) : max;
      }, 0);

      const newMissions = Array.from({ length: 20 }, (_, i) => {
  const platform =
    platforms[Math.floor(Math.random() * platforms.length)];
  const patient =
    patients[Math.floor(Math.random() * patients.length)];

  // VRAIES ADRESSES (objets)
  const from =
    facilities[Math.floor(Math.random() * facilities.length)];
  let to = facilities[Math.floor(Math.random() * facilities.length)];

  // éviter départ = arrivée
  if (to === from) {
    to = facilities[Math.floor(Math.random() * facilities.length)];
  }

  const rdv = new Date(baseDate.getTime() + i * 15 * 60000);

  return {
    id: Number(maxId) + i + 1,
    rdv_time: rdv.toISOString().slice(0, 16).replace("T", " "),
    status: platform === "SCR'Urgences" ? "urgente" : "programmee",

    patient_last_name: patient[0],
    patient_first_name: patient[1],

    // 🔥 IMPORTANT : on met .name et .address
    emitter_facility: from.name,
    emitter_address: from.address,

    destination_facility: to.name,
    destination_address: to.address,

    vehicle_type:
      vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
    source_platform: platform,

    accepted_bibulance: false,
    platform_confirmation: false,
    assigned_vehicle: null,
    is_locked: false,
    accepted_at: null,
    platform_confirmed_at: null,
    assigned_at: null,
  };
});

      return [...prev, ...newMissions];
    });
  };

  const th = {
    textAlign: "left",
    padding: "8px 10px",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#6b7280",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    background: "#f9fafb",
    zIndex: 1,
  };

  const td = {
  padding: "8px 10px",
  fontSize: 13,
  borderBottom: "1px solid #f3f4f6",
};

  const actionBtn = {
    padding: "8px 10px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
  };
  const cardStyle = {
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
};

const SidebarItem = ({ icon: Icon, label, active, onClick, open }) => (
  <div
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: open ? 14 : 0,
      padding: "10px 14px",
      borderRadius: 12,
      cursor: "pointer",
      transition: "all 0.25s ease",
      background: active ? "rgba(91,242,247,0.25)" : "transparent",
      whiteSpace: "nowrap",
      overflow: "visible",
    }}
  >
    {/* ✔️ Icône TOUJOURS visible et TOUJOURS colorée */}
    <Icon
      size={22}
      style={{
        color: active ? "#00C2CB" : "#1f2937", // gris foncé lisible
        flexShrink: 0,
        transition: "all 0.25s ease",
      }}
    />

    {/* ✔️ Label visible uniquement quand open === true */}
    <span
      style={{
        opacity: open ? 1 : 0,
        transform: open ? "translateX(0px)" : "translateX(-10px)",
        transition: "all 0.25s ease",
        fontSize: 15,
        fontWeight: 500,
        color: active ? "#00C2CB" : "#1f2937",
      }}
    >
      {label}
    </span>
  </div>
);

  const Sidebar = () => (
  <div
    onMouseEnter={() => setSidebarOpen(true)}
    onMouseLeave={() => setSidebarOpen(false)}
    style={{
  position: "fixed",
  top: 20,
  left: 8,
  bottom: 20,
  width: sidebarOpen ? 150 : 64,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 30,
overflow: "visible",

  // Animation VisionOS
  transition: "width 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)",
  transform: sidebarOpen ? "scale(1)" : "scale(0.98)",
  transitionProperty: "width, transform, backdrop-filter",

  // Fond glass premium
  background: "linear-gradient(135deg, rgba(236,254,255,0.65) 0%, rgba(243,232,255,0.65) 100%)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  borderRadius: 20,
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  border: "1px solid rgba(255,255,255,0.4)",
}}

  >
    {/* LOGO */}
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 80,
      }}
    >
      {sidebarOpen ? (
        <img
          src="/bibulance.png"
          alt="Bibulance"
          style={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
            transition: "all 0.25s ease",
          }}
        />
      ) : (
        <img
          src="/logo-b.png"
          alt="B"
          style={{
            width: "150%",
            height: "auto",
            objectFit: "contain",
            transition: "all 0.25s ease",
            padding: "0 10px",
          }}
        />
      )}
    </div>

    {/* MENU */}
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <SidebarItem icon={Home} label="Accueil" active={page === "home"} onClick={() => setPage("home")} open={sidebarOpen} />
      <SidebarItem icon={ListChecks} label="Missions" active={page === "missions"} onClick={() => setPage("missions")} open={sidebarOpen} />
<SidebarItem icon={CheckCircle} label="Confirmées" active={page === "confirmed"} onClick={() => setPage("confirmed")} open={sidebarOpen} />
<SidebarItem icon={BarChart2} label="Statistiques" active={page === "stats"} onClick={() => setPage("stats")} open={sidebarOpen} />
    </div>
  </div>
);




  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div
  style={{
    marginLeft: sidebarOpen ? 250 : 100,
    width: `calc(100% - ${sidebarOpen ? 250 : 100}px)`,
    transition: "all 0.25s ease",
    padding: 30,
    paddingTop: 40,
background: "linear-gradient(135deg, #F9FCFE 0%, #F4F8FB 100%)",
    minHeight: "100vh",
  }}
>


        {page === "home" && <HomePage setPage={setPage} />}

{page === "confirmed" && (
  <ConfirmedPage
    missions={confirmedMissions}
    th={th}
    td={td}
  />
)}

{page === "missions" && (
          
          
          <>
            <h1
  style={{
    textAlign: "center",
    width: "100%",
    marginBottom: 20,
    fontSize: 30,
    fontWeight: 600,
    color: "#1f2937", // gris profond, lisible, reposant
    letterSpacing: 0.5,
  }}
>
  Missions
</h1>
{/* === BARRE D’INDICATEURS CLÉS === */}
<div
  style={{
    ...cardStyle,
    display: "flex",
    gap: 16,
    marginBottom: 20,
    padding: "12px 16px",
    background: "#ffffff",
    borderRadius: 14,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  }}
>

  <div
    style={{
      flex: 1,
      background: "rgba(91,242,247,0.12)",
      padding: "12px",
      borderRadius: 12,
      textAlign: "center",
      fontWeight: 700,
      color: "#0b1020",
    }}
  >
<CalendarCheck size={15} style={{ flexShrink: 0 }} /> {missionsDuJour} missions du jour
  </div>

  <div
    style={{
      flex: 1,
      background: "rgba(255,94,121,0.12)",
      padding: "12px",
      borderRadius: 12,
      textAlign: "center",
      fontWeight: 700,
      color: "#7a0014",
      display: "flex", alignItems: "center", gap: 6, justifyContent: "center"
    }}
  >
<Siren size={15} style={{ flexShrink: 0 }} /> {urgentes} urgentes
  </div>

  

  <div
    style={{
      flex: 1,
      background: "rgba(192,126,255,0.18)",
      padding: "12px",
      borderRadius: 12,
      textAlign: "center",
      fontWeight: 700,
      color: "#3b0a6b",
      display: "flex", alignItems: "center", gap: 6, justifyContent: "center"
    }}
    
  >
    <RefreshCw size={15} style={{ flexShrink: 0 }} /> {enAttentePlateforme} en attente plateforme
    

  </div>

  <div
  onClick={() => setPage("confirmed")}
  style={{
    flex: 1,
    background: "rgba(99,255,169,0.18)",
    padding: "12px",
    borderRadius: 12,
    textAlign: "center",
    fontWeight: 700,
    color: "#004d2e",
    cursor: "pointer",
    display: "flex", alignItems: "center", gap: 6, justifyContent: "center"
  }}
>
  <CheckCircle size={15} style={{ flexShrink: 0 }} /> {confirmedMissions.length} confirmées
</div>

  <div
  style={{
    flex: 1,
    background: "rgba(91,242,247,0.22)",
    padding: "12px",
    borderRadius: 12,
    textAlign: "center",
    fontWeight: 700,
    color: "#003b44",
    display: "flex", alignItems: "center", gap: 6, justifyContent: "center"
  }}
>
  <Smartphone size={15} style={{ flexShrink: 0 }} /> {bibulanceMobileDuJour} Bibulance Mobile
</div>
</div>



            <button
              onClick={add20RandomMissions}
              style={{
                background: "linear-gradient(135deg, rgba(236,254,255,0.85) 0%, rgba(243,232,255,0.85) 100%)",
backdropFilter: "blur(10px)",
border: "1px solid rgba(255,255,255,0.4)",
boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
borderRadius: 10,
padding: "6px 14px",
fontSize: 15,
fontWeight: 700,
color: "#0b1020",
                display: "flex", alignItems: "center", gap: 6, justifyContent: "center"
              }}
            >
              +20 missions aléatoires
            </button>

            <div
  style={{
    ...cardStyle,
    background: "#ffffff",
    padding: "14px 18px",
    borderRadius: 14,
    boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  }}
>

  {/* LIGNE 1 — Navigation + Boutons rapides */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    }}
  >
    {/* Navigation par jour */}
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        onClick={() =>
          setSelectedDate(
            new Date(new Date(selectedDate).getTime() - 86400000)
              .toISOString()
              .split("T")[0]
          )
        }
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: 20,
        }}
      >
        ←
      </button>

      <div style={{ fontSize: 18, fontWeight: 600, color: "#0b1020" }}>
        <CalendarDays size={18} style={{ flexShrink: 0 }} /> {formatHeaderDate(selectedDate)}
      </div>

      <button
        onClick={() =>
          setSelectedDate(
            new Date(new Date(selectedDate).getTime() + 86400000)
              .toISOString()
              .split("T")[0]
          )
        }
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: 20,
        }}
      >
        →
      </button>
    </div>

    {/* Boutons rapides */}
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={() =>
          setSelectedDate(new Date().toISOString().split("T")[0])
        }
        style={{
          padding: "6px 12px",
          borderRadius: 999,
          background: "#5BF2F7",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          color: "#0b1020",
        }}
      >
        Aujourd’hui
      </button>

      <button
        onClick={() =>
          setSelectedDate(
            new Date(Date.now() + 86400000).toISOString().split("T")[0]
          )
        }
        style={{
          padding: "6px 12px",
          borderRadius: 999,
          background: "#C07EFF",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          color: "white",
        }}
      >
        Demain
      </button>

      <button
        onClick={() => {
          const now = new Date();
          const monday = new Date(
            now.setDate(now.getDate() - ((now.getDay() + 6) % 7))
          );
          setSelectedDate(monday.toISOString().split("T")[0]);
        }}
        style={{
          padding: "6px 12px",
          borderRadius: 999,
          background: "#FFE765",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          color: "#4b3b00",
        }}
      >
        Cette semaine
      </button>
    </div>
  </div>

  {/* LIGNE 2 — Filtres + mini calendrier */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}
  >
    {/* Mini calendrier */}
    <input
      type="date"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      style={{
        padding: "6px 10px",
        borderRadius: 8,
        border: "1px solid #d1d5db",
        background: "#f9fafb",
        fontSize: 14,
        cursor: "pointer",
        color: "#0b1020",
        fontWeight: 500,
      }}
    />

    {/* Filtre statut */}
    <select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      style={{
        padding: "6px 10px",
        borderRadius: 8,
        border: "1px solid #d1d5db",
        background: "#f9fafb",
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      <option value="all">Tous statuts</option>
      <option value="urgente">Urgente</option>
      <option value="programmee">Programmée</option>
      <option value="affectee">Affectée</option>
      <option value="terminee">Terminée</option>
    </select>

    {/* Filtre plateforme */}
    <select
      value={filterPlatform}
      onChange={(e) => setFilterPlatform(e.target.value)}
      style={{
        padding: "6px 10px",
        borderRadius: 8,
        border: "1px solid #d1d5db",
        background: "#f9fafb",
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      <option value="all">Toutes plateformes</option>
      <option value="Amblea">Amblea</option>
      <option value="Paramedic">Paramedic</option>
      <option value="PTAH">PTAH</option>
      <option value="SPS">SPS</option>
      <option value="SCR'Urgences">SCR'Urgences</option>
      <option value="Bibulance Mobile">Bibulance Mobile</option>
    </select>
  </div>
</div>


            <div
              style={{
                position: "relative",
                marginBottom: 16,
              }}
            >
              <div
  style={{
    ...cardStyle,
    display: "flex",
    alignItems: "center",
    background: "#ffffff",
    padding: "10px 14px",
    borderRadius: 14,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    border: "2px solid #5BF2F7",
  }}
>

                <Search size={18} style={{ marginRight: 10, color: "#0b1020", flexShrink: 0 }} />

                <input
                  type="text"
                  placeholder="Rechercher une mission, un patient, un trajet..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    updateSuggestions(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 150)
                  }
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: 15,
                    color: "#0b1020",
                    background: "transparent",
                  }}
                />
                

              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div
                  style={{
                    background: "#ffffff",
                    border: "2px solid #5BF2F7",
                    borderTop: "none",
                    borderRadius: "0 0 14px 14px",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                    marginTop: -12,
                    marginBottom: 16,
                    position: "absolute",
                    width: "100%",
                    zIndex: 10,
                  }}
                >
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      onMouseDown={() => {
                        setSearch(s);
                        setShowSuggestions(false);
                      }}
                      style={{
                        padding: "10px 14px",
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#0b1020",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 20 }}>
              <div
  style={{
    ...cardStyle,
    flex: 1,
    background: "#ffffff",
    padding: "10px 14px",
    borderRadius: 14,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    border: "2px solid #5BF2F7",
  }}
>

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: 4,
                  }}
                >
                  <thead>
  <tr>
    <th style={{ 
      ...th, 
      width: 110, 
      padding: "4px 6px",
      textAlign: "center"   // ← AJOUT
    }}>
      État
    </th>
    <th style={{ 
      ...th,
      width: 260,        // largeur adaptée à ta colonne Trajet
      padding: "4px 6px",
      textAlign: "center"
    }}>
      Trajet
    </th>

    <th style={{ ...th, width: 160, padding: "4px 6px" }}>Patient</th>
    <th style={{ ...th, width: 70, padding: "4px 6px" }}>Source</th>
  </tr>
</thead>


<tbody>
  {sortedMissions.map((m) => (
    <tr
      key={m.id}
      onClick={() => setSelectedMissionId(m.id)}
      style={{
        background: "#ffffff",
        cursor: "pointer",
        outline: selectedMissionId === m.id ? "2px solid #5BF2F7" : "none",
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        boxShadow:
          selectedMissionId === m.id
            ? "0 2px 6px hsla(222, 47%, 11%, 0.18)"
            : "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* ÉTAT */}
      <td style={{ padding: "3px 4px", fontSize: 10, width: 110 }}>
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <EtatCell mission={m} />

    {/* TIMER dans la colonne État */}
    {selectedMissionId === m.id && (
      <span
        style={{
          background: "rgba(255,231,101,0.35)",
          color: "#4b3b00",
          padding: "2px 6px",
          borderRadius: 6,
          fontWeight: 700,
          fontSize: 11,
          width: "fit-content"
        }}
      >
        {formatTime(countdown)}
      </span>
    )}
  </div>
</td>

      {/* TRAJET (RDV + véhicule + adresses + PEC estimée) */}
      <td style={{ padding: "3px 4px", fontSize: 11 }}>
        <TrajetCell mission={m} />
      </td>

      {/* PATIENT */}
      <td style={{ padding: "3px 4px", fontSize: 11, width: 160 }}>
        {m.patient_last_name} {m.patient_first_name}
      </td>

      {/* SOURCE */}
      <td
        style={{
          padding: "3px 4px",
          fontSize: 11,
          textAlign: "center",
          width: 70,
        }}
      >
        <PlatformTag platform={m.source_platform} />
      </td>
    </tr>
  ))}
</tbody>

</table>
              </div>

              <div
                style={{
                  width: 350,
                  position: "sticky",
                  top: 20,
                  alignSelf: "flex-start",
                }}
              >
                {selectedMission && !selectedMission.is_locked && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: 10,
                      background: "#FFE765",
                      borderRadius: 8,
                      fontSize: 13,
                      color: "#4b3b00",
                    }}
                  >
                    ⚠️ Cette mission doit être acceptée par Bibulance et la
                    plateforme émettrice avant affectation.
                  </div>
                )}

                {selectedMission && (
                  <div
                    style={{
                      marginTop: 20,
                      padding: 18,
                      borderRadius: 14,
                      background: "#ffffff",
                      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                      border: "1px solid #e5d4ff",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        marginBottom: 14,
                        fontSize: 17,
                        fontWeight: 600,
                        color: "#1f2937",
                        textTransform: "uppercase",
                        letterSpacing: 0.3,
                      }}
                    >
                      Action régulateur
                    </h3>

                    <p
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        marginTop: 4,
                        marginBottom: 14,
                      }}
                    >
                      {new Date(
                        selectedMission.rdv_time
                      ).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      {selectedMission.patient_first_name} •{" "}
                      {selectedMission.emitter_facility} →{" "}
                      {selectedMission.destination_facility}
                    </p>

                    {!selectedMission.accepted_bibulance && (
                      <div style={{ marginBottom: 18 }}>
                        <button
                          onClick={() =>
                            acceptBibulance(selectedMission.id)
                          }
                          style={{
                            ...actionBtn,
                            background: "#63FFA9",
                            color: "#064e3b",
                            width: "100%",
                          }}
                        >
                          ✔ Accepter la mission
                        </button>
                        <button
                          onClick={() =>
                            refuseBibulance(selectedMission.id)
                          }
                          style={{
                            ...actionBtn,
                            background: "#FF5E79",
                            color: "#ffffff",
                            width: "100%",
                          }}
                        >
                          ✖ Refuser la mission
                        </button>
                      </div>
                    )}

                    {selectedMission.accepted_bibulance &&
                      !selectedMission.platform_confirmation && (
                        <div style={{ marginBottom: 18 }}>
                          <p
                            style={{
                              color: "#92400e",
                              fontSize: 13,
                              marginBottom: 8,
                            }}
                          >
                            ⏳ En attente de confirmation plateforme…
                          </p>
                          <button
                            onClick={() =>
                              confirmPlatform(selectedMission.id)
                            }
                            style={{
                              ...actionBtn,
                              background: "#5BF2F7",
                              color: "#0b1020",
                              width: "100%",
                            }}
                          >
                            🔁 Simuler confirmation plateforme
                          </button>
                        </div>
                      )}

                    {isAffectable(selectedMission) && (
                      <div style={{ marginBottom: 18 }}>
                        <p
                          style={{
                            marginBottom: 8,
                            fontSize: 13,
                            color: "#374151",
                          }}
                        >
                          🚑 Sélectionnez un véhicule
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          {availableVehicles.map((v) => (
                            <button
                              key={v}
                              onClick={() =>
                                assignVehicle(selectedMission.id, v)
                              }
                              style={{
                                ...actionBtn,
                                background: "#C07EFF",
                                color: "#ffffff",
                                flex: "1 1 45%",
                              }}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedMission.is_locked && (
                      <div style={{ marginBottom: 18 }}>
                        <p
                          style={{
                            color: "#166534",
                            fontSize: 13,
                            marginBottom: 8,
                          }}
                        >
                          ✅ Véhicule affecté :{" "}
                          <strong>{selectedMission.assigned_vehicle|| ""}</strong>
                        </p>
                        <button
                          onClick={() =>
                            unassignVehicle(selectedMission.id)
                          }
                          style={{
                            ...actionBtn,
                            background: "#FF5E79",
                            color: "#ffffff",
                            width: "100%",
                          }}
                        >
                          🔄 Désaffecter le véhicule
                        </button>
                      </div>
                    )}

                    <hr
                      style={{ margin: "20px 0", borderColor: "#e5e7eb" }}
                    />

                    <h4
                      style={{
                        marginTop: 0,
                        marginBottom: 10,
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      <Clock size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Historique de la mission
                    </h4>

                    <TimelineItem label="Mission reçue" done={true} />
                    <TimelineItem
                      label="Acceptée par Bibulance"
                      date={selectedMission.accepted_at}
                      done={!!selectedMission.accepted_at}
                    />
                    <TimelineItem
                      label={`Confirmée par ${selectedMission.source_platform}`}
                      date={selectedMission.platform_confirmed_at}
                      done={!!selectedMission.platform_confirmed_at}
                    />
                    <TimelineItem
                      label="Véhicule affecté"
                      date={selectedMission.assigned_at}
                      done={!!selectedMission.assigned_at}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {page === "stats" && <StatsPage missions={missions} />}
      </div>
    </div>
  );
}

export default App;


