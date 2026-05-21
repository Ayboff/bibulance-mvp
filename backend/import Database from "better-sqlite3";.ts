import Database from "better-sqlite3";

const db = new Database("bibulance.sqlite");

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
  updated_at TEXT
);
`);

export default db;
