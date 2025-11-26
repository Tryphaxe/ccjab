"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
    Phone, 
    Loader2, 
    Calendar, 
    Clock, 
    ChevronLeft, 
    ChevronRight,
    SearchX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchEvents } from "@/utils/evenUtils";
import { getEventStatus } from "@/lib/evenHelper";

export default function TableList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchEvents(setEvents, setLoading);
  }, []);

  // Calculs de pagination
  const totalPages = Math.ceil(events.length / rowsPerPage);
  
  const paginatedEvents = useMemo(() => {
      const startIndex = (currentPage - 1) * rowsPerPage;
      return events.slice(startIndex, startIndex + rowsPerPage);
  }, [events, currentPage, rowsPerPage]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "En cours":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200">En cours</Badge>;
      case "A venir":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">A venir</Badge>;
      case "Terminé":
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">Terminé</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-500">Inconnu</Badge>;
    }
  };

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-gray-900" />
              <p className="text-sm">Chargement des réservations...</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Container du tableau avec bordures arrondies */}
      <div className="rounded-lg border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[180px] font-semibold text-gray-900">Salle / Évènement</TableHead>
              <TableHead className="font-semibold text-gray-900">Client</TableHead>
              <TableHead className="font-semibold text-gray-900">Date & Heure</TableHead>
              <TableHead className="font-semibold text-gray-900">Montant</TableHead>
              <TableHead className="font-semibold text-gray-900">Contact</TableHead>
              <TableHead className="text-right font-semibold text-gray-900 pr-6">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEvents.length > 0 ? (
              paginatedEvents.map((event) => {
                const dateStart = new Date(event.date_debut);
                const status = getEventStatus(event.date_debut, event.date_fin);
                
                return (
                  <TableRow key={event.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Salle */}
                    <TableCell>
                      <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{event.salle?.nom_salle || "Non spécifié"}</span>
                          <span className="text-xs text-gray-500">{event.type || "Évènement"}</span>
                      </div>
                    </TableCell>

                    {/* Client */}
                    <TableCell className="font-medium text-gray-700">
                        {event.nom_client || "Anonyme"}
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                        <div className="flex flex-col text-sm">
                            <div className="flex items-center gap-1.5 text-gray-900">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                {dateStart.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                                <Clock className="w-3.5 h-3.5" />
                                {dateStart.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    </TableCell>

                    {/* Montant */}
                    <TableCell>
                        <div className="font-semibold text-gray-900">
                             {event.montant ? event.montant.toLocaleString("fr-FR") : "0"} <span className="text-xs font-normal text-gray-500">FCFA</span>
                        </div>
                    </TableCell>

                    {/* Contact */}
                    <TableCell>
                        {event.contact_client ? (
                            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 w-fit px-2 py-1 rounded-md border border-gray-100">
                                <Phone size={12} />
                                <span className="text-xs font-medium">{event.contact_client}</span>
                            </div>
                        ) : (
                            <span className="text-gray-400 text-xs italic">N/A</span>
                        )}
                    </TableCell>

                    {/* Statut */}
                    <TableCell className="text-right pr-6">
                      {getStatusBadge(status)}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                        <SearchX className="w-8 h-8" />
                        <p>Aucun évènement trouvé pour le moment.</p>
                    </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- Pagination --- */}
      {events.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Afficher</span>
                <Select
                    value={rowsPerPage.toString()}
                    onValueChange={(value) => {
                        setRowsPerPage(Number(value));
                        setCurrentPage(1);
                    }}
                >
                    <SelectTrigger className="w-[70px] h-8">
                        <SelectValue placeholder={rowsPerPage} />
                    </SelectTrigger>
                    <SelectContent>
                        {[5, 10, 20, 50].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                                {num}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span>par page</span>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 mr-2">
                    Page {currentPage} sur {totalPages}
                </span>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}