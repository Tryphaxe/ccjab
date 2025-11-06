"use client"

import React, { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CalendarCheck2, Phone } from "lucide-react"
import { fetchEvents } from "@/utils/evenUtils"
import { getEventStatus } from "@/lib/evenHelper"

export default function TableList() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents(setEvents, setLoading)
  }, [])

  if (loading) return <p>Chargement...</p>

  const getStatusClasses = (status) => {
    switch (status) {
      case "En cours":
        return "text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium"
      case "A venir":
        return "text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium"
      case "Terminé":
        return "text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium"
      default:
        return ""
    }
  }

  return (
    <Table>
      <TableCaption>La liste des récentes réservations</TableCaption>
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
        {events.map((event) => {
          const date = new Date(event.date_debut)
          const status = getEventStatus(event.date_debut, event.date_fin)
          return (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.salle?.nom_salle || "N/A"}</TableCell>
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
              <TableCell>{event.montant ? (event.montant).toLocaleString("fr-FR") + " CFA" : "N/A"}</TableCell>
              <TableCell className="flex items-center gap-2">
                <Phone size={14} />
                {event.contact_client || "N/A"}
              </TableCell>
              <TableCell className="text-center">
                <span className={getStatusClasses(status)}>{status}</span>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}