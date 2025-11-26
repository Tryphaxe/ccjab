"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Info,
  Tag,
  CreditCard
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { formatEventDate } from "@/lib/evenHelper";

export default function CalendarView({ events }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calcul pour le remplissage des jours vides avant le début du mois
  const startDayIndex = (monthStart.getDay() + 6) % 7; // Lundi = 0

  const getEventsForDay = (day) => {
    return events.filter((event) => {
      if (!event.date_debut) return false;
      const eventStart = parseISO(event.date_debut);
      return isSameDay(eventStart, day);
    });
  };

  const getStatusStyles = (statut) => {
    switch (statut) {
      case "A venir":
        return "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100";
      case "En cours":
        return "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100";
      case "Terminé":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
    }
  };

  const handleOpenModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* En-tête du calendrier */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                <CalendarIcon className="w-5 h-5 text-gray-700" />
             </div>
             <h2 className="text-xl font-bold text-gray-900 capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: fr })}
             </h2>
          </div>
          
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <Button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100 text-gray-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <Button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100 text-gray-600"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Grille du calendrier */}
        <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden flex-1">
          <CardContent className="p-0">
            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Jours du mois */}
            <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] bg-gray-200 gap-px border-b border-gray-200">
              {/* Cases vides début de mois */}
              {Array.from({ length: startDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="bg-gray-50/30 min-h-[120px]"></div>
              ))}

              {/* Jours */}
              {daysInMonth.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={day.toString()}
                    className={`bg-white min-h-[120px] p-2 transition-colors hover:bg-gray-50 flex flex-col gap-1 group relative`}
                  >
                    {/* Numéro du jour */}
                    <div className="flex justify-between items-start mb-1">
                        <span
                        className={`
                            text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                            ${isCurrentDay 
                                ? "bg-orange-600 text-white shadow-sm" 
                                : "text-gray-700 group-hover:bg-gray-200/50"
                            }
                        `}
                        >
                        {format(day, "d")}
                        </span>
                        {dayEvents.length > 0 && (
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                {dayEvents.length}
                            </span>
                        )}
                    </div>

                    {/* Liste des événements */}
                    <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[100px] no-scrollbar">
                      {dayEvents.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handleOpenModal(event)}
                          className={`
                            text-left w-full px-2 py-1.5 rounded-md border text-xs font-medium transition-all shadow-sm
                            flex flex-col gap-0.5
                            ${getStatusStyles(event.statut)}
                          `}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className="truncate leading-tight font-bold">{event.nom_salle || "Salle inconnue"}</span>
                            </div>
                            <span className="truncate opacity-80 font-normal leading-tight">{event.type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {/* Remplissage fin de grille pour esthétique (optionnel) */}
              {Array.from({ length: (7 - (daysInMonth.length + startDayIndex) % 7) % 7 }).map((_, idx) => (
                 <div key={`end-empty-${idx}`} className="bg-gray-50/30 min-h-[120px]"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de détails */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
          <DialogHeader className="p-6 pb-4 bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={`
                    ${selectedEvent?.statut === 'En cours' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                      selectedEvent?.statut === 'A venir' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                      'bg-emerald-50 text-emerald-700 border-emerald-200'}
                `}>
                    {selectedEvent?.statut}
                </Badge>
                <span className="text-xs text-gray-500 font-medium">#{selectedEvent?.type_evenement}</span>
            </div>
            <DialogTitle className="text-xl text-gray-900">
                {selectedEvent?.salle?.nom_salle || "Salle"}
            </DialogTitle>
            <DialogDescription className="mt-1">
                {selectedEvent && (
                    <span dangerouslySetInnerHTML={{ __html: formatEventDate(selectedEvent.date_debut, selectedEvent.date_fin) }} />
                )}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="p-6 grid gap-6">
                
                {/* Infos principales */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="flex items-center gap-2 text-xs font-medium text-gray-500">
                            <User className="w-3.5 h-3.5" /> Agent Responsable
                        </span>
                        <p className="text-sm font-semibold text-gray-900">{selectedEvent.agent?.nom || "Non assigné"}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="flex items-center gap-2 text-xs font-medium text-gray-500">
                            <Tag className="w-3.5 h-3.5" /> Catégorie
                        </span>
                        <p className="text-sm font-semibold text-gray-900">{selectedEvent.categorie}</p>
                    </div>
                </div>

                <Separator />

                {/* Infos Financières & Description */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Montant Total</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                            {selectedEvent.montant?.toLocaleString('fr-FR')} FCFA
                        </span>
                    </div>

                    {selectedEvent.description && (
                        <div className="space-y-2">
                            <span className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                <Info className="w-3.5 h-3.5" /> Notes / Description
                            </span>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100 italic leading-relaxed">
                                {selectedEvent.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>
          )}

          <DialogFooter className="p-4 pt-0">
            <Button className="w-full sm:w-auto" variant="outline" onClick={() => setIsModalOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}