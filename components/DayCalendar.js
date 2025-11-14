"use client";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { ChevronLeft, ChevronRight, Clock, UserStar } from "lucide-react";

dayjs.locale("fr");

export default function DayCalendar({ events = [] }) {
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [selectedDay, setSelectedDay] = useState(dayjs());

    // ⏰ Mettre à jour la ligne rouge chaque minute
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(dayjs()), 60000);
        return () => clearInterval(interval);
    }, []);

    // 🕒 Calcule la position verticale d'une heure donnée
    const getTimePosition = (date) => {
        const totalMinutes = date.hour() * 60 + date.minute();
        return (totalMinutes / 60) * 64; // 64px par heure
    };

    // 🔹 Gestion des boutons gauche/droite pour changer la date
    const prevDay = () => setSelectedDay(selectedDay.subtract(1, "day"));
    const nextDay = () => setSelectedDay(selectedDay.add(1, "day"));

    return (
        <div className="relative h-[500px] overflow-y-scroll bg-gray-50 border rounded-lg">
            {/* En-tête avec navigation */}
            <div className="sticky top-0 z-30 bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-4 shadow-sm border-b border-gray-200 flex items-center justify-between">
                <button
                    onClick={prevDay}
                    className="bg-white/20 hover:bg-white/30 border-white text-white p-4 rounded-md"
                >
                    <ChevronLeft size={16} />
                </button>
                <h2 className="text-lg font-semibold ">
                    {selectedDay.format("dddd DD MMMM YYYY")}
                </h2>
                <button
                    onClick={nextDay}
                    className="bg-white/20 hover:bg-white/30 border-white text-white p-4 rounded-md"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Grille horaire */}
            <div className="relative">
                {[...Array(24)].map((_, hour) => (
                    <div
                        key={hour}
                        className="flex items-center h-16 border-t border-gray-200 text-gray-500 text-xs px-2"
                    >
                        <div className="w-12 h-full text-right text-sm">{String(hour).padStart(2, "0")}:00</div>
                    </div>
                ))}

                {/* Ligne rouge = heure actuelle */}
                {selectedDay.isSame(currentTime, "day") && (
                    <div
                        className="absolute left-0 right-0 border-t-2 border-red-500 z-20"
                        style={{ top: `${getTimePosition(currentTime)}px` }}
                    >
                        <div className="absolute -left-1 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                )}

                {/* Événements du jour */}
                {events
                    .filter((e) => {
                        const start = dayjs(e.date_debut);
                        const end = dayjs(e.date_fin);
                        return (
                            selectedDay.isSame(start, "day") ||
                            selectedDay.isSame(end, "day") ||
                            (selectedDay.isAfter(start, "day") && selectedDay.isBefore(end, "day"))
                        );
                    })
                    .map((e) => {
                        const start = dayjs(e.date_debut);
                        const end = dayjs(e.date_fin);

                        const eventStart = selectedDay.isAfter(start, "day")
                            ? selectedDay.startOf("day")
                            : start;
                        const eventEnd = selectedDay.isBefore(end, "day")
                            ? selectedDay.endOf("day")
                            : end;

                        const top = getTimePosition(eventStart);
                        const height = getTimePosition(eventEnd) - getTimePosition(eventStart);

                        return (
                            <div
                                key={e.id}
                                className="absolute flex flex-col cursor-pointer overflow-hidden left-18 right-4 border-l-5 border-green-500 bg-green-50 rounded-sm p-2 shadow-sm hover:shadow-md transition-shadow z-10"
                                style={{ top: `${top}px`, height: `${height}px` }}
                            >
                                <p className="font-semibold text-md text-green-800">{e.categorie}</p>
                                <p className="text-sm flex items-center gap-1 text-green-700">
                                    <Clock size={16} />
                                    {start.format("HH:mm")} - {end.format("HH:mm")}
                                </p>
                                <p className="text-md mt-auto flex items-center gap-1 text-green-600">
                                    <UserStar size={16} color="red" />
                                    {e.nom_client}
                                </p>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
