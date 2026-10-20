"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventOriginLegend, getEventOriginColor } from "@/components/EventOrigin";
import CalendarEventDialog from "@/components/CalendarEventDialog";

dayjs.locale("fr");
const HOUR_HEIGHT = 64;
const hourLabels = Array.from({ length: 24 }, (_, hour) => hour);

function layoutOverlappingEvents(items) {
    const sorted = [...items].sort((a, b) => a.start - b.start || b.end - a.end);
    const output = [];
    let cluster = [];
    let clusterEnd = -1;

    const flushCluster = () => {
        if (!cluster.length) return;
        const laneEnds = [];
        const placed = cluster.map((item) => {
            let lane = laneEnds.findIndex((end) => end <= item.start);
            if (lane === -1) lane = laneEnds.length;
            laneEnds[lane] = item.end;
            return { ...item, lane };
        });
        output.push(...placed.map((item) => ({ ...item, columns: laneEnds.length })));
        cluster = [];
        clusterEnd = -1;
    };

    for (const item of sorted) {
        if (cluster.length && item.start >= clusterEnd) flushCluster();
        cluster.push(item);
        clusterEnd = Math.max(clusterEnd, item.end);
    }
    flushCluster();
    return output;
}

export default function DayCalendar({ events = [] }) {
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [selectedDay, setSelectedDay] = useState(dayjs());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(dayjs()), 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const startHour = selectedDay.isSame(currentTime, "day") ? Math.max(0, currentTime.hour() - 1) : 8;
        container.scrollTop = startHour * HOUR_HEIGHT;
    }, [selectedDay]);

    const eventLayouts = useMemo(() => {
        const dayStart = selectedDay.startOf("day");
        const dayEnd = selectedDay.endOf("day");
        const items = events.flatMap((event) => {
            if (!event.date_debut || !event.date_fin) return [];
            const start = dayjs(event.date_debut);
            const end = dayjs(event.date_fin);
            if (!start.isValid() || !end.isValid() || end.isBefore(dayStart) || start.isAfter(dayEnd)) return [];
            const visibleStart = start.isBefore(dayStart) ? dayStart : start;
            const visibleEnd = end.isAfter(dayEnd) ? dayEnd : end;
            return [{ event, start: visibleStart.valueOf(), end: Math.max(visibleEnd.valueOf(), visibleStart.valueOf() + 30 * 60000), startLabel: start.format("HH:mm"), endLabel: end.format("HH:mm"), continuesBefore: start.isBefore(dayStart), continuesAfter: end.isAfter(dayEnd) }];
        });
        return layoutOverlappingEvents(items);
    }, [events, selectedDay]);

    const previousDay = () => setSelectedDay((day) => day.subtract(1, "day"));
    const nextDay = () => setSelectedDay((day) => day.add(1, "day"));
    const goToToday = () => setSelectedDay(dayjs());
    const dateLabel = selectedDay.format("dddd D MMMM YYYY");

    return (
        <section aria-label="Calendrier journalier" className="min-w-0 space-y-4">
            <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="rounded-xl bg-[#fae9e3] p-3 text-[#a93105]"><CalendarDays size={20} /></span>
                    <div className="min-w-0"><h3 className="truncate font-[Georgia] text-xl font-semibold capitalize text-[#1b1b1d]">{dateLabel}</h3><p className="mt-0.5 text-xs text-[#765f58]">{eventLayouts.length} événement{eventLayouts.length === 1 ? "" : "s"} · Heure locale</p></div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button variant="outline" size="sm" onClick={goToToday} disabled={selectedDay.isSame(dayjs(), "day")} className="h-9 gap-2 border-[#eee8eb] bg-white text-[#59413a] hover:bg-[#f6f3f5]"><RotateCcw size={14} />Aujourd’hui</Button>
                    <div className="inline-flex items-center rounded-xl border border-[#eee8eb] bg-white p-1 shadow-sm">
                        <Button aria-label="Jour précédent" variant="ghost" size="icon" onClick={previousDay} className="h-8 w-8 text-[#765f58] hover:bg-[#f6f3f5] hover:text-[#a93105]"><ChevronLeft size={17} /></Button>
                        <span className="mx-1 h-5 w-px bg-[#eee8eb]" />
                        <Button aria-label="Jour suivant" variant="ghost" size="icon" onClick={nextDay} className="h-8 w-8 text-[#765f58] hover:bg-[#f6f3f5] hover:text-[#a93105]"><ChevronRight size={17} /></Button>
                    </div>
                </div>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#eee8eb] bg-[#f6f3f5] px-3 py-2.5">
                <EventOriginLegend />
                <p className="inline-flex items-center gap-1.5 text-[11px] text-[#765f58]"><span className="h-2 w-2 rounded-full bg-rose-500" />Ligne rouge : heure actuelle</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#eee8eb] bg-white shadow-[0_2px_12px_rgba(42,24,30,0.035)]">
                <div ref={scrollContainerRef} className="relative h-[min(68vh,720px)] min-h-[420px] overflow-y-auto overscroll-contain">
                    <div className="relative min-h-[1576px] pb-10">
                        {hourLabels.map((hour) => <div key={hour} className="flex border-b border-[#eee8eb]/70" style={{ height: `${HOUR_HEIGHT}px` }}>
                            <div className="sticky left-0 z-[5] w-[62px] shrink-0 border-r border-[#eee8eb] bg-[#faf8f9] px-2 pt-2 text-right text-[10px] font-semibold tabular-nums text-[#8d7169] sm:w-[72px]">{String(hour).padStart(2, "0")}:00</div>
                            <div className="relative flex-1"><span className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#eee8eb]/70" /></div>
                        </div>)}

                        {selectedDay.isSame(currentTime, "day") && <div className="pointer-events-none absolute left-[62px] right-0 z-20 border-t-2 border-rose-500 sm:left-[72px]" style={{ top: `${(currentTime.hour() * 60 + currentTime.minute()) / 60 * HOUR_HEIGHT}px` }}>
                            <span className="absolute -left-1.5 -top-[7px] h-3 w-3 rounded-full border-2 border-white bg-rose-500" /><span className="absolute right-2 -top-5 rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white">{currentTime.format("HH:mm")}</span>
                        </div>}

                        <div className="pointer-events-none absolute inset-y-0 left-[62px] right-2 sm:left-[72px] sm:right-3">
                            {eventLayouts.map(({ event, start, end, startLabel, endLabel, continuesBefore, continuesAfter, lane, columns }) => {
                                const top = (start - selectedDay.startOf("day").valueOf()) / 3600000 * HOUR_HEIGHT;
                                const height = Math.max((end - start) / 3600000 * HOUR_HEIGHT, 36);
                                const title = event.nom_evenement || event.description || event.type || "Événement sans titre";
                                return <button key={event.id} type="button" onClick={() => setSelectedEvent(event)} aria-label={`${title}, ${continuesBefore ? "commence avant cette journée" : startLabel}, ${continuesAfter ? "se poursuit après cette journée" : endLabel}. Voir le détail`} title={`${title} · ${continuesBefore ? "En cours à minuit" : startLabel} – ${continuesAfter ? "après minuit" : endLabel}`} className="pointer-events-auto absolute overflow-hidden rounded-lg border border-[#eee8eb] border-l-4 bg-white/95 p-2 text-left shadow-sm transition hover:z-30 hover:shadow-md focus-visible:z-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a93105]" style={{ top: `${top}px`, height: `${height}px`, left: `${lane * 100 / columns}%`, width: `${100 / columns}%`, borderLeftColor: getEventOriginColor(event) }}>
                                    <span className="block truncate text-[11px] font-bold leading-4 text-[#1b1b1d] sm:text-xs">{title}</span>
                                    <span className="mt-1 block truncate text-[10px] font-medium tabular-nums text-[#765f58]">{continuesBefore ? "← En cours" : startLabel} – {continuesAfter ? "Se poursuit →" : endLabel}</span>
                                    {height >= 62 && <span className="mt-1 block truncate text-[10px] text-[#8d7169]">{event.salles?.map((room) => room.nom_salle).join(" · ") || event.nom_salle || "Lieu à confirmer"}</span>}
                                    {height >= 94 && event.nom_client && <span className="mt-1 block truncate text-[10px] text-[#8d7169]">{event.nom_client}</span>}
                                </button>;
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <CalendarEventDialog event={selectedEvent} open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)} />
        </section>
    );
}
