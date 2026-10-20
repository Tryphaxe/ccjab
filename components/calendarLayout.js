import { differenceInCalendarDays, endOfDay, isSameDay, startOfDay } from "date-fns";

export function isMultiDayEvent(event) {
    if (!event?.date_debut) return false;
    const start = new Date(event.date_debut);
    const end = new Date(event.date_fin || event.date_debut);
    return Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && !isSameDay(start, end);
}

export function getSingleDayEvents(events, day) {
    return events.filter((event) => {
        if (!event?.date_debut || isMultiDayEvent(event)) return false;
        const start = new Date(event.date_debut);
        return Number.isFinite(start.getTime()) && isSameDay(start, day);
    }).sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut));
}

export function getMultiDayWeekLayout(events, days) {
    if (!days?.length) return { segments: [], laneCount: 0 };

    const weekStart = startOfDay(days[0]);
    const weekEnd = endOfDay(days[days.length - 1]);
    const segments = events.flatMap((event) => {
        if (!isMultiDayEvent(event)) return [];
        const start = new Date(event.date_debut);
        const end = new Date(event.date_fin || event.date_debut);
        if (start > weekEnd || end < weekStart) return [];

        const startColumn = start < weekStart ? 0 : differenceInCalendarDays(start, weekStart);
        const endColumn = end > weekEnd ? days.length - 1 : differenceInCalendarDays(end, weekStart);
        return [{
            event,
            startColumn: Math.max(0, startColumn),
            endColumn: Math.min(days.length - 1, endColumn),
            continuesBefore: start < weekStart,
            continuesAfter: end > weekEnd,
            startsInWeek: start >= weekStart,
            endsInWeek: end <= weekEnd,
        }];
    }).sort((a, b) => a.startColumn - b.startColumn || b.endColumn - a.endColumn);

    const laneEnds = [];
    const placedSegments = segments.map((segment) => {
        let lane = laneEnds.findIndex((endColumn) => endColumn < segment.startColumn);
        if (lane === -1) lane = laneEnds.length;
        laneEnds[lane] = segment.endColumn;
        return { ...segment, lane };
    });

    return { segments: placedSegments, laneCount: laneEnds.length };
}
