"use client";

import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays, Clock3, MapPin, UserRound, UsersRound, Banknote, FileText, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventOriginBadge } from "@/components/EventOrigin";
import { getEventStatus } from "@/lib/evenHelper";

const money = (value) => value == null ? null : `${Number(value).toLocaleString("fr-FR")} FCFA`;

export default function CalendarEventDialog({ event, open, onOpenChange }) {
    if (!event) return null;

    const start = new Date(event.date_debut);
    const end = new Date(event.date_fin || event.date_debut);
    const validDates = Number.isFinite(start.getTime()) && Number.isFinite(end.getTime());
    const isMultiDay = validDates && !isSameDay(start, end);
    const rooms = Array.isArray(event.salles)
        ? event.salles.map((room) => room.nom_salle).filter(Boolean).join(" · ")
        : event.nom_salle;
    const agent = event.agent?.name || event.agent?.nom;
    const status = getEventStatus(event.date_debut, event.date_fin);
    const title = event.nom_evenement || event.description || event.type || "Événement sans titre";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-xl">
                <DialogHeader className="border-b border-[#eee8eb] bg-[#f6f3f5] p-5 pr-12 sm:p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Badge className={status === "En cours" ? "border-0 bg-[#ffeed1] text-[#7b5500]" : status === "Terminé" ? "border-0 bg-[#e2f1e8] text-[#446554]" : "border-0 bg-[#f0edef] text-[#59413a]"}>{status}</Badge>
                        <EventOriginBadge event={event} className="text-[10px]" />
                        {event.categorie && <Badge variant="outline" className="border-[#e9e1e4] bg-white text-[#59413a]">{event.categorie}</Badge>}
                    </div>
                    <DialogTitle className="font-[Georgia] text-2xl leading-tight text-[#1b1b1d]">{title}</DialogTitle>
                    <DialogDescription className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#765f58]">
                        {validDates && <><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} />{isMultiDay ? `${format(start, "EEEE d MMMM yyyy", { locale: fr })} – ${format(end, "EEEE d MMMM yyyy", { locale: fr })}` : format(start, "EEEE d MMMM yyyy", { locale: fr })}</span><span className="inline-flex items-center gap-1.5"><Clock3 size={14} />{format(start, "HH:mm")} – {format(end, "HH:mm")}</span></>}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
                    <InfoTile icon={MapPin} label="Espace" value={rooms || "À confirmer"} />
                    {agent && <InfoTile icon={UserRound} label="Agent responsable" value={agent} />}
                    {event.nom_client && <InfoTile icon={UsersRound} label="Client" value={event.nom_client} detail={event.contact_client} />}
                    {event.type && <InfoTile icon={Info} label="Type" value={event.type} />}
                    {event.montant != null && <InfoTile icon={Banknote} label="Montant contractuel" value={money(event.montant)} detail={event.avance != null ? `Avance : ${money(event.avance)}` : null} />}
                    {event.description && event.nom_evenement && <div className="rounded-xl border border-[#eee8eb] bg-white p-4 sm:col-span-2"><p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#8d7169]">Description</p><p className="whitespace-pre-wrap text-sm leading-6 text-[#59413a]">{event.description}</p></div>}
                    {event.fiche && <a href={event.fiche} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#eee8eb] bg-white p-4 text-sm font-semibold text-[#a93105] transition hover:bg-[#f6f3f5] sm:col-span-2"><FileText size={16} /> Ouvrir la fiche technique</a>}
                </div>
                <DialogFooter className="border-t border-[#eee8eb] bg-[#fcf8fb] p-4 sm:px-6"><Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function InfoTile({ icon: Icon, label, value, detail }) {
    return <div className="min-w-0 rounded-xl border border-[#eee8eb] bg-white p-4"><p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#8d7169]"><Icon size={14} className="text-[#a93105]" />{label}</p><p className="break-words text-sm font-semibold text-[#1b1b1d]">{value}</p>{detail && <p className="mt-1 break-words text-xs text-[#765f58]">{detail}</p>}</div>;
}
