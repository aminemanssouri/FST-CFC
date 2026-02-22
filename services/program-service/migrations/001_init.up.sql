-- formations table (maps to class diagram: Formation)
CREATE TABLE IF NOT EXISTS formations (
    id                      SERIAL PRIMARY KEY,
    etablissement_id        VARCHAR(100) NOT NULL,
    coordinateur_id         VARCHAR(100) NOT NULL,
    titre                   VARCHAR(255) NOT NULL,
    description             TEXT,
    etat                    VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',
    date_ouverture          TIMESTAMPTZ,
    date_fermeture          TIMESTAMPTZ,
    inscriptions_ouvertes   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_formations_etablissement_id ON formations(etablissement_id);
CREATE INDEX IF NOT EXISTS idx_formations_coordinateur_id ON formations(coordinateur_id);
CREATE INDEX IF NOT EXISTS idx_formations_etat ON formations(etat);
CREATE INDEX IF NOT EXISTS idx_formations_deleted_at ON formations(deleted_at);
