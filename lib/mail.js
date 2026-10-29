import nodemailer from 'nodemailer';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Configuration du transporteur (Exemple avec Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function getBarlowEmailStyles() {
  try {
    const font = await readFile(path.join(process.cwd(), 'public', 'fonts', 'barlow-condensed-bold.ttf'));
    const fontData = font.toString('base64');
    return `<style>@font-face{font-family:'Barlow CCJAB';font-style:normal;font-weight:700;src:url(data:font/ttf;base64,${fontData}) format('truetype');}</style>`;
  } catch (error) {
    console.error('Police Barlow indisponible pour le courriel:', error);
    return '';
  }
}

const emailHeadingFont = "'Barlow CCJAB', 'Arial Narrow', Arial, sans-serif";

/**
 * Fonction pour envoyer un email à l'agent
 * @param {string} toEmail - L'email de l'agent
 * @param {string} agentName - Le nom de l'agent
 * @param {object} eventDetails - Les détails de l'événement
 */
export const sendAssignmentEmail = async (toEmail, agentName, eventDetails) => {
  const { date_debut, date_fin, nom_client, salle_nom, type } = eventDetails;
  const barlowStyles = await getBarlowEmailStyles();

  // Formatage des dates pour l'email
  const start = new Date(date_debut).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' });
  const end = new Date(date_fin).toLocaleString('fr-FR', { timeStyle: 'short' });

  const mailOptions = {
    from: `"Gestion CCJAB" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `📅 Nouvelle assignation : ${type}`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        ${barlowStyles}
      </head>
      <body style="margin:0; padding:0; background-color:#121212; font-family: Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#121212; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#181818; border:1px solid #2e2e2e; border-radius:16px; padding:32px; color:#ffffff;">
                <tr>
                  <td>
                    <!-- En-tête Logo / Marque -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                      <tr>
                        <td>
                          <span style="font-family:${emailHeadingFont}; font-size:12px; font-weight:700; letter-spacing:1.5px; color:#ff5722;">CCJAB · ESPACE AGENT</span>
                        </td>
                        <td align="right">
                          <img src="https://ccjab.vercel.app/images/favicon.png" alt="Logo CCJAB" width="36" style="display:block; border-radius:6px;" />
                        </td>
                      </tr>
                    </table>

                    <!-- Titre -->
                    <h1 style="font-family:${emailHeadingFont}; font-size:24px; font-weight:700; color:#ffffff; margin:0 0 12px 0;">
                      Hello ${escapeHtml(agentName)} 👋
                    </h1>
                    <p style="font-size:14px; color:#9a9a9a; line-height:1.5; margin:0 0 24px 0;">
                      Vous avez été assigné à un nouvel événement. Retrouvez ci-dessous les détails de votre mission.
                    </p>

                    <!-- Bloc d'informations -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#1e1e1e; border:1px solid #2e2e2e; border-radius:12px; padding:20px; margin-bottom:24px;">
                      <tr>
                        <td style="padding:8px 0; font-size:13px; color:#9a9a9a; border-bottom:1px solid #282828;">📍 Salle</td>
                        <td align="right" style="padding:8px 0; font-size:13px; font-weight:bold; color:#ffffff; border-bottom:1px solid #282828;">${escapeHtml(salle_nom)}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; font-size:13px; color:#9a9a9a; border-bottom:1px solid #282828;">👤 Client</td>
                        <td align="right" style="padding:8px 0; font-size:13px; font-weight:bold; color:#ffffff; border-bottom:1px solid #282828;">${escapeHtml(nom_client)}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; font-size:13px; color:#9a9a9a; border-bottom:1px solid #282828;">🏷️ Type</td>
                        <td align="right" style="padding:8px 0; font-size:13px; font-weight:bold; color:#ffffff; border-bottom:1px solid #282828;">${escapeHtml(type)}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; font-size:13px; color:#9a9a9a;">🕒 Horaire</td>
                        <td align="right" style="padding:8px 0; font-size:13px; font-weight:bold; color:#ffffff;">Du ${start} au ${end}</td>
                      </tr>
                    </table>

                    <p style="font-size:13px; color:#9a9a9a; margin:0 0 8px 0;">
                      Veuillez consulter votre tableau de bord pour toute information complémentaire.
                    </p>
                    <p style="font-size:12px; color:#666666; font-style:italic; margin:0;">
                      L'équipe administrative.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email envoyé à ${toEmail}`);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
  }
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

export const sendTicketEmail = async (order, pdfBuffer) => {
  const barlowStyles = await getBarlowEmailStyles();
  const eventName = order.event.nom_evenement || order.event.categorie || 'Événement CCJAB';
  const eventDate = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Africa/Abidjan', dateStyle: 'full', timeStyle: 'short',
  }).format(new Date(order.event.date_debut));
  const returnUrl = new URL(`/web/paiement/retour?reference=${encodeURIComponent(order.reference)}`, process.env.APP_URL).toString();
  const tickets = order.items.flatMap((item) => item.tickets);

  await transporter.sendMail({
    from: `"Billetterie CCJAB" <${process.env.EMAIL_USER}>`,
    to: order.customerEmail,
    subject: `Vos billets pour ${eventName}`,
    text: `Bonjour ${order.customerName},\n\nVotre paiement est confirmé pour ${eventName}, le ${eventDate}. Vos ${tickets.length} billet(s) sont en pièce jointe. Retrouvez aussi vos codes ici : ${returnUrl}\n\nL'équipe CCJAB`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        ${barlowStyles}
      </head>
      <body style="margin:0; padding:0; background-color:#121212; font-family: Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#121212; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#181818; border:1px solid #2e2e2e; border-radius:16px; padding:32px; color:#ffffff;">
                <tr>
                  <td>
                    <!-- En-tête de marque -->
                    <span style="font-family:${emailHeadingFont}; font-size:12px; font-weight:700; letter-spacing:1.5px; color:#ff5722; display:block; margin-bottom:16px;">CCJAB · BILLETTERIE</span>
                    
                    <!-- Titre principal -->
                    <h1 style="font-family:${emailHeadingFont}; font-size:26px; font-weight:700; color:#ffffff; margin:0 0 12px 0;">
                      Paiement confirmé ✨
                    </h1>
                    
                    <p style="font-size:14px; color:#9a9a9a; line-height:1.5; margin:0 0 20px 0;">
                      Bonjour <strong>${escapeHtml(order.customerName)}</strong>, votre paiement pour l'événement <strong style="color:#ffffff;">${escapeHtml(eventName)}</strong> a bien été validé.
                    </p>

                    <!-- Boîte récapitulative -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#1e1e1e; border:1px solid #2e2e2e; border-radius:12px; padding:20px; margin-bottom:24px;">
                      <tr>
                        <td style="font-size:13px; color:#ffffff; font-weight:bold; padding-bottom:6px;">📅 Date et Heure</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px; color:#9a9a9a; padding-bottom:12px;">${escapeHtml(eventDate)}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px; color:#ffffff; font-weight:bold; padding-top:6px; border-top:1px solid #282828;">🎫 Quantité</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px; color:#9a9a9a; padding-top:4px;">${tickets.length} billet(s) émis</td>
                      </tr>
                    </table>

                    <p style="font-size:13px; color:#9a9a9a; line-height:1.5; margin:0 0 24px 0;">
                      Vos billets PDF sont joints à cet e-mail. Chaque code QR intégré permet de valider votre accès rapidement à l'entrée.
                    </p>

                    <!-- Bouton d'action -->
                    <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
                      <tr>
                        <td align="center" style="background-color:#ff5722; border-radius:8px;">
                          <a href="${escapeHtml(returnUrl)}" target="_blank" style="font-family:${emailHeadingFont}; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none; padding:12px 24px; display:inline-block; letter-spacing:0.5px;">
                            Afficher mes billets en ligne
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Référence de commande en bas -->
                    <p style="font-size:11px; color:#666666; margin:0; border-top:1px solid #282828; pt-12px; padding-top:16px;">
                      Référence de commande : <span style="font-family:monospace; color:#9a9a9a;">${escapeHtml(order.reference)}</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    attachments: [{
      filename: `billets-CCJAB-${order.reference}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    }],
  });
};
