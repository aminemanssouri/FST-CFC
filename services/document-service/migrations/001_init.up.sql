-- documents table
CREATE TABLE IF NOT EXISTS documents (
    id              SERIAL PRIMARY KEY,
    owner_id        VARCHAR(100) NOT NULL,
    filename        VARCHAR(500) NOT NULL,
    content_type    VARCHAR(100) NOT NULL,
    size            BIGINT NOT NULL,
    s3_key          VARCHAR(1000) NOT NULL UNIQUE,
    version         INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON documents(deleted_at);
