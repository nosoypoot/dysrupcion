CREATE TABLE member_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  linkedin TEXT NOT NULL,
  github TEXT,
  origen TEXT,
  expertise TEXT,
  motivacion TEXT NOT NULL,
  acepta_contrato INTEGER NOT NULL DEFAULT 0,
  directorio_publico INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT,
  reviewed_by TEXT
);

CREATE UNIQUE INDEX idx_member_applications_email ON member_applications(email);
CREATE INDEX idx_member_applications_status ON member_applications(status);
CREATE INDEX idx_member_applications_created_at ON member_applications(created_at);
