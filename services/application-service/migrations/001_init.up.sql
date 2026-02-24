-- inscriptions table (maps to class diagram: Inscription)
CREATE TABLE IF NOT EXISTS inscriptions (
    id              SERIAL PRIMARY KEY,
    candidat_id     VARCHAR(100) NOT NULL,
    formation_id    INTEGER NOT NULL,
    etat            VARCHAR(20) NOT NULL DEFAULT 'PREINSCRIPTION',
    nom_complet     VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    telephone       VARCHAR(50),
    notes           TEXT,
    date_creation   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_inscriptions_candidat_id ON inscriptions(candidat_id);
CREATE INDEX IF NOT EXISTS idx_inscriptions_formation_id ON inscriptions(formation_id);
CREATE INDEX IF NOT EXISTS idx_inscriptions_etat ON inscriptions(etat);
CREATE INDEX IF NOT EXISTS idx_inscriptions_deleted_at ON inscriptions(deleted_at);

-- decisions table
CREATE TABLE IF NOT EXISTS decisions (
    id              SERIAL PRIMARY KEY,
    inscription_id  INTEGER NOT NULL REFERENCES inscriptions(id) ON DELETE CASCADE,
    decide_par      VARCHAR(100) NOT NULL,
    etat            VARCHAR(20) NOT NULL,
    commentaire     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decisions_inscription_id ON decisions(inscription_id);

-- inscription_historiques table (audit log)
CREATE TABLE IF NOT EXISTS inscription_historiques (
    id              SERIAL PRIMARY KEY,
    inscription_id  INTEGER NOT NULL REFERENCES inscriptions(id) ON DELETE CASCADE,
    ancien_etat     VARCHAR(20) NOT NULL,
    nouvel_etat     VARCHAR(20) NOT NULL,
    modifie_par     VARCHAR(100) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inscription_historiques_inscription_id ON inscription_historiques(inscription_id);
