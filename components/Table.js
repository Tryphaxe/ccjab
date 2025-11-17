"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  if (loading) return <p>Chargement...</p>;

  const totalPages = Math.ceil(events.length / rowsPerPage);
  const paginatedEvents = events.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getStatusClasses = (status) => {
    switch (status) {
      case "En cours":
        return "text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium";
      case "A venir":
        return "text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium";
      case "Terminé":
        return "text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Salle</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Heure</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-center">Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedEvents.length > 0 ? (
            paginatedEvents.map((event) => {
              const date = new Date(event.date_debut);
              const status = getEventStatus(event.date_debut, event.date_fin);
              return (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">
                    {event.salle?.nom_salle || "N/A"}
                  </TableCell>
                  <TableCell>{event.nom_client || "N/A"}</TableCell>
                  <TableCell>
                    {date.toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    {date.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    {event.montant
                      ? event.montant.toLocaleString("fr-FR") + " CFA"
                      : "N/A"}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Phone size={14} />
                    {event.contact_client || "N/A"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={getStatusClasses(status)}>{status}</span>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500 py-6">
                Aucun évènement trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* ✅ Pagination Shadcn */}
      <div className="flex items-center justify-between mt-4">
        {/* Sélecteur du nombre de lignes */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Lignes par page :</span>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(value) => {
              setRowsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[70px] h-8 text-sm">
              <SelectValue placeholder={rowsPerPage} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 15, 20].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Boutons de pagination */}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <PaginationPrevious className="h-4 w-4" />
              </Button>
            </PaginationItem>

            <span className="text-sm px-3">
              Page {currentPage} sur {totalPages}
            </span>

            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <PaginationNext className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}