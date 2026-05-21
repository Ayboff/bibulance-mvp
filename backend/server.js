import express from "express";
import cors from "cors";
import multer from "multer";
import { parse } from "csv-parse/sync";
import db from "./db.js";

import http from "http";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

/* -------------------------------------------------------
   SERVEUR HTTP + WEBSOCKET
------------------------------------------------------- */
const server = http.createServer(app);

const wss = new WebSocketServer({ server });
wss.on("connection", () => {
  console.log("Client WebSocket connecté");
});

function broadcast(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(payload);
  });
}

/* -------------------------------------------------------
   ROUTE 1 : Récupérer missions (dashboard)
   -> UNIQUEMENT missions SQLite (réelles)
------------------------------------------------------- */
app.get("/missions", (req, res) => {
  try {
    const rows = db
      .prepare("SELECT * FROM missions ORDER BY rdv_time ASC")
      .all();

    // ❌ SUPPRESSION DES MISSIONS FAKE BACKEND
    // const fakePlatformMissions = generateFakePlatformMissions(20);
    // const all = [...rows, ...fakePlatformMissions];

    const all = [...rows]; // ✔️ uniquement missions réelles

    res.json(all);
  } catch (e) {
    console.error("Erreur /missions :", e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* -------------------------------------------------------
   ROUTE 2 : Mission de test (Bibulance)
------------------------------------------------------- */
app.get("/test-mission", (req, res) => {
  const insert = db.prepare(`
    INSERT INTO missions (
      id, source_platform, source_mission_id, status, rdv_time,
      pec_estimated_time, emitter_facility, destination_facility,
      contract_required, patient_last_name, patient_first_name,
      vehicle_type, care_type, floor_info, notes, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    "test-2",
    "bibulance",
    "002",
    "programmee",
    "2026-03-26 15:00",
    null,
    "Clinique Pasteur",
    "CHU Évry",
    1,
    "Dupont",
    "Jean",
    "VSL",
    null,
    "3e étage",
    "Patient à mobilité réduite",
    new Date().toISOString()
  );

  res.json({ success: true });
});

/* -------------------------------------------------------
   ROUTE 3 : Import CSV -> persistance SQLite
------------------------------------------------------- */
app.post("/import", upload.single("file"), (req, res) => {
  const records = parse(req.file.buffer.toString(), {
    columns: true,
    skip_empty_lines: true,
  });

  const insert = db.prepare(`
    INSERT OR REPLACE INTO missions VALUES (
      ?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now')
    )
  `);

  records.forEach((r) => {
    insert.run(
      `${r.source_platform}-${r.source_mission_id}`,
      r.source_platform,
      r.source_mission_id,
      r.status,
      r.rdv_time,
      r.pec_estimated_time || null,
      r.emitter_facility,
      r.destination_facility,
      r.contract_required === "true" ? 1 : 0,
      r.patient_last_name,
      r.patient_first_name,
      r.vehicle_type,
      r.care_type || null,
      r.floor_info || null,
      r.notes || null
    );
  });

  res.json({ imported: records.length });
});

/* -------------------------------------------------------
   ROUTE 4 : Mission venant de l'app mobile Bibulance
------------------------------------------------------- */
app.post("/missions/particulier", (req, res) => {
  const {
    firstname,
    lastname,
    phone,
    depart_address,
    arrival_address,
    date,
    time,
    transport_type,
    reason,
    comment,
    patient_birthdate,
    patient_social_security,
  } = req.body;

  const rdv_time = `${date} ${time}`;

  const mission = {
    id: `mobile-${Date.now()}`,
    source_platform: "bibulance_mobile",
    source_mission_id: Date.now().toString(),
    status: "programmee",
    rdv_time,
    pec_estimated_time: null,
    emitter_facility: depart_address,
    destination_facility: arrival_address,
    contract_required: 0,
    patient_last_name: lastname,
    patient_first_name: firstname,
    vehicle_type: transport_type === "ambulance" ? "AMB" : "VSL",
    care_type: reason || null,
    floor_info: null,
    notes: JSON.stringify({
      comment: comment || null,
      patient_birthdate: patient_birthdate || null,
      patient_social_security: patient_social_security || null,
    }),
    updated_at: new Date().toISOString(),
  };

  const stmt = db.prepare(`
    INSERT INTO missions (
      id, source_platform, source_mission_id, status, rdv_time,
      pec_estimated_time, emitter_facility, destination_facility,
      contract_required, patient_last_name, patient_first_name,
      vehicle_type, care_type, floor_info, notes, updated_at
    ) VALUES (
      @id, @source_platform, @source_mission_id, @status, @rdv_time,
      @pec_estimated_time, @emitter_facility, @destination_facility,
      @contract_required, @patient_last_name, @patient_first_name,
      @vehicle_type, @care_type, @floor_info, @notes, @updated_at
    )
  `);

  stmt.run(mission);

  broadcast({
    type: "mission_created",
    mission,
  });

  res.json({
    success: true,
    message: "Mission créée avec succès",
    mission,
  });
});

/* -------------------------------------------------------
   ROUTE 5 : Mise à jour d'une mission
------------------------------------------------------- */
app.patch("/missions/:id", (req, res) => {
  const id = req.params.id;

  const {
    accepted_bibulance,
    platform_confirmation,
    assigned_vehicle,
    is_locked,
    status,
    accepted_at,
    platform_confirmed_at,
    assigned_at,
  } = req.body;

  const sql = `
    UPDATE missions SET
      accepted_bibulance = COALESCE(?, accepted_bibulance),
      platform_confirmation = COALESCE(?, platform_confirmation),
      assigned_vehicle = COALESCE(?, assigned_vehicle),
      is_locked = COALESCE(?, is_locked),
      status = COALESCE(?, status),
      accepted_at = COALESCE(?, accepted_at),
      platform_confirmed_at = COALESCE(?, platform_confirmed_at),
      assigned_at = COALESCE(?, assigned_at)
    WHERE id = ?
  `;

  db.run(
    sql,
    [
      accepted_bibulance,
      platform_confirmation,
      assigned_vehicle,
      is_locked,
      status,
      accepted_at,
      platform_confirmed_at,
      assigned_at,
      id,
    ],
    function (err) {
      if (err) {
        console.error("Erreur UPDATE mission :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      broadcast({
        type: "mission_updated",
        id,
        fields: req.body,
      });

      res.json({ success: true });
    }
  );
});
/* -------------------------------------------------------
/* -------------------------------------------------------
  /* -------------------------------------------------------
   LANCEMENT DU SERVEUR
------------------------------------------------------- */
const PORT = process.env.PORT || 3001;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend Bibulance + WebSocket sur http://10.10.95.133:${PORT}`);
});

