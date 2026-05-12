CREATE TABLE initiatives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  track TEXT NOT NULL CHECK (track IN ('Eventos', 'Educacion', 'Emprendimiento', 'Impacto Local', 'Puente')),
  proposer_name TEXT NOT NULL,
  proposer_email TEXT NOT NULL,
  website_url TEXT,
  logo_url TEXT,
  looking_for TEXT,
  public_contact TEXT,
  launched_at TEXT,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
  reviewed_at TEXT,
  reviewed_by TEXT,
  published_at TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed'))
);

CREATE INDEX idx_initiatives_review_status ON initiatives(review_status);
CREATE INDEX idx_initiatives_track ON initiatives(track);
CREATE INDEX idx_initiatives_status ON initiatives(status);
CREATE INDEX idx_initiatives_submitted_at ON initiatives(submitted_at);
