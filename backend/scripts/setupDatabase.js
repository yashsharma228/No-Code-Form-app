import fs from "fs";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

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

const databaseName = process.env.MYSQL_DATABASE || process.env.DB_NAME || "dynamic_form_builder";

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST || process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQL_USER || process.env.DB_USER || "root",
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "",
  ssl: getSslConfig(),
  multipleStatements: true,
});

try {
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
  await connection.query(`USE \`${databaseName}\``);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS forms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      theme_json LONGTEXT NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS fields (
      id INT AUTO_INCREMENT PRIMARY KEY,
      form_id INT NOT NULL,
      label VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      placeholder VARCHAR(255) NULL,
      is_required TINYINT(1) DEFAULT 0,
      sort_order INT DEFAULT 0,
      options LONGTEXT NULL,
      validation_rules LONGTEXT NULL,
      CONSTRAINT fk_fields_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      form_id INT NOT NULL,
      answers LONGTEXT NOT NULL,
      respondent_email VARCHAR(255) NULL,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_responses_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`CREATE INDEX IF NOT EXISTS idx_fields_form_id ON fields(form_id)`);
  await connection.query(`CREATE INDEX IF NOT EXISTS idx_responses_form_id ON responses(form_id)`);
  await connection.query(`CREATE INDEX IF NOT EXISTS idx_forms_updated_at ON forms(updated_at)`);

  console.log(`Database '${databaseName}' is ready.`);
} finally {
  await connection.end();
}