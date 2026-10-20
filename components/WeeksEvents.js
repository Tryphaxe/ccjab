"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, addWeeks, eachDayOfInterval, endOfWeek, format, isSameDay, isToday, startOfWeek, subWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarRange, ChevronLeft, ChevronRight, Clock3, Loader2, RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventOriginLegend, getEventOriginColor } from "@/components/EventOrigin";
import CalendarEventDialog from "@/components/CalendarEventDialog";
import { getMultiDayWeekLayout, getSingleDayEvents } from "@/components/calendarLayout";

function occursOn(event, day) {
    const start = new Date(event.date_debut);
    const end = new Date(event.date_fin || event.date_debut);
    return Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && start < addDays(day, 1) && end >= day;
}

export default function WeeksEvents() {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    const days = useMemo(() => eachDayOfInterval({ start, end }), [start.getTime(), end.getTime()]);

    useEffect(() => {
        const controller = new AbortController();
        const loadEvents = async () => {
            setIsLoading(true);
            setError("");
            try {
                const params = new URLSearchParams({ start: start.toISOString(), end: end.toISOString() });
                const response = await fetch(`/api/even/weeks?${params.toString()}`, { signal: controller.signal });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Impossible de charger les événements de la semaine.");
                if (!Array.isArray(data)) throw new Error("Le calendrier a reçu des données inattendues.");
                setEvents(data);
            } catch (loadError) {
                if (loadError.name !== "AbortError") {
                    setError(loadError.message || "Impossible de charger les événements.");
                    setEvents([]);
                }
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };
        loadEvents();
        return () => controller.abort();
    }, [start.getTime(), end.getTime(), retryCount]);

    const goToToday = () => setCurrentWeek(new Date());
    const totalEvents = events.length;
    const { segments, laneCount } = useMemo(() => getMultiDayWeekLayout(events, days), [events, days]);

    return (
        <section aria-label="Calendrier hebdomadaire" className="min-w-0 space-y-4">
            <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="rounded-xl bg-[#fae9e3] p-3 text-[#a93105]"><CalendarRange size={20} /></span>
                    <div className="min-w-0"><h3 className="font-[Georgia] text-xl font-semibold text-[#1b1b1d]">Semaine du {format(start, "d MMMM", { locale: fr })}</h3><p className="mt-0.5 text-xs text-[#765f58]">{format(start, "d MMM", { locale: fr })} – {format(end, "d MMMM yyyy", { locale: fr })} · {totalEvents} événement{totalEvents === 1 ? "" : "s"}</p></div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button variant="outline" size="sm" onClick={goToToday} disabled={isSameDay(start, startOfWeek(new Date(), { weekStartsOn: 1 }))} className="h-9 gap-2 border-[#eee8eb] bg-white text-[#59413a] hover:bg-[#f6f3f5]"><RotateCcw size={14} />Cette semaine</Button>
                    <div className="inline-flex items-center rounded-xl border border-[#eee8eb] bg-white p-1 shadow-sm">
                        <Button aria-label="Semaine précédente" variant="ghost" size="icon" onClick={() => setCurrentWeek((week) => subWeeks(week, 1))} className="h-8 w-8 text-[#765f58] hover:bg-[#f6f3f5] hover:text-[#a93105]"><ChevronLeft size={17} /></Button>
                        <span className="mx-1 h-5 w-px bg-[#eee8eb]" />
                        <Button aria-label="Semaine suivante" variant="ghost" size="icon" onClick={() => setCurrentWeek((week) => addWeeks(week, 1))} className="h-8 w-8 text-[#765f58] hover:bg-[#f6f3f5] hover:text-[#a93105]"><ChevronRight size={17} /></Button>
                    </div>
                </div>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#eee8eb] bg-[#f6f3f5] px-3 py-2.5"><EventOriginLegend /><p className="inline-flex items-center gap-1.5 text-[11px] text-[#765f58]"><Clock3 size={13} />Sélectionnez un événement pour son détail</p></div>

            {isLoading ? <div className="flex min-h-[380px] items-center justify-center gap-3 rounded-2xl border border-[#eee8eb] bg-white text-sm text-[#765f58]"><Loader2 className="h-5 w-5 animate-spin text-[#a93105]" />Chargement de la semaine…</div> : error ? <div role="alert" className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#f0d5cf] bg-white px-5 text-center"><TriangleAlert className="mb-3 h-7 w-7 text-[#a93105]" /><p className="font-semibold text-[#1b1b1d]">Le planning n’a pas pu être chargé</p><p className="mt-1 max-w-md text-sm text-[#765f58]">{error}</p><Button variant="outline" onClick={() => setRetryCount((count) => count + 1)} className="mt-4 border-[#eee8eb]">Réessayer</Button></div> : (
                <div className="overflow-x-auto rounded-2xl border border-[#eee8eb] bg-white shadow-[0_2px_12px_rgba(42,24,30,0.035)]">
                    <div className="grid min-w-[1050px] grid-cols-7 divide-x divide-[#eee8eb]" style={{ gridTemplateRows: `auto repeat(${laneCount}, 34px) minmax(320px, 1fr)` }}>
                        {days.map((day, index) => {
                            const dayEvents = events.filter((event) => occursOn(event, day)).sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut));
                            return <header key={day.toISOString()} aria-label={format(day, "EEEE d MMMM", { locale: fr })} style={{ gridColumn: index + 1, gridRow: 1 }} className={`border-b border-[#eee8eb] px-3 py-3 ${isToday(day) ? "bg-[#fff5f1]" : "bg-[#f6f3f5]"}`}>
                                <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#8d7169]">{format(day, "EEEE", { locale: fr })}</p>
                                <div className="mt-1 flex items-center justify-between"><span className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-bold ${isToday(day) ? "bg-[#a93105] text-white" : "text-[#1b1b1d]"}`}>{format(day, "d")}</span><span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold text-[#765f58]">{dayEvents.length}</span></div>
                            </header>;
                        })}
                        {segments.map(({ event, startColumn, endColumn, lane, continuesBefore, continuesAfter, startsInWeek, endsInWeek }) => {
                            const startTime = new Date(event.date_debut);
                            const endTime = new Date(event.date_fin || event.date_debut);
                            const title = event.nom_evenement || event.description || event.type || "Événement sans titre";
                            const time = startsInWeek && endsInWeek ? `${format(startTime, "HH:mm")}–${format(endTime, "HH:mm")}` : startsInWeek ? `Dès ${format(startTime, "HH:mm")} →` : endsInWeek ? `→ ${format(endTime, "HH:mm")}` : "En cours";
                            return <button key={`${event.id}-${start.toISOString()}`} type="button" onClick={() => setSelectedEvent(event)} title={title} style={{ gridColumn: `${startColumn + 1} / ${endColumn + 2}`, gridRow: lane + 2, borderLeftColor: getEventOriginColor(event) }} className="mx-1 my-0.5 flex min-w-0 items-center gap-2 overflow-hidden rounded-md border border-[#eee8eb] border-l-4 bg-white px-2.5 text-left shadow-sm hover:bg-[#fcf8fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a93105]">
                                <span className="truncate text-[10px] font-bold text-[#1b1b1d]">{continuesBefore && "← "}{title}{continuesAfter && " →"}</span><span className="shrink-0 text-[9px] text-[#765f58]">{time}</span>
                            </button>;
                        })}
                        {days.map((day, index) => {
                            const dayEvents = getSingleDayEvents(events, day);
                            const hasMultiDayEvent = segments.some(({ startColumn, endColumn }) => index >= startColumn && index <= endColumn);
                            return <section key={`events-${day.toISOString()}`} aria-label={`Événements du ${format(day, "EEEE d MMMM", { locale: fr })}`} style={{ gridColumn: index + 1, gridRow: laneCount + 2 }} className="min-h-[320px] space-y-2 bg-white p-2.5">
                                {dayEvents.map((event) => {
                                    const startTime = new Date(event.date_debut);
                                    const endTime = new Date(event.date_fin || event.date_debut);
                                    const title = event.nom_evenement || event.description || event.type || "Événement sans titre";
                                    return <button key={event.id} type="button" onClick={() => setSelectedEvent(event)} style={{ borderLeftColor: getEventOriginColor(event) }} className="w-full rounded-lg border border-[#eee8eb] border-l-4 bg-white p-2.5 text-left transition hover:-translate-y-0.5 hover:bg-[#fcf8fb] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a93105]">
                                        <span className="block text-[9px] font-bold uppercase tracking-wide text-[#a93105]">{Number.isFinite(startTime.getTime()) ? format(startTime, "HH:mm") : "Horaire à confirmer"}{event.date_fin && Number.isFinite(endTime.getTime()) ? ` – ${format(endTime, "HH:mm")}` : ""}</span>
                                        <span className="mt-1 block break-words text-xs font-bold leading-4 text-[#1b1b1d]">{title}</span>
                                        <span className="mt-1.5 block truncate text-[10px] text-[#765f58]">{event.salles?.map((room) => room.nom_salle).join(" · ") || "Lieu à confirmer"}</span>
                                        {event.categorie && <span className="mt-2 inline-block max-w-full truncate rounded bg-[#f0edef] px-1.5 py-0.5 text-[9px] font-semibold text-[#59413a]">{event.categorie}</span>}
                                    </button>;
                                })}
                                {!dayEvents.length && !hasMultiDayEvent && <p className="pt-3 text-center text-[10px] text-[#b09f9c]">Aucun événement</p>}
                            </section>;
                        })}
                    </div>
                </div>
            )}
            <CalendarEventDialog event={selectedEvent} open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)} />
        </section>
    );
}
