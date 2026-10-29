import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const colors = {
  background: '#121212', // Fond général sombre style cinéma
  ink: '#ffffff',        // Texte principal en blanc
  muted: '#9a9a9a',      // Texte secondaire / libellés
  line: '#2e2e2e',       // Lignes de séparation discrètes
  accent: '#ff5722',     // Touche d'accentuation (ou couleur personnalisable)
  soft: '#1e1e1e',       // Fond de repli si l'image manque
};

const dateOptions = { timeZone: 'Africa/Abidjan', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
const timeOptions = { timeZone: 'Africa/Abidjan', hour: '2-digit', minute: '2-digit' };
const formatDate = (value) => value ? new Intl.DateTimeFormat('fr-FR', dateOptions).format(new Date(value)) : 'Date à confirmer';
const formatTime = (value) => value ? new Intl.DateTimeFormat('fr-FR', timeOptions).format(new Date(value)) : '';
const formatMoney = (value) => `${new Intl.NumberFormat('fr-FR').format(value).replace(/[\u00a0\u202f]/g, ' ')} FCFA`;

// Fonction utilitaire pour charger la police Barlow depuis Google Fonts à la volée
async function loadBarlowFont() {
  try {
    const response = await fetch('https://fonts.gstatic.com/s/barlow/v12/7cHpv4kjgoGqM7E_Civ4hsUTWMiQ.ttf');
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

async function loadFallbackEventImage() {
  try {
    return await readFile(path.join(process.cwd(), 'public', 'images', 'default-salle.png'));
  } catch (error) {
    console.error('Image de repli des billets introuvable:', error);
    return null;
  }
}

async function loadEventImage(imageUrl) {
  if (!imageUrl || !process.env.NEXT_PUBLIC_SUPABASE_URL) return loadFallbackEventImage();
  try {
    const image = new URL(imageUrl);
    const storage = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (image.origin !== storage.origin || !image.pathname.startsWith('/storage/v1/object/public/event/')) return loadFallbackEventImage();

    const response = await fetch(image, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(8000) });
    const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
    if (!response.ok || !contentType?.startsWith('image/')) return loadFallbackEventImage();
    const length = Number(response.headers.get('content-length') || 0);
    if (length > 8 * 1024 * 1024 || !response.body) return loadFallbackEventImage();

    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8 * 1024 * 1024) {
        await reader.cancel();
        return loadFallbackEventImage();
      }
      chunks.push(Buffer.from(value));
    }
    const imageBuffer = Buffer.concat(chunks);
    let sharp;
    try {
      ({ default: sharp } = await import('sharp'));
    } catch (error) {
      if (['image/jpeg', 'image/png'].includes(contentType)) return imageBuffer;
      console.error('Sharp indisponible; image de l’événement ignorée dans le billet:', error);
      return loadFallbackEventImage();
    }

    return await sharp(imageBuffer, { limitInputPixels: 20_000_000 })
      .rotate()
      .resize(900, 500, { fit: 'cover', position: sharp.strategy.attention })
      .jpeg({ quality: 88 })
      .toBuffer();
  } catch {
      return loadFallbackEventImage();
  }
}

function drawField(doc, label, value, x, y, width, options = {}) {
  doc.font('Helvetica-Bold').fontSize(7).fillColor(colors.muted).text(label.toLocaleUpperCase('fr-FR'), x, y, { width, lineBreak: false });
  doc.font('Helvetica').fontSize(options.fontSize || 10).fillColor(colors.ink).text(value || 'Non renseigné', x, y + 11, {
    width,
    height: options.height || 26,
    ellipsis: true,
    lineGap: 1,
  });
}

function drawTicket(doc, order, item, ticket, qrBuffer, eventImage, index, totalTickets) {
  const width = 360;
  const height = 720;
  doc.addPage({ size: [width, height], margin: 0 });

  // Fond global sombre de la carte
  doc.rect(0, 0, width, height).fill(colors.background);
  doc.roundedRect(8, 8, width - 16, height - 16, 16).lineWidth(1).strokeColor(colors.line).stroke();

  // En-tête avec l'image de l'événement ou encart de repli
  if (eventImage) {
    doc.save();
    doc.roundedRect(9, 9, width - 18, 175, 15).clip();
    doc.image(eventImage, 9, 9, { width: width - 18, height: 175 });
    doc.restore();
  } else {
    doc.save();
    doc.roundedRect(9, 9, width - 18, 175, 15).clip();
    doc.rect(9, 9, width - 18, 175).fill(colors.soft);
    doc.font('Barlow-Bold').fontSize(36).fillColor(colors.accent).text('CCJAB', 24, 72, { width: width - 48, align: 'center' });
    doc.restore();
  }

  const event = order.event;
  const eventTitle = event.nom_evenement || event.categorie || 'Événement CCJAB';

  // Sous-titre et Titre principal en police Barlow
  doc.font('Helvetica-Bold').fontSize(7).fillColor(colors.muted).text('CENTRE CULTUREL JACQUES AKA', 24, 198, { characterSpacing: 1.2 });
  doc.font('Barlow-Bold').fontSize(22).fillColor(colors.ink).text(eventTitle, 24, 213, { width: 312, height: 50, ellipsis: true, lineGap: 2 });

  // Grille d'informations du billet
  drawField(doc, 'Date', formatDate(event.date_debut), 24, 280, 176, { fontSize: 9, height: 24 });
  drawField(doc, 'Heure', formatTime(event.date_debut), 208, 280, 128);
  drawField(doc, 'Catégorie', item.ticketType.name, 24, 324, 176, { fontSize: 9, height: 24 });
  drawField(doc, 'Prix', formatMoney(item.unitPrice), 208, 324, 128, { fontSize: 9, height: 24 });

  const room = event.salles?.map((salle) => salle.nom_salle).filter(Boolean).join(' · ') || 'Centre culturel CCJAB · Bouaké';
  drawField(doc, 'Lieu', room, 24, 368, 312, { fontSize: 9, height: 30 });
  drawField(doc, 'Titulaire', order.customerName, 24, 414, 312, { fontSize: 10, height: 26 });

  // Ligne de découpe pointillée style ticket de caisse / cinéma
  doc.save();
  doc.lineWidth(0.8).dash(3, { space: 4 }).strokeColor(colors.line).moveTo(18, 458).lineTo(width - 18, 458).stroke();
  doc.undash();
  // Encoches latérales semi-circulaires pour l'effet ticket détachable
  doc.circle(8, 458, 9).fill(colors.background);
  doc.circle(width - 8, 458, 9).fill(colors.background);
  doc.restore();

  // Section QR Code & Code unique en bas
  doc.image(qrBuffer, 135, 474, { width: 90, height: 90 });
  doc.font('Helvetica').fontSize(8).fillColor(colors.muted).text('Présentez ce code à l’entrée', 24, 576, { width: 312, align: 'center' });
  doc.font('Courier-Bold').fontSize(10).fillColor(colors.ink).text(ticket.code, 24, 594, { width: 312, align: 'center' });
  doc.font('Helvetica').fontSize(7).fillColor(colors.muted).text(`Billet ${index + 1} sur ${totalTickets} · Réf: ${order.reference}`, 24, 626, { width: 312, align: 'center', ellipsis: true });
}

export async function generateTicketPdf(order) {
  const tickets = order.items.flatMap((item) => item.tickets.map((ticket) => ({ ticket, item })));
  if (!tickets.length) throw new Error('Aucun billet émis pour cette commande.');

  const baseUrl = new URL(process.env.APP_URL);
  const eventImage = await loadEventImage(order.event.image);

  const doc = new PDFDocument({ autoFirstPage: false, size: [360, 720], margin: 0, info: { Title: `Billets CCJAB - ${order.reference}`, Author: 'CCJAB' } });

  // Enregistrement de la police Barlow dans PDFKit
  const barlowFontBuffer = await loadBarlowFont();
  if (barlowFontBuffer) {
    doc.registerFont('Barlow-Bold', barlowFontBuffer);
  } else {
    // Repli de sécurité si le téléchargement de la police échoue
    doc.registerFont('Barlow-Bold', 'Helvetica-Bold');
  }

  const chunks = [];
  const pdfReady = new Promise((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  for (const [index, entry] of tickets.entries()) {
    const verificationUrl = new URL(`/web/billets/verifier/${encodeURIComponent(entry.ticket.code)}`, baseUrl).toString();
    const qrBuffer = await QRCode.toBuffer(verificationUrl, { type: 'png', width: 360, margin: 1, errorCorrectionLevel: 'M' });
    drawTicket(doc, order, entry.item, entry.ticket, qrBuffer, eventImage, index, tickets.length);
  }

  doc.end();
  return pdfReady;
}
