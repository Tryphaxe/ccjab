"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { formatEventDate } from "@/lib/evenHelper";

export default function CalendarView({ events }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day) => {
    return events.filter((event) => {
      const eventStart = parseISO(event.date_debut);
      return isSameDay(eventStart, day);
    });
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case "A venir":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "En cours":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Terminé":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const handleOpenModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="border-1 border-gray-200 p-0">
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-t-lg">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-6 h-6" />
              <CardTitle className="text-2xl">Calendrier des événements</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                variant="outline"
                size="icon"
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-xl font-semibold px-4">
                {format(currentMonth, "MMMM yyyy", { locale: fr })}
              </span>
              <Button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                variant="outline"
                size="icon"
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2 text-sm">
                {day}
              </div>
            ))}

            {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, idx) => (
              <div key={`empty-${idx}`} className="p-2"></div>
            ))}

            {daysInMonth.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toString()}
                  className={`min-h-24 p-2 border rounded-lg ${isToday ? "bg-green-50 border-green-500" : "bg-white border-gray-200"
                    } hover:shadow-md transition-shadow`}
                >
                  <div
                    className={`text-sm font-semibold mb-1 ${isToday ? "text-green-700" : "text-gray-700"
                      }`}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded border cursor-pointer hover:shadow-sm transition-all ${getStatusColor(event.statut)}`}
                        onClick={() => handleOpenModal(event)}
                      >
                        <div className="font-semibold" dangerouslySetInnerHTML={{ __html: formatEventDate(event.date_debut, event.date_fin) }}/>
                        <div className="truncate">{event.nom_salle}</div>
                        <div className="truncate">{event.type_evenement}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal de détails */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de l’évènement</DialogTitle>
            <DialogDescription>
              Consultez les informations de cet évènement.
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-3 mt-3">
              <p><strong>Agent assigné :</strong> {selectedEvent.agent?.nom ?? "Non spécifié"}</p>
              <p><strong>Nom de la salle :</strong> {selectedEvent.nom_salle}</p>
              <p><strong>Type d’évènement :</strong> {selectedEvent.type_evenement}</p>
              <p><strong>Catégorie :</strong> {selectedEvent.categorie}</p>
              <p><strong>Statut :</strong> {selectedEvent.statut}</p>
              <p><strong>Date de début :</strong> {format(parseISO(selectedEvent.date_debut), "dd/MM/yyyy - HH:mm")}</p>
              <p><strong>Date de fin :</strong> {format(parseISO(selectedEvent.date_fin), "dd/MM/yyyy - HH:mm")}</p>
              <p><strong>Montant :</strong> {selectedEvent.montant.toLocaleString('fr-FR')} FCFA</p>
              {selectedEvent.description && (
                <p><strong>Description :</strong> {selectedEvent.description}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
