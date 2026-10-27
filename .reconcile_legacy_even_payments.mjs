import 'dotenv/config';
import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL,
  connectionTimeoutMillis: 10000,
});

await client.connect();
try {
  await client.query('BEGIN');
  const inserted = await client.query(
    `INSERT INTO public."EvenPayment" (
       "id", "eventId", "amount", "paidAt", "method", "note",
       "isInitialAdvance", "isLegacyEstimate", "createdAt"
     )
     SELECT md5(e."id" || ':' || clock_timestamp()::text), e."id", e."avance", e."createdAt",
       $1, $2, true, true, CURRENT_TIMESTAMP
     FROM public."Even" e
     WHERE e."avance" IS NOT NULL AND e."avance" > 0
       AND NOT EXISTS (
         SELECT 1 FROM public."EvenPayment" ep
         WHERE ep."eventId" = e."id"
           AND ep."isInitialAdvance" = true
           AND ep."isLegacyEstimate" = true
       )`,
    ['Historique', 'Avance historique importée. Date estimée à la date de création de l’événement.'],
  );
  const verification = await client.query(
    `WITH source AS (
       SELECT id, avance FROM public."Even" WHERE avance IS NOT NULL AND avance > 0
     ), legacy AS (
       SELECT "eventId", count(*)::int AS n, sum(amount)::float AS amount
       FROM public."EvenPayment"
       WHERE "isInitialAdvance" = true AND "isLegacyEstimate" = true
       GROUP BY "eventId"
     )
     SELECT
       (SELECT count(*)::int FROM source) AS expected,
       (SELECT count(*)::int FROM legacy) AS actual,
       (SELECT count(*)::int FROM source s LEFT JOIN legacy l ON l."eventId" = s.id WHERE l."eventId" IS NULL) AS missing,
       (SELECT count(*)::int FROM source s JOIN legacy l ON l."eventId" = s.id WHERE l.amount <> s.avance OR l.n <> 1) AS mismatched`,
  );
  const result = verification.rows[0];
  if (result.missing !== 0 || result.mismatched !== 0 || result.expected !== result.actual) {
    throw new Error(`Backfill verification failed: ${JSON.stringify(result)}`);
  }
  await client.query('COMMIT');
  console.log(JSON.stringify({ inserted: inserted.rowCount, verification: result }));
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error(error?.message || 'Backfill failed.');
  process.exitCode = 1;
} finally {
  await client.end();
}
