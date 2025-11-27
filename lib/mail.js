import nodemailer from 'nodemailer';

// Configuration du transporteur (Exemple avec Gmail)
// Vous pouvez utiliser n'importe quel service SMTP (SendGrid, Outlook, etc.)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Ou host: 'smtp.example.com', port: 587, etc.
  auth: {
    user: process.env.EMAIL_USER, // Votre adresse email d'envoi
    pass: process.env.EMAIL_PASS, // Votre mot de passe d'application (pas le mot de passe habituel)
  },
});

/**
 * Fonction pour envoyer un email à l'agent
 * @param {string} toEmail - L'email de l'agent
 * @param {string} agentName - Le nom de l'agent
 * @param {object} eventDetails - Les détails de l'événement
 */
export const sendAssignmentEmail = async (toEmail, agentName, eventDetails) => {
  const { date_debut, date_fin, nom_client, salle_nom, type } = eventDetails;

  // Formatage des dates pour l'email
  const start = new Date(date_debut).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' });
  const end = new Date(date_fin).toLocaleString('fr-FR', { timeStyle: 'short' });

  const mailOptions = {
    from: `"Gestion CCJAB" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `📅 Nouvelle assignation : ${type}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <img 
          src="https://ccjab.vercel.app/images/favicon.png" 
          alt="Logo CCJAB" 
          width="60"
          style="display:block; margin-bottom:20px;" 
        />                        
        <h2 style="color: #15803d;">Hello ${agentName} 👋,</h2>
        <p>Vous avez été assigné à un nouvel événement.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>📍 Salle :</strong> ${salle_nom}</p>
          <p><strong>👤 Client :</strong> ${nom_client}</p>
          <p><strong>🏷️ Type :</strong> ${type}</p>
          <p><strong>🕒 Date :</strong> Le ${start} jusqu'à ${end}</p>
        </div>

        <p>Merci de consulter votre tableau de bord pour plus de détails.</p>
        <p><em>L'équipe administrative.</em></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email envoyé à ${toEmail}`);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    // On ne lance pas d'erreur ici pour ne pas bloquer la création de l'événement si le mail échoue
  }
};