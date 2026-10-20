CREATE TABLE "EvenPayment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "method" TEXT,
    "reference" TEXT,
    "note" TEXT,
    "isInitialAdvance" BOOLEAN NOT NULL DEFAULT false,
    "isLegacyEstimate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    CONSTRAINT "EvenPayment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EvenPayment_eventId_paidAt_idx" ON "EvenPayment"("eventId", "paidAt");
CREATE INDEX "EvenPayment_paidAt_idx" ON "EvenPayment"("paidAt");
CREATE INDEX "Even_date_debut_idx" ON "Even"("date_debut");
CREATE INDEX "Even_agent_id_date_debut_idx" ON "Even"("agent_id", "date_debut");

ALTER TABLE "EvenPayment" ADD CONSTRAINT "EvenPayment_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "Even"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EvenPayment" ADD CONSTRAINT "EvenPayment_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Legacy advances have no payment timestamp. Store them separately and use the
-- event creation time only as an explicit estimate; never treat it as verified.
INSERT INTO "EvenPayment" (
    "id", "eventId", "amount", "paidAt", "method", "note", "isInitialAdvance", "isLegacyEstimate", "createdAt"
)
SELECT
    md5(e."id" || ':' || clock_timestamp()::text),
    e."id",
    e."avance",
    e."createdAt",
    'Historique',
    'Avance historique importée. Date estimée à la date de création de l’événement.',
    true,
    true,
    CURRENT_TIMESTAMP
FROM "Even" e
WHERE e."avance" IS NOT NULL AND e."avance" > 0;
