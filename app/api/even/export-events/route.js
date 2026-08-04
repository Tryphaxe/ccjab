import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import PDFDocument from 'pdfkit-table';
import fs from 'fs';
import path from 'path';

async function generatePdfBuffer(events, monthLabel) {
  return new Promise(async (resolve, reject) => {
    try {
      // Marge légèrement augmentée (40) pour un aspect plus aéré
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
        layout: 'landscape'
      });

      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // --- 1. AJOUT DU LOGO ---
      // On cherche le logo dans le dossier "public" à la racine de votre projet Next.js
      const logoPath = path.join(process.cwd(), 'public', '/images/favicon.png');

      if (fs.existsSync(logoPath)) {
        // Place l'image en haut à gauche (x: 40, y: 30)
        doc.image(logoPath, 40, 30, { width: 40 });
      }

      // --- 2. EN-TÊTE DU DOCUMENT ---
      // On force la position Y pour aligner le texte au centre sans être bloqué par le logo
      doc.y = 40;

      doc.font('Times-Bold').fontSize(14).fillColor('#0f172a')
        .text(`Rapport des Évènements (Période : ${monthLabel})`, { align: 'center' });

      doc.moveDown(0.5);

      // --- 3. AFFICHAGE DU NOMBRE D'ÉVÈNEMENTS ---
      doc.font('Times-Bold').fontSize(11).fillColor('#08940f')
        .text(`Total : ${events.length} évènement(s)`, { align: 'center' });

      doc.moveDown(2.5); // Grand espace avant le tableau

      if (events.length === 0) {
        doc.fontSize(14).fillColor('black').text("Aucun évènement trouvé pour cette période.", { align: 'center' });
      } else {

        // --- 4. DESIGN DU TABLEAU ---
        const tableArray = {
          headers: [
            { label: "Nom de l'évènement", property: 'nom', width: 140 },
            { label: "Catégorie", property: 'categorie', width: 80 },
            { label: "Type", property: 'type', width: 70 },
            { label: "Client", property: 'client', width: 100 },
            { label: "Contact", property: 'contact', width: 85 },
            { label: "Début", property: 'debut', width: 65 },
            { label: "Fin", property: 'fin', width: 65 },
            { label: "Montant", property: 'montant', width: 75 },
            { label: "Avance", property: 'avance', width: 75 },
          ],
          datas: events.map((e) => ({
            nom: e.nom_evenement || e.description || 'N/A',
            categorie: e.categorie || 'N/A',
            type: e.type || 'N/A',
            client: e.nom_client || 'N/A',
            contact: e.contact_client || 'N/A',
            debut: new Date(e.date_debut).toLocaleDateString('fr-FR'),
            fin: new Date(e.date_fin).toLocaleDateString('fr-FR'),
            montant: e.montant ? `${e.montant.toLocaleString('fr-FR')} F` : '0 F',
            avance: e.avance ? `${e.avance.toLocaleString('fr-FR')} F` : '0 F',
          }))
        };

        await doc.table(tableArray, {
          // Design des en-têtes (Texte en gras, plus foncé)
          prepareHeader: () => doc.font("Times-Bold").fontSize(10).fillColor('#094115'),

          // Design des lignes (Alternance de couleur type "Zebra striping")
          prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            // 1. Appliquer le fond de ligne en premier
            if (indexColumn === 0) {
              if (indexRow % 2 !== 0) {
                // Fond gris très clair pour les lignes impaires (sans 3ème paramètre)
                doc.addBackground(rectRow, '#f8fafc');
              } else {
                // Fond blanc pour les lignes paires
                doc.addBackground(rectRow, '#ffffff');
              }
            }

            // 2. Définir la police, la taille et la couleur du TEXTE par-dessus le fond
            doc.font("Times-Roman").fontSize(9).fillColor('#334155');
          },
          // Bordures subtiles (gris doux)
          divider: {
            header: { disabled: false, width: 1.5, opacity: 1, color: '#cbd5e1' },
            horizontal: { disabled: false, width: 0.5, opacity: 0.5, color: '#e2e8f0' },
          },
          padding: 6, // Plus d'espace interne dans les cellules
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    let events = [];
    let monthLabel = "Tous les mois";

    if (month === 'all') {
      events = await prisma.even.findMany({
        orderBy: { date_debut: 'desc' }
      });
    } else if (month) {
      const [yearStr, monthStr] = month.split('-');
      const y = parseInt(yearStr);
      const m = parseInt(monthStr);

      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 0, 23, 59, 59, 999);

      monthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(startDate);
      monthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

      events = await prisma.even.findMany({
        where: {
          date_debut: {
            gte: startDate,
            lte: endDate,
          }
        },
        orderBy: { date_debut: 'asc' }
      });
    }

    const pdfBuffer = await generatePdfBuffer(events, monthLabel);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Rapport_Evenements_${month === 'all' ? 'tous' : month}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Erreur API export-events:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF." },
      { status: 500 }
    );
  }
}