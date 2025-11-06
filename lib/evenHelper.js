// utils/eventHelpers.js

export function formatEventDate(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const now = new Date();

    const optionsDate = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit' };

    // Fonction pour transformer la date en "Aujourd'hui", "Hier", "Demain" ou date normale
    function smartDateLabel(date) {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diff = (d - today) / (1000 * 60 * 60 * 24);

        if (diff === 0) return "Aujourd'hui";
        if (diff === -1) return "Hier";
        if (diff === 1) return "Demain";
        return date.toLocaleDateString('fr-FR', optionsDate);
    }

    const sameDay = startDate.toDateString() === endDate.toDateString();
    const startStr = `${smartDateLabel(startDate)} - ${startDate.toLocaleTimeString('fr-FR', optionsTime)}`;
    const endStr = `${smartDateLabel(endDate)} - ${endDate.toLocaleTimeString('fr-FR', optionsTime)}`;

    return sameDay
        ? `${smartDateLabel(startDate)} - ${startDate.toLocaleTimeString('fr-FR', optionsTime)} à ${endDate.toLocaleTimeString('fr-FR', optionsTime)}`
        : `${startStr}<br />${endStr}`;
}

export function getEventStatus(start, end) {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now < startDate) return "A venir";
    if (now >= startDate && now <= endDate) return "En cours";
    return "Terminé";
}