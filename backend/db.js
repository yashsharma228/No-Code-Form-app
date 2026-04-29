import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

function isTruthy(value) {
  return ["1", "true", "yes", "on", "require", "required"].includes(
    String(value || "").trim().toLowerCase()
  );
}

function isFalsy(value) {
  return ["0", "false", "no", "off", "disable", "disabled"].includes(
    String(value || "").trim().toLowerCase()
  );
}

function getSslConfig() {
  const sslMode = process.env.MYSQL_SSL;
  const caFromEnv = process.env.MYSQL_SSL_CA?.replace(/\\n/g, "\n");
  const caPath = process.env.MYSQL_SSL_CA_PATH;

  if (isFalsy(sslMode) && !caFromEnv && !caPath) {
    return undefined;
  }

  const sslConfig = {
    minVersion: "TLSv1.2",
    rejectUnauthorized: !isFalsy(process.env.MYSQL_SSL_REJECT_UNAUTHORIZED),
  };

  if (caFromEnv) {
    sslConfig.ca = caFromEnv;
    return sslConfig;
  }

  if (caPath) {
    sslConfig.ca = fs.readFileSync(caPath, "utf8");
    return sslConfig;
  }

  if (isTruthy(sslMode) || sslMode === undefined) {
    return sslConfig;
  }

  return undefined;
}

const connectionConfig = {
  host: process.env.MYSQL_HOST || process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQL_USER || process.env.DB_USER || "root",
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || "dynamic_form_builder",
  ssl: getSslConfig(),
  enableKeepAlive: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

async function ensureSchema(connection) {
  await connection.execute(
    `ALTER TABLE forms
     ADD COLUMN IF NOT EXISTS theme_json LONGTEXT NULL AFTER description`
  );
}

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(connectionConfig);
  }

  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

export async function connectDatabase() {
  try {
    const connection = await getPool().getConnection();
    await connection.ping();
    await ensureSchema(connection);
    connection.release();
    console.log("MySQL connected successfully");
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    process.exit(1);
  }
}


