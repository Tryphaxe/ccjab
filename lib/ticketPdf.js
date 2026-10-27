import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import sharp from 'sharp';

const colors = {
  ink: '#29211e',
  muted: '#796d67',
  paper: '#fffdfa',
  line: '#e9ddd6',
  accent: '#a93417',
  soft: '#f8eee8',
};

const dateOptions = { timeZone: 'Africa/Abidjan', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
const timeOptions = { timeZone: 'Africa/Abidjan', hour: '2-digit', minute: '2-digit' };
const formatDate = (value) => value ? new Intl.DateTimeFormat('fr-FR', dateOptions).format(new Date(value)) : 'Date à confirmer';
const formatTime = (value) => value ? new Intl.DateTimeFormat('fr-FR', timeOptions).format(new Date(value)) : '';
const formatMoney = (value) => `${new Intl.NumberFormat('fr-FR').format(value).replace(/[\u00a0\u202f]/g, ' ')} FCFA`;

async function loadEventImage(imageUrl) {
  if (!imageUrl || !process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const image = new URL(imageUrl);
    const storage = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (image.origin !== storage.origin || !image.pathname.startsWith('/storage/v1/object/public/event/')) return null;

    const response = await fetch(image, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(8000) });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) return null;
    const length = Number(response.headers.get('content-length') || 0);
    if (length > 8 * 1024 * 1024 || !response.body) return null;

    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8 * 1024 * 1024) {
        await reader.cancel();
        return null;
      }
      chunks.push(Buffer.from(value));
    }
    return await sharp(Buffer.concat(chunks), { limitInputPixels: 20_000_000 })
      .rotate()
      .resize(900, 500, { fit: 'cover', position: sharp.strategy.attention })
      .jpeg({ quality: 88 })
      .toBuffer();
  } catch {
    return null;
  }
}

function drawField(doc, label, value, x, y, width, options = {}) {
  doc.font('Helvetica-Bold').fontSize(7).fillColor(colors.muted).text(label.toLocaleUpperCase('fr-FR'), x, y, { width, lineBreak: false });
  doc.font('Helvetica').fontSize(options.fontSize || 10).fillColor(colors.ink).text(value || 'Non renseigné', x, y + 12, {
    width,
    height: options.height || 30,
    ellipsis: true,
    lineGap: 1,
  });
}

function drawTicket(doc, order, item, ticket, qrBuffer, eventImage, index, totalTickets) {
  const width = 360;
  const height = 720;
  doc.addPage({ size: [width, height], margin: 0 });
  doc.rect(0, 0, width, height).fill('#ffffff');
  doc.roundedRect(8, 8, width - 16, height - 16, 15).lineWidth(1).strokeColor(colors.line).stroke();

  if (eventImage) {
    doc.save();
    doc.roundedRect(9, 9, width - 18, 190, 14).clip();
    doc.image(eventImage, 9, 9, { width: width - 18, height: 190 });
    doc.restore();
  } else {
    doc.save();
    doc.roundedRect(9, 9, width - 18, 190, 14).clip();
    doc.rect(9, 9, width - 18, 190).fill(colors.soft);
    doc.font('Times-Bold').fontSize(42).fillColor(colors.accent).text('CCJAB', 24, 78, { width: width - 48, align: 'center' });
    doc.restore();
  }

  const event = order.event;
  const eventTitle = event.nom_evenement || event.categorie || 'Événement CCJAB';
  doc.font('Helvetica-Bold').fontSize(7).fillColor(colors.accent).text('BILLET ÉLECTRONIQUE', 24, 218, { characterSpacing: 1 });
  doc.font('Helvetica-Bold').fontSize(21).fillColor(colors.ink).text(eventTitle, 24, 235, { width: 312, height: 48, ellipsis: true, lineGap: 1 });

  drawField(doc, 'Date', formatDate(event.date_debut), 24, 296, 176, { fontSize: 9, height: 26 });
  drawField(doc, 'Heure', formatTime(event.date_debut), 208, 296, 128);
  drawField(doc, 'Catégorie', item.ticketType.name, 24, 345, 176, { fontSize: 9, height: 26 });
  drawField(doc, 'Prix', formatMoney(item.unitPrice), 208, 345, 128, { fontSize: 9, height: 26 });

  const room = event.salles?.map((salle) => salle.nom_salle).filter(Boolean).join(' · ') || 'Centre culturel CCJAB · Bouaké';
  drawField(doc, 'Lieu', room, 24, 394, 312, { fontSize: 9, height: 34 });
  drawField(doc, 'Titulaire', order.customerName, 24, 447, 312, { fontSize: 10, height: 28 });

  doc.save();
  doc.lineWidth(0.8).dash(3, { space: 4 }).strokeColor(colors.line).moveTo(18, 493).lineTo(width - 18, 493).stroke();
  doc.undash();
  doc.circle(8, 493, 10).fill('#ffffff');
  doc.circle(width - 8, 493, 10).fill('#ffffff');
  doc.restore();

  doc.image(qrBuffer, 130, 509, { width: 100, height: 100 });
  doc.font('Helvetica').fontSize(8).fillColor(colors.muted).text('Présentez ce code à l’entrée', 24, 618, { width: 312, align: 'center' });
  doc.font('Courier-Bold').fontSize(9).fillColor(colors.ink).text(ticket.code, 24, 638, { width: 312, align: 'center' });
  doc.font('Helvetica').fontSize(7).fillColor(colors.muted).text(`Billet ${index + 1} sur ${totalTickets} · Commande ${order.reference}`, 24, 674, { width: 312, align: 'center', ellipsis: true });
}

export async function generateTicketPdf(order) {
  const tickets = order.items.flatMap((item) => item.tickets.map((ticket) => ({ ticket, item })));
  if (!tickets.length) throw new Error('Aucun billet émis pour cette commande.');

  const baseUrl = new URL(process.env.APP_URL);
  const eventImage = await loadEventImage(order.event.image);
  const doc = new PDFDocument({ autoFirstPage: false, size: [360, 720], margin: 0, info: { Title: `Billets CCJAB - ${order.reference}`, Author: 'CCJAB' } });
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
