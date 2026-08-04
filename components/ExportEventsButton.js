"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Download, Calendar, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// Importez vos constantes ici (Ajustez le chemin selon l'emplacement de votre fichier)
import { eventCategories, eventTypesByCategory } from "@/lib/list";

export default function ExportEventsButton() {
  const [isOpen, setIsOpen] = useState(false);
  
  // États - Période
  const [isAllMonths, setIsAllMonths] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [availableMonths, setAvailableMonths] = useState([]);
  const [isLoadingMonths, setIsLoadingMonths] = useState(false);

  // États - Catégorie et Type
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Charger les mois disponibles
  useEffect(() => {
    const fetchMonths = async () => {
      setIsLoadingMonths(true);
      try {
        const res = await fetch("/api/even/available-months");
        if (res.ok) {
          const data = await res.json();
          setAvailableMonths(data);
          if (data.length > 0) setSelectedMonth(data[0].value);
        }
      } catch (error) {
        toast.error("Erreur lors de la récupération des mois.");
      } finally {
        setIsLoadingMonths(false);
      }
    };
    fetchMonths();
  }, []);

  // Réinitialiser le type si la catégorie change
  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    setSelectedType("all"); // On remet le type à "Tous" par défaut
  };

  const handleExport = async () => {
    const monthToExport = isAllMonths ? "all" : selectedMonth;

    if (!isAllMonths && !monthToExport) {
      toast.error("Veuillez sélectionner un mois à exporter.");
      return;
    }

    // --- Formatage du nom de fichier ---
    let fileName = "Rapport_Evenements";
    
    if (!isAllMonths && selectedMonth) {
      const [year, monthNum] = selectedMonth.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const monthName = date.toLocaleString('fr-FR', { month: 'long' });
      const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      fileName += `_${year}_${capitalizedMonth}`;
    } else {
      fileName += "_Tous_Les_Mois";
    }

    if (selectedCategory !== "all") {
      fileName += `_${selectedCategory.replace(/\s+/g, '')}`;
    }
    if (selectedType !== "all") {
      fileName += `_${selectedType.replace(/\s+/g, '')}`;
    }
    fileName += ".pdf";

    // --- Déclenchement de l'export ---
    setIsOpen(false);

    // Envoi des paramètres category et type à l'API
    const exportPromise = fetch(
      `/api/even/export-events?month=${monthToExport}&category=${encodeURIComponent(selectedCategory)}&type=${encodeURIComponent(selectedType)}`
    ).then(async (res) => {
      if (!res.ok) throw new Error("Erreur lors de la génération du PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
    });

    toast.promise(exportPromise, {
      loading: "Génération du PDF en cours...",
      success: "Rapport PDF téléchargé !",
      error: "Erreur lors du téléchargement.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 shadow-sm border-slate-200 hover:bg-slate-50">
          <Download className="h-4 w-4 text-slate-600" />
          <span>Exporter les évènements (PDF)</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Calendar className="h-5 w-5 text-green-600" />
            Exporter en PDF
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Appliquez vos filtres pour générer le rapport.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          
          {/* --- FILTRE : PERIODE --- */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Période
            </Label>
            <div className="flex items-center space-x-3 rounded-lg border border-slate-100 p-3 bg-slate-50/70">
              <Checkbox
                id="all-months"
                checked={isAllMonths}
                onCheckedChange={(checked) => setIsAllMonths(Boolean(checked))}
              />
              <Label htmlFor="all-months" className="text-sm font-medium cursor-pointer text-slate-800">
                Exporter tous les mois
              </Label>
            </div>

            {!isAllMonths && (
              isLoadingMonths ? (
                <div className="flex items-center justify-center p-2 border rounded-md text-slate-400 text-sm gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                  Chargement...
                </div>
              ) : (
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
              )
            )}
          </div>

          {/* --- FILTRE : CATEGORIE --- */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Catégorie d'évènement
            </Label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {eventCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* --- FILTRE : TYPE (Dépendant de la catégorie) --- */}
          <div className="space-y-2">
            <Label className={`text-xs font-semibold uppercase tracking-wider transition-colors ${selectedCategory === "all" ? "text-slate-300" : "text-slate-500"}`}>
              Type d'évènement
            </Label>
            <Select 
              value={selectedType} 
              onValueChange={setSelectedType}
              disabled={selectedCategory === "all"} // Désactivé si aucune catégorie spécifique n'est choisie
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder={selectedCategory === "all" ? "Sélectionnez d'abord une catégorie" : "Tous les types"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {/* Affiche dynamiquement les types en fonction de la catégorie */}
                {selectedCategory !== "all" && eventTypesByCategory[selectedCategory]?.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="text-slate-600">
            Annuler
          </Button>
          <Button type="button" onClick={handleExport} disabled={isLoadingMonths} className="bg-green-600 hover:bg-green-700 text-white gap-2">
            <Download className="h-4 w-4" />
            Confirmer l'export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}