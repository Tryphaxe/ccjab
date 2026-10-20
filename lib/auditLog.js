import prisma from '@/lib/prisma';

/** Store an immutable audit entry using the authenticated actor snapshot. */
export async function writeAuditLog({ actor, actorId = actor?.id, action, entity, entityId = null, summary, metadata = undefined, client = prisma }) {
  if (!actor?.id || !actor?.role) throw new Error('Un utilisateur authentifié est requis pour journaliser une action.');

  return client.auditLog.create({
    data: {
      actorId,
      actorName: actor.name,
      actorEmail: actor.email,
      actorRole: actor.role,
      action,
      entity,
      entityId: entityId ? String(entityId) : null,
      summary,
      ...(metadata ? { metadata } : {}),
    },
  });
}
