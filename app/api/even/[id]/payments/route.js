import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

export async function GET(request, { params }) {
  const auth = await authorize(request, ['ADMIN', 'FINANCIER']);
  if (auth.response) return auth.response;
  const { id } = await params;

  try {
    const payments = await prisma.evenPayment.findMany({
      where: { eventId: id },
      orderBy: [{ paidAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true, amount: true, paidAt: true, method: true, reference: true,
        note: true, isInitialAdvance: true, isLegacyEstimate: true, createdAt: true,
        createdBy: { select: { name: true } },
      },
    });
    return NextResponse.json(payments);
  } catch (error) {
    console.error('Erreur de lecture des paiements:', error);
    return NextResponse.json({ error: 'Impossible de récupérer les paiements.' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const auth = await authorize(request, ['ADMIN', 'FINANCIER']);
  if (auth.response) return auth.response;
  const { id: eventId } = await params;

  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const paidAt = new Date(body.paidAt || Date.now());
    const method = typeof body.method === 'string' ? body.method.trim().slice(0, 40) : '';
    const reference = typeof body.reference === 'string' ? body.reference.trim().slice(0, 100) : '';
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Le montant du paiement doit être supérieur à zéro.' }, { status: 400 });
    }
    if (!Number.isFinite(paidAt.getTime()) || paidAt.getTime() > Date.now() + 60_000) {
      return NextResponse.json({ error: 'La date du paiement est invalide ou future.' }, { status: 400 });
    }
    if (!['Espèces', 'Mobile Money', 'Virement', 'Carte', 'Chèque', 'Autre'].includes(method)) {
      return NextResponse.json({ error: 'Choisissez un mode de paiement valide.' }, { status: 400 });
    }

    const payment = await prisma.$transaction(async (tx) => {
      const event = await tx.even.findUnique({
        where: { id: eventId },
        select: { id: true, nom_evenement: true, categorie: true, montant: true, avance: true },
      });
      if (!event) {
        const error = new Error('Événement introuvable.');
        error.code = 'P2025';
        throw error;
      }
      if (event.montant == null) {
        const error = new Error('Ajoutez le montant contractuel avant d’enregistrer un paiement.');
        error.code = 'NO_CONTRACT_AMOUNT';
        throw error;
      }
      const balance = Math.max(0, event.montant - (event.avance || 0));
      if (amount > balance) {
        const error = new Error(`Le paiement dépasse le solde restant (${balance.toLocaleString('fr-FR')} FCFA).`);
        error.code = 'PAYMENT_OVER_BALANCE';
        throw error;
      }

      const created = await tx.evenPayment.create({
        data: {
          eventId,
          amount,
          paidAt,
          method,
          reference: reference || null,
          note: typeof body.note === 'string' ? body.note.trim().slice(0, 500) || null : null,
          createdById: auth.user.id,
        },
        select: {
          id: true, amount: true, paidAt: true, method: true, reference: true,
          note: true, isInitialAdvance: true, isLegacyEstimate: true, createdAt: true,
          createdBy: { select: { name: true } },
        },
      });
      await tx.even.update({ where: { id: eventId }, data: { avance: { increment: amount } } });
      await writeAuditLog({
        actor: auth.user,
        action: 'CREATE',
        entity: 'Paiement',
        entityId: created.id,
        summary: `a enregistré un paiement de ${amount.toLocaleString('fr-FR')} FCFA pour « ${event.nom_evenement || event.categorie} »`,
        metadata: { eventId, method },
        client: tx,
      });
      return created;
    }, { isolationLevel: 'Serializable' });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 });
    if (error.code === 'NO_CONTRACT_AMOUNT' || error.code === 'PAYMENT_OVER_BALANCE' || error.code === 'P2034') {
      return NextResponse.json({ error: error.message || 'Le solde a changé. Actualisez puis réessayez.' }, { status: 409 });
    }
    console.error('Erreur d’enregistrement du paiement:', error);
    return NextResponse.json({ error: 'Impossible d’enregistrer le paiement.' }, { status: 500 });
  }
}
