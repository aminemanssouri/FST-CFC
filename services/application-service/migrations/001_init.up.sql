-- applications table
CREATE TABLE IF NOT EXISTS applications (
    id              SERIAL PRIMARY KEY,
    candidate_id    VARCHAR(100) NOT NULL,
    program_id      INTEGER NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    full_name       VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(50),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_program_id ON applications(program_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_deleted_at ON applications(deleted_at);

-- decisions table
CREATE TABLE IF NOT EXISTS decisions (
    id              SERIAL PRIMARY KEY,
    application_id  INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    decided_by      VARCHAR(100) NOT NULL,
    status          VARCHAR(20) NOT NULL,
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decisions_application_id ON decisions(application_id);

-- application_histories table (audit log)
CREATE TABLE IF NOT EXISTS application_histories (
    id              SERIAL PRIMARY KEY,
    application_id  INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    old_status      VARCHAR(20) NOT NULL,
    new_status      VARCHAR(20) NOT NULL,
    changed_by      VARCHAR(100) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_histories_application_id ON application_histories(application_id);
