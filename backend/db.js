import Database from "better-sqlite3";

const db = new Database("bibulance.sqlite");

// TABLE PRINCIPALE : missions
db.exec(`
CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  source_platform TEXT,
  source_mission_id TEXT,
  status TEXT,
  rdv_time TEXT,
  pec_estimated_time TEXT,
  emitter_facility TEXT,
  destination_facility TEXT,
  contract_required INTEGER,
  patient_last_name TEXT,
  patient_first_name TEXT,
  vehicle_type TEXT,
  care_type TEXT,
  floor_info TEXT,
  notes TEXT,
  updated_at TEXT,

  /* 🔥 Colonnes ajoutées pour workflow régulateur */
  accepted_bibulance INTEGER DEFAULT 0,
  platform_confirmation INTEGER DEFAULT 0,
  assigned_vehicle TEXT DEFAULT NULL,
  is_locked INTEGER DEFAULT 0,

  /* 🔥 Historique */
  accepted_at TEXT DEFAULT NULL,
  platform_confirmed_at TEXT DEFAULT NULL,
  assigned_at TEXT DEFAULT NULL
);
`);

export default db;
