-- programs table
CREATE TABLE IF NOT EXISTS programs (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    field           VARCHAR(100),
    duration        INTEGER NOT NULL DEFAULT 1,
    is_published    BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_programs_deleted_at ON programs(deleted_at);

-- registration_windows table
CREATE TABLE IF NOT EXISTS registration_windows (
    id                  SERIAL PRIMARY KEY,
    program_id          INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    open_date           TIMESTAMPTZ NOT NULL,
    close_date          TIMESTAMPTZ NOT NULL,
    max_applicants      INTEGER DEFAULT 0,
    eligibility_rules   JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registration_windows_program_id ON registration_windows(program_id);
