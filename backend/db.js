import pkg from "pg";
const { Pool } = pkg;

// Render fournit DATABASE_URL automatiquement
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // obligatoire pour Render
  },
});

// Création automatique de la table missions
async function init() {
  await pool.query(`
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
      accepted_bibulance INTEGER DEFAULT 0,
      platform_confirmation INTEGER DEFAULT 0,
      assigned_vehicle TEXT DEFAULT NULL,
      is_locked INTEGER DEFAULT 0,
      accepted_at TEXT DEFAULT NULL,
      platform_confirmed_at TEXT DEFAULT NULL,
      assigned_at TEXT DEFAULT NULL
    );
  `);

  console.log("✔ Table missions prête (PostgreSQL)");
}

init();

// Fonction utilitaire pour exécuter des requêtes
export async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

export default { query };

