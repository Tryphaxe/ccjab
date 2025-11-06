import { format, parseISO } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

export function exportEventsToPDF(events) {
    if (!events || events.length === 0) {
        alert("Aucun événement à exporter !");
        return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Liste des événements", 14, 22);

    // Préparer les données pour le tableau
    const tableColumn = [
        "Nom salle",
        "Type",
        "Catégorie",
        "Date début",
        "Date fin",
        "Montant (FCFA)",
        "Agent",
    ];

    const formatMontant = (Montant) => {
        if (!Montant) return "-";
        return Number(Montant)
            .toLocaleString("fr-FR")
            .replace(/\s/g, " ");
    }

    const tableRows = events.map((event) => [
        event.salle.nom_salle,
        event.type,
        event.categorie,
        format(parseISO(event.date_debut), "dd/MM/yyyy - HH:mm"),
        format(parseISO(event.date_fin), "dd/MM/yyyy - HH:mm"),
        formatMontant(event.montant),
        event.agent?.name || "-",
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: "grid",
        headStyles: { fillColor: [34, 139, 34] }, // vert
        styles: { fontSize: 10 },
    });

    doc.save("Liste des evenements.pdf");
}
