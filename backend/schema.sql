CREATE DATABASE IF NOT EXISTS nocode_forms
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE nocode_forms;

CREATE TABLE IF NOT EXISTS forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  share_slug VARCHAR(255) NOT NULL UNIQUE,
  theme_json LONGTEXT,
  fields_json LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NOT NULL,
  answers_json LONGTEXT NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_responses_form_id
    FOREIGN KEY (form_id)
    REFERENCES forms(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_form_id ON responses(form_id);
CREATE INDEX idx_forms_created ON forms(created_at);
CREATE INDEX idx_forms_share_slug ON forms(share_slug);