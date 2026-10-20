"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  List,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EventOriginLegend,
  getEventOriginColor,
} from "@/components/EventOrigin";
import CalendarEventDialog from "@/components/CalendarEventDialog";
import {
  getMultiDayWeekLayout,
  getSingleDayEvents,
} from "@/components/calendarLayout";

const weekdays = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];

function eventOccursOn(event, day) {
  if (!event.date_debut) return false;
  const start = new Date(event.date_debut);
  const end = new Date(event.date_fin || event.date_debut);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()))
    return false;
  return start <= endOfDay(day) && end >= startOfDay(day);
}

export default function CalendarView({ events = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [focusedDay, setFocusedDay] = useState(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);
  const weeks = useMemo(
    () =>
      Array.from({ length: days.length / 7 }, (_, index) =>
        days.slice(index * 7, index * 7 + 7),
      ),
    [days],
  );
  const eventCount = useMemo(
    () =>
      events.filter((event) => {
        if (!event.date_debut) return false;
        const start = new Date(event.date_debut);
        const end = new Date(event.date_fin || event.date_debut);
        return (
          Number.isFinite(start.getTime()) &&
          Number.isFinite(end.getTime()) &&
          start <= endOfMonth(currentMonth) &&
          end >= startOfMonth(currentMonth)
        );
      }).length,
    [events, currentMonth],
  );
  const eventsForDay = (day) =>
    events
      .filter((event) => eventOccursOn(event, day))
      .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut));

  const openDay = (day) => setFocusedDay(day);

  return (
    <section
      aria-label="Calendrier mensuel des événements"
      className="min-w-0 space-y-4"
    >
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <span className="rounded-xl bg-[#fae9e3] p-3 text-[#a93105]">
            <CalendarDays size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="font-[Georgia] text-2xl font-semibold capitalize tracking-tight text-[#1b1b1d]">
              {format(currentMonth, "MMMM yyyy", { locale: fr })}
            </h3>
            <p className="mt-0.5 text-xs text-[#765f58]">
              {eventCount} événement{eventCount === 1 ? "" : "s"} dans la
              période
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
            className="h-9 gap-2 border-[#eee8eb] bg-white text-[#59413a] hover:bg-[#f6f3f5]"
          >
            <RotateCcw size={14} />
            Aujourd’hui
          </Button>
          <div className="inline-flex items-center rounded-xl border border-[#eee8eb] bg-white p-1 shadow-sm">
            <Button
              aria-label="Mois précédent"
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth((month) => subMonths(month, 1))}
              className="h-8 w-8 text-[#765f58] hover:bg-[#f6f3f5] hover:text-[#a93105]"
            >
              <ChevronLeft size={17} />
            </Button>
            <span className="mx-1 h-5 w-px bg-[#eee8eb]" />
            <Button
              aria-label="Mois suivant"
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth((month) => addMonths(month, 1))}
              className="h-8 w-8 text-[#765f58] hover:bg-[#f6f3f5] hover:text-[#a93105]"
            >
              <ChevronRight size={17} />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#eee8eb] bg-[#f6f3f5] px-3 py-2.5">
        <EventOriginLegend />
        <p className="inline-flex items-center gap-1.5 text-[11px] text-[#765f58]">
          <Clock3 size={13} /> Sélectionnez un événement pour voir ses
          informations
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#eee8eb] bg-white shadow-[0_2px_12px_rgba(42,24,30,0.035)]">
        <div className="min-w-[840px]">
          <div className="grid grid-cols-7 border-b border-[#eee8eb] bg-[#f6f3f5]">
            {weekdays.map((day) => (
              <div
                key={day}
                className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-[#765f58]"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="divide-y divide-[#eee8eb]">
            {weeks.map((week) => {
              const { segments, laneCount } = getMultiDayWeekLayout(
                events,
                week,
              );
              return (
                <div
                  key={week[0].toISOString()}
                  className="relative grid grid-cols-7"
                >
                  {week.map((day) => {
                    const dayEvents = eventsForDay(day);
                    const singleDayEvents = getSingleDayEvents(events, day);
                    const inMonth = isSameMonth(day, currentMonth);
                    const visibleEvents = singleDayEvents.slice(0, 3);
                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-[132px] border-r border-[#eee8eb] p-2.5 transition-colors ${inMonth ? "bg-white hover:bg-[#fcf8fb]" : "bg-[#faf8f9]"}`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span
                            className={`flex h-7 min-w-7 items-center justify-center rounded-lg px-1.5 text-xs font-bold ${isToday(day) ? "bg-[#a93105] text-white" : inMonth ? "text-[#1b1b1d]" : "text-[#b9a9a8]"}`}
                            aria-current={isToday(day) ? "date" : undefined}
                          >
                            {format(day, "d")}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="rounded-full bg-[#f0edef] px-2 py-0.5 text-[9px] font-bold text-[#765f58]">
                              {dayEvents.length}
                            </span>
                          )}
                        </div>
                        <div
                          className="space-y-1.5"
                          style={{ paddingTop: laneCount * 25 }}
                        >
                          {visibleEvents.map((event) => {
                            const start = new Date(event.date_debut);
                            const end = new Date(
                              event.date_fin || event.date_debut,
                            );
                            return (
                              <button
                                key={event.id}
                                type="button"
                                onClick={() => setSelectedEvent(event)}
                                title={`${event.nom_evenement || event.type || "Événement"} · ${event.nom_client || "Client"}`}
                                style={{
                                  borderLeftColor: getEventOriginColor(event),
                                }}
                                className="block w-full min-w-0 border border-l-[3px] bg-[#efdbc832] px-2 py-1.5 text-left transition hover:border-[#d8c9c6] hover:bg-[#f6f3f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a93105]"
                              >
                                <span className="block truncate text-[12px] font-bold leading-4 text-[#1b1b1d]">
                                  {event.nom_evenement ||
                                    event.type ||
                                    "Événement sans titre"}
                                </span>
                                <span className="mt-0.5 block truncate text-[12px] text-[#765f58]">
                                  {Number.isFinite(start.getTime())
                                    ? format(start, "HH:mm")
                                    : "Horaire à confirmer"}
                                  {event.date_fin &&
                                  Number.isFinite(end.getTime())
                                    ? ` – ${format(end, "HH:mm")}`
                                    : ""}
                                  {event.salles?.[0]?.nom_salle
                                    ? ` · ${event.salles[0].nom_salle}`
                                    : ""}
                                </span>
                              </button>
                            );
                          })}
                          {singleDayEvents.length > visibleEvents.length && (
                            <button
                              type="button"
                              onClick={() => openDay(day)}
                              className="inline-flex items-center gap-1 px-1 text-[10px] font-bold text-[#a93105] hover:underline"
                            >
                              <List size={12} />+{" "}
                              {singleDayEvents.length - visibleEvents.length}{" "}
                              autres
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {segments.length > 0 && (
                    <div
                      className="pointer-events-none absolute inset-x-0 top-[48px] grid gap-y-1"
                      style={{
                        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                        gridTemplateRows: `repeat(${laneCount}, 21px)`,
                      }}
                    >
                      {segments.map(
                        ({
                          event,
                          startColumn,
                          endColumn,
                          lane,
                          continuesBefore,
                          continuesAfter,
                          startsInWeek,
                          endsInWeek,
                        }) => {
                          const start = new Date(event.date_debut);
                          const end = new Date(
                            event.date_fin || event.date_debut,
                          );
                          const title =
                            event.nom_evenement ||
                            event.type ||
                            "Événement sans titre";
                          const time =
                            startsInWeek && endsInWeek
                              ? `${format(start, "HH:mm")}–${format(end, "HH:mm")}`
                              : startsInWeek
                                ? `Dès ${format(start, "HH:mm")} →`
                                : endsInWeek
                                  ? `→ ${format(end, "HH:mm")}`
                                  : "En cours";
                          return (
                            <button
                              key={`${event.id}-${week[0].toISOString()}`}
                              type="button"
                              onClick={() => setSelectedEvent(event)}
                              title={title}
                              style={{
                                gridColumn: `${startColumn + 1} / ${endColumn + 2}`,
                                gridRow: lane + 1,
                                borderLeftColor: getEventOriginColor(event),
                              }}
                              className="pointer-events-auto mx-2.5 flex min-w-0 items-center gap-1 overflow-hidden border border-[#eaeee8] border-l-[3px] bg-[#fdf8f0] px-1.5 text-left hover:bg-[#f6f3f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a93105]"
                            >
                              <span className="truncate text-[12px] font-bold text-[#1b1b1d]">
                                {continuesBefore && "← "}
                                {title}
                                {continuesAfter && " →"}
                              </span>
                              <span className="shrink-0 text-[12px] text-[#765f58]">
                                {time}
                              </span>
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CalendarEventDialog
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      />
      {focusedDay && (
        <DayEventsDialog
          day={focusedDay}
          events={eventsForDay(focusedDay)}
          onClose={() => setFocusedDay(null)}
          onSelect={(event) => {
            setFocusedDay(null);
            setSelectedEvent(event);
          }}
        />
      )}
    </section>
  );
}

function DayEventsDialog({ day, events, onClose, onSelect }) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-[Georgia] text-xl">
            {format(day, "EEEE d MMMM", { locale: fr })}
          </DialogTitle>
          <DialogDescription>
            {events.length} événement{events.length === 1 ? "" : "s"} à cette
            date
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {events.map((event) => {
            const start = new Date(event.date_debut);
            const end = new Date(event.date_fin || event.date_debut);
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelect(event)}
                style={{ borderLeftColor: getEventOriginColor(event) }}
                className="w-full rounded-lg border border-[#eee8eb] border-l-4 bg-white p-3 text-left hover:bg-[#f6f3f5]"
              >
                <span className="block text-sm font-semibold text-[#1b1b1d]">
                  {event.nom_evenement || event.type || "Événement sans titre"}
                </span>
                <span className="mt-1 block text-xs text-[#765f58]">
                  {Number.isFinite(start.getTime())
                    ? format(start, "HH:mm")
                    : "Horaire à confirmer"}
                  {event.date_fin && Number.isFinite(end.getTime())
                    ? ` – ${format(end, "HH:mm")}`
                    : ""}{" "}
                  ·{" "}
                  {event.salles?.map((room) => room.nom_salle).join(", ") ||
                    "Lieu à confirmer"}
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
