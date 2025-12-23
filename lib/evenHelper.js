import { format, isSameDay, isFuture, isPast, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate une plage de dates pour l'affichage
 * @param {string|Date} startDate 
 * @param {string|Date} endDate 
 * @returns {string} HTML string (avec des <span> ou <br>) ou texte brut
 */
export const formatEventDate = (startDate, endDate) => {
  if (!startDate) return "Date inconnue";

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  // Options pour le formatage (ex: 25 octobre 2025)
  const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };

  // Si pas de date de fin ou si c'est le même jour
  if (!end || isSameDate(start, end)) {
    const dateStr = start.toLocaleDateString('fr-FR', dateOptions);
    const timeStr = start.toLocaleTimeString('fr-FR', timeOptions);
    const endTimeStr = end ? end.toLocaleTimeString('fr-FR', timeOptions) : null;

    // Ex: "25 octobre 2025 • 14:00 - 18:00"
    return `<strong>${dateStr}</strong> <span class="text-gray-400">•</span> ${timeStr}${endTimeStr ? ' - ' + endTimeStr : ''}`;
  } 
  
  // Si c'est sur plusieurs jours
  else {
    const startStr = start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const endStr = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    
    // Ex: "Du 12 oct. au 15 oct. 2025"
    return `Du <strong>${startStr}</strong> au <strong>${endStr}</strong>`;
  }
};

/**
 * Détermine le statut de l'événement (A venir, En cours, Terminé)
 */
export const getEventStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;

  if (now < start) {
    return "A venir";
  } else if (now >= start && now <= end) {
    return "En cours";
  } else {
    return "Terminé";
  }
};

// Petite fonction utilitaire interne pour comparer les jours sans l'heure
const isSameDate = (d1, d2) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};