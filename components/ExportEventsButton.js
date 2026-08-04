"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Download, Calendar, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ExportEventsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAllMonths, setIsAllMonths] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [availableMonths, setAvailableMonths] = useState([]);
  const [isLoadingMonths, setIsLoadingMonths] = useState(false);

  // Charger les mois disponibles depuis l'API au montage du composant
  useEffect(() => {
    const fetchMonths = async () => {
      setIsLoadingMonths(true);
      try {
        const res = await fetch("/api/even/available-months");
        if (res.ok) {
          const data = await res.json();
          setAvailableMonths(data);
          if (data.length > 0) {
            setSelectedMonth(data[0].value); // Sélectionner le premier mois disponible par défaut
          }
        } else {
          throw new Error("Erreur serveur");
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des mois disponibles.");
      } finally {
        setIsLoadingMonths(false);
      }
    };

    fetchMonths();
  }, []);

  const handleExport = async () => {
    const monthToExport = isAllMonths ? "all" : selectedMonth;

    if (!isAllMonths && !monthToExport) {
      toast.error("Veuillez sélectionner un mois à exporter.");
      return;
    }

    // 1. Générer un nom de fichier propre (ex: Rapport_Evenements_2026_Janvier.pdf)
    let fileName = "Rapport_Evenements_Tous.pdf";

    if (!isAllMonths) {
      // selectedMonth est au format "2026-1" ou "2026-12"
      const [year, monthNum] = selectedMonth.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);

      // Récupérer le nom du mois en lettres et en français (ex: "janvier")
      const monthName = date.toLocaleString('fr-FR', { month: 'long' });
      // Mettre la première lettre en majuscule ("Janvier")
      const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

      fileName = `Rapport_Evenements_${year}_${capitalizedMonth}.pdf`;
    }

    // 2. Fermer le dialog
    setIsOpen(false);

    // 3. Lancer la promesse de téléchargement
    const exportPromise = fetch(`/api/even/export-events?month=${monthToExport}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Erreur lors de la génération du PDF");

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName; // Utilisation du nom formaté ici
        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
      });

    // 4. Hot Toast pour le suivi
    toast.promise(exportPromise, {
      loading: "Génération du PDF en cours...",
      success: "Rapport PDF téléchargé avec succès !",
      error: "Erreur lors du téléchargement.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Bouton de déclenchement */}
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 shadow-sm border-slate-200 hover:bg-slate-50">
          <Download className="h-4 w-4 text-slate-600" />
          <span>Exporter les évènements (PDF)</span>
        </Button>
      </DialogTrigger>

      {/* Modal Dialog Shadcn */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Calendar className="h-5 w-5 text-green-600" />
            Exporter en PDF
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Sélectionnez la période des évènements à exporter dans le rapport.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Option Checkbox : Tous les mois */}
          <div className="flex items-center space-x-3 rounded-lg border border-slate-100 p-3 bg-slate-50/70 transition-colors">
            <Checkbox
              id="all-months"
              checked={isAllMonths}
              onCheckedChange={(checked) => setIsAllMonths(Boolean(checked))}
            />
            <Label
              htmlFor="all-months"
              className="text-sm font-medium leading-none cursor-pointer select-none text-slate-800"
            >
              Exporter tous les mois
            </Label>
          </div>

          {/* Sélecteur Dynamique des Mois */}
          <div className="space-y-2">
            <Label
              className={`text-sm font-medium transition-colors ${isAllMonths ? "text-slate-400" : "text-slate-700"
                }`}
            >
              Choisir un mois spécifique
            </Label>

            {isLoadingMonths ? (
              <div className="flex items-center justify-center p-3 border rounded-md text-slate-400 text-sm gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                Chargement des mois...
              </div>
            ) : (
              <Select
                disabled={isAllMonths || availableMonths.length === 0}
                value={selectedMonth}
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Sélectionnez un mois" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {!isAllMonths && availableMonths.length === 0 && !isLoadingMonths && (
              <p className="text-xs text-amber-600 mt-1">
                Aucun mois contenant des évènements n'a été trouvé.
              </p>
            )}
          </div>
        </div>

        {/* Pied de page avec actions */}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="text-slate-600 hover:text-slate-800"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={isLoadingMonths || (!isAllMonths && availableMonths.length === 0)}
            className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-sm"
          >
            <Download className="h-4 w-4" />
            Confirmer l'export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}