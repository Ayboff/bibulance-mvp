import express from "express";
import cors from "cors";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { query } from "./db.js";

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
   ROUTE 1 : Récupérer missions
------------------------------------------------------- */
app.get("/missions", async (req, res) => {
  try {
    const rows = await query(
      "SELECT * FROM missions ORDER BY rdv_time ASC"
    );

    res.json(rows);
  } catch (e) {
    console.error("Erreur /missions :", e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* -------------------------------------------------------
   ROUTE 2 : Mission de test
------------------------------------------------------- */
app.get("/test-mission", async (req, res) => {
  try {
    await query(
      `
      INSERT INTO missions (
        id, source_platform, source_mission_id, status, rdv_time,
        pec_estimated_time, emitter_facility, destination_facility,
        contract_required, patient_last_name, patient_first_name,
        vehicle_type, care_type, floor_info, notes, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
      )
    `,
      [
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
        new Date().toISOString(),
      ]
    );

    res.json({ success: true });
  } catch (e) {
    console.error("Erreur /test-mission :", e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* -------------------------------------------------------
   ROUTE 3 : Import CSV
------------------------------------------------------- */
app.post("/import", upload.single("file"), async (req, res) => {
  try {
    const records = parse(req.file.buffer.toString(), {
      columns: true,
      skip_empty_lines: true,
    });

    for (const r of records) {
      await query(
        `
        INSERT INTO missions (
          id, source_platform, source_mission_id, status, rdv_time,
          pec_estimated_time, emitter_facility, destination_facility,
          contract_required, patient_last_name, patient_first_name,
          vehicle_type, care_type, floor_info, notes, updated_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          rdv_time = EXCLUDED.rdv_time,
          updated_at = EXCLUDED.updated_at
      `,
        [
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
          r.notes || null,
          new Date().toISOString(),
        ]
      );
    }

    res.json({ imported: records.length });
  } catch (e) {
    console.error("Erreur /import :", e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* -------------------------------------------------------
   ROUTE 4 : Mission venant de l'app mobile
------------------------------------------------------- */
app.post("/missions/particulier", async (req, res) => {
  try {
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

    await query(
      `
      INSERT INTO missions (
        id, source_platform, source_mission_id, status, rdv_time,
        pec_estimated_time, emitter_facility, destination_facility,
        contract_required, patient_last_name, patient_first_name,
        vehicle_type, care_type, floor_info, notes, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
      )
    `,
      Object.values(mission)
    );

    broadcast({
      type: "mission_created",
      mission,
    });

    res.json({
      success: true,
      message: "Mission créée avec succès",
      mission,
    });
  } catch (e) {
    console.error("Erreur /missions/particulier :", e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* -------------------------------------------------------
   ROUTE 5 : Mise à jour d'une mission
------------------------------------------------------- */
app.patch("/missions/:id", async (req, res) => {
  try {
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

    await query(
      `
      UPDATE missions SET
        accepted_bibulance = COALESCE($1, accepted_bibulance),
        platform_confirmation = COALESCE($2, platform_confirmation),
        assigned_vehicle = COALESCE($3, assigned_vehicle),
        is_locked = COALESCE($4, is_locked),
        status = COALESCE($5, status),
        accepted_at = COALESCE($6, accepted_at),
        platform_confirmed_at = COALESCE($7, platform_confirmed_at),
        assigned_at = COALESCE($8, assigned_at)
      WHERE id = $9
    `,
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
      ]
    );

    broadcast({
      type: "mission_updated",
      id,
      fields: req.body,
    });

    res.json({ success: true });
  } catch (e) {
    console.error("Erreur PATCH mission :", e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* -------------------------------------------------------
   LANCEMENT DU SERVEUR
------------------------------------------------------- */
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Backend Bibulance + WebSocket sur port ${PORT}`);
});
