ALTER TABLE "audits" ADD COLUMN IF NOT EXISTS "isoStandard" character varying;
ALTER TABLE "audits" ADD COLUMN IF NOT EXISTS "startDate" timestamp without time zone;
ALTER TABLE "audits" ADD COLUMN IF NOT EXISTS "endDate" timestamp without time zone;

CREATE TABLE IF NOT EXISTS "audit_checklists" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "auditId" uuid NOT NULL,
  "section" character varying NOT NULL,
  "question" text NOT NULL,
  "isCompliant" boolean,
  "auditorNotes" text,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_audit_checklists" PRIMARY KEY ("id"),
  CONSTRAINT "FK_audit_checklists_audit" FOREIGN KEY ("auditId") REFERENCES "audits"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "audit_responsibles" (
  "auditId" uuid NOT NULL,
  "userId" uuid NOT NULL,
  CONSTRAINT "PK_audit_responsibles" PRIMARY KEY ("auditId", "userId"),
  CONSTRAINT "FK_audit_responsibles_audit" FOREIGN KEY ("auditId") REFERENCES "audits"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_audit_responsibles_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
