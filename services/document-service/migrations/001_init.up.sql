-- documents table (maps to class diagram: Document)
CREATE TABLE IF NOT EXISTS documents (
    id              SERIAL PRIMARY KEY,
    inscription_id  INTEGER NOT NULL,
    nom_fichier     VARCHAR(500) NOT NULL,
    content_type    VARCHAR(100) NOT NULL,
    size            BIGINT NOT NULL,
    url_stockage    VARCHAR(1000) NOT NULL,
    version         INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_documents_inscription_id ON documents(inscription_id);
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON documents(deleted_at);
