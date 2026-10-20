import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authorize } from "@/lib/apiAuth";
import { writeAuditLog } from '@/lib/auditLog';

// Supprimer un département
export async function DELETE(request, { params }) {
  const auth = await authorize(request, ["ADMIN"]);
  if (auth.response) return auth.response;
  const { id } = await params;

  try {
    await prisma.$transaction(async (tx) => {
      const event = await tx.even.findUnique({ where: { id }, select: { id: true, nom_evenement: true, categorie: true } });
      await tx.even.delete({ where: { id } });
      if (event) await writeAuditLog({ actor: auth.user, action: 'DELETE', entity: 'Évènement', entityId: id, summary: `a supprimé l’évènement « ${event.nom_evenement || event.categorie} »`, client: tx });
    });

    return NextResponse.json({ message: "Delete success" }, { status: 200 });
  } catch (error) {
    console.error("Erreur suppression : ", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const auth = await authorize(request, ["ADMIN", "FINANCIER"]);
  if (auth.response) return auth.response;
  try {
    const { id } = await params;
    const body = await request.json();

    const adminFields = new Set(['visible', 'nom_evenement', 'nom_client', 'contact_client', 'categorie', 'type', 'description', 'image', 'fiche', 'montant', 'avance', 'date_debut', 'date_fin', 'salle_ids', 'agent_id', 'organise_par_ccjab']);
    const financialFields = new Set(['montant', 'visible']);
    const allowedFields = auth.user.role === 'ADMIN' ? adminFields : financialFields;
    const unsupportedFields = Object.keys(body).filter((field) => !allowedFields.has(field));
    if (unsupportedFields.length) {
      return NextResponse.json({ error: 'Votre rôle ne peut pas modifier ces champs.', fields: unsupportedFields }, { status: 403 });
    }

    // On prépare l'objet de mise à jour
    // On ne remplit que les champs qui sont présents dans la requête
    const updateData = {};

    // 1. GESTION DE LA VISIBILITÉ (Switch)
    if (body.visible !== undefined) {
      updateData.visible = body.visible;
    }

    // 2. GESTION DU FORMULAIRE ET DE L'IMAGE

    // Champs Textes
    if (body.nom_evenement !== undefined) updateData.nom_evenement = body.nom_evenement;
    if (body.nom_client !== undefined) updateData.nom_client = body.nom_client;
    if (body.organise_par_ccjab !== undefined) {
      if (typeof body.organise_par_ccjab !== 'boolean') return NextResponse.json({ error: 'Le statut d’organisateur est invalide.' }, { status: 400 });
      updateData.organise_par_ccjab = body.organise_par_ccjab;
    }
    if (body.contact_client !== undefined) updateData.contact_client = body.contact_client;
    if (body.categorie !== undefined) updateData.categorie = body.categorie;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.description !== undefined) updateData.description = body.description;

    // Champ Image
    if (body.image !== undefined) updateData.image = body.image;
    if (body.fiche !== undefined) updateData.fiche = body.fiche;

    // Champs Numériques (Conversion nécessaire String -> Float)
    if (body.montant !== undefined) updateData.montant = Number(body.montant);
    if (body.avance !== undefined) updateData.avance = Number(body.avance);

    // Champs Dates (Conversion nécessaire String ISO -> Date Object)
    if (body.date_debut !== undefined) updateData.date_debut = new Date(body.date_debut);
    if (body.date_fin !== undefined) updateData.date_fin = new Date(body.date_fin);

    if ([updateData.montant, updateData.avance].some((value) => value !== undefined && (!Number.isFinite(value) || value < 0))) {
      return NextResponse.json({ error: 'Les montants doivent être des nombres positifs.' }, { status: 400 });
    }
    const current = await prisma.even.findUnique({ where: { id }, select: { montant: true, avance: true, date_debut: true, date_fin: true, salles: { select: { id: true } } } });
    if (!current) return NextResponse.json({ error: 'Évènement introuvable.' }, { status: 404 });
    const nextAmount = updateData.montant ?? current.montant;
    const nextAdvance = updateData.avance ?? current.avance ?? 0;
    if (nextAmount !== null && nextAdvance > nextAmount) {
      return NextResponse.json({ error: 'L’avance ne peut pas dépasser le montant total.' }, { status: 400 });
    }
    if (auth.user.role !== 'ADMIN' && body.avance !== undefined) {
      return NextResponse.json({ error: 'Enregistrez une avance depuis l’historique des paiements.' }, { status: 403 });
    }
    if (auth.user.role === 'ADMIN' && body.avance !== undefined && nextAdvance < (current.avance || 0)) {
      return NextResponse.json({ error: 'Une avance enregistrée ne peut pas être diminuée. Créez une opération de remboursement dédiée.' }, { status: 400 });
    }
    const nextStart = updateData.date_debut ?? current.date_debut;
    const nextEnd = updateData.date_fin ?? current.date_fin;
    if (!Number.isFinite(nextStart.getTime()) || !Number.isFinite(nextEnd.getTime()) || nextStart >= nextEnd) {
      return NextResponse.json({ error: 'La période de l’évènement est invalide.' }, { status: 400 });
    }
    if (updateData.date_debut || updateData.date_fin || updateData.salles) {
      const roomIds = updateData.salles?.set?.map((room) => room.id) ?? current.salles.map((room) => room.id);
      const conflict = await prisma.even.findFirst({
        where: { id: { not: id }, salles: { some: { id: { in: roomIds } } }, date_debut: { lt: nextEnd }, date_fin: { gt: nextStart } },
        select: { id: true },
      });
      if (conflict) return NextResponse.json({ error: 'Une salle sélectionnée est déjà réservée sur cette période.' }, { status: 409 });
    }

    // Relations (Salle & Agent)
    // On gère le cas où l'utilisateur sélectionne "Aucune salle" (chaîne vide -> null)
    if (body.salle_ids !== undefined) {
      if (!Array.isArray(body.salle_ids) || body.salle_ids.some((roomId) => typeof roomId !== 'string') || new Set(body.salle_ids).size !== body.salle_ids.length) {
        return NextResponse.json({ error: 'La sélection des salles est invalide.' }, { status: 400 });
      }
      // "set" écrase les anciennes salles associées par les nouvelles
      updateData.salles = {
        set: body.salle_ids.map(id => ({ id }))
      };
    }
    if (body.agent_id !== undefined) {
      updateData.agent_id = body.agent_id === "" ? null : body.agent_id;
    }

    // Sécurité : Si aucune donnée valide n'est envoyée, on arrête là
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Aucune donnée à modifier" }, { status: 400 });
    }

    // Mise à jour effective
    const updatedEvent = await prisma.$transaction(async (tx) => {
      const updated = await tx.even.update({ where: { id }, data: updateData });
      const advanceDelta = Math.max(0, (updateData.avance ?? current.avance ?? 0) - (current.avance ?? 0));
      if (advanceDelta > 0) await tx.evenPayment.create({
        data: {
          eventId: id,
          amount: advanceDelta,
          paidAt: new Date(),
          method: 'Correction',
          note: 'Avance augmentée depuis la fiche de l’événement.',
          createdById: auth.user.id,
        },
      });
      await writeAuditLog({
        actor: auth.user,
        action: 'UPDATE',
        entity: 'Évènement',
        entityId: id,
        summary: body.visible !== undefined && Object.keys(body).length === 1
          ? `a ${body.visible ? 'publié' : 'masqué'} l’évènement « ${updated.nom_evenement || updated.categorie} »`
          : `a modifié l’évènement « ${updated.nom_evenement || updated.categorie} »`,
        metadata: { changedFields: Object.keys(body) },
        client: tx,
      });
      return updated;
    });

    return NextResponse.json(updatedEvent, { status: 200 });

  } catch (error) {

    // Gestion spécifique si l'événement n'existe pas
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Évènement introuvable." }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'évènement." },
      { status: 500 }
    );
  }
}
