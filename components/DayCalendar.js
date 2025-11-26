"use client";

import React, { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { ChevronLeft, ChevronRight, Clock, MapPin, User, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

dayjs.locale("fr");

const HOUR_HEIGHT = 80; // Hauteur d'une heure en pixels pour plus d'aération

export default function DayCalendar({ events = [] }) {
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [selectedDay, setSelectedDay] = useState(dayjs());
    const scrollContainerRef = useRef(null);

    // ⏰ Mise à jour de l'heure et scroll automatique au chargement
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(dayjs()), 60000);
        
        // Scroll initial vers 8h du matin pour voir le début de journée
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 8 * HOUR_HEIGHT;
        }

        return () => clearInterval(interval);
    }, []);

    // 🕒 Position verticale (pixels)
    const getTimePosition = (date) => {
        const totalMinutes = date.hour() * 60 + date.minute();
        return (totalMinutes / 60) * HOUR_HEIGHT;
    };

    const prevDay = () => setSelectedDay(selectedDay.subtract(1, "day"));
    const nextDay = () => setSelectedDay(selectedDay.add(1, "day"));
    const goToToday = () => setSelectedDay(dayjs());

    return (
        <div className="flex flex-col h-[600px] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            
            {/* --- En-tête --- */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-900 capitalize">
                            {selectedDay.format("dddd D MMMM YYYY")}
                        </span>
                    </div>
                    {!selectedDay.isSame(dayjs(), 'day') && (
                        <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs h-8">
                            Aujourd'hui
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={prevDay} className="h-8 w-8 hover:bg-gray-100">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextDay} className="h-8 w-8 hover:bg-gray-100">
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* --- Zone Scrollable --- */}
            <div 
                ref={scrollContainerRef}
                className="relative flex-1 overflow-y-auto no-scrollbar"
            >
                {/* Grille horaire de fond */}
                <div className="relative min-h-[1920px]"> {/* 24 * 80px */}
                    {[...Array(24)].map((_, hour) => (
                        <div
                            key={hour}
                            className="group flex border-b border-gray-100/60"
                            style={{ height: `${HOUR_HEIGHT}px` }}
                        >
                            {/* Colonne Heure */}
                            <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-gray-50/50 flex flex-col items-center justify-start pt-2">
                                <span className="text-xs font-medium text-gray-500">
                                    {String(hour).padStart(2, "0")}:00
                                </span>
                            </div>
                            
                            {/* Lignes horizontales subtiles */}
                            <div className="flex-1 relative">
                                {/* Ligne demi-heure (optionnel) */}
                                <div className="absolute top-1/2 w-full border-t border-dashed border-gray-50"></div>
                            </div>
                        </div>
                    ))}

                    {/* Ligne rouge = Heure actuelle */}
                    {selectedDay.isSame(currentTime, "day") && (
                        <div
                            className="absolute left-16 right-0 border-t-2 border-red-500 z-30 pointer-events-none"
                            style={{ top: `${getTimePosition(currentTime)}px` }}
                        >
                            <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white"></div>
                            <span className="absolute left-2 -top-6 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                {currentTime.format("HH:mm")}
                            </span>
                        </div>
                    )}

                    {/* Événements */}
                    {events
                        .filter((e) => {
                            if (!e.date_debut || !e.date_fin) return false;
                            const start = dayjs(e.date_debut);
                            const end = dayjs(e.date_fin);
                            // Vérifie si l'événement chevauche la journée sélectionnée
                            return (
                                selectedDay.isSame(start, "day") ||
                                selectedDay.isSame(end, "day") ||
                                (selectedDay.isAfter(start, "day") && selectedDay.isBefore(end, "day"))
                            );
                        })
                        .map((e) => {
                            const start = dayjs(e.date_debut);
                            const end = dayjs(e.date_fin);

                            // Clamp l'événement aux limites de la journée (00:00 -> 23:59)
                            const eventStart = selectedDay.isAfter(start, "day")
                                ? selectedDay.startOf("day")
                                : start;
                            const eventEnd = selectedDay.isBefore(end, "day")
                                ? selectedDay.endOf("day")
                                : end;

                            const top = getTimePosition(eventStart);
                            const durationMinutes = eventEnd.diff(eventStart, 'minute');
                            // Hauteur minimum de 30px pour visibilité
                            const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT, 40); 

                            return (
                                <div
                                    key={e.id}
                                    className="absolute left-20 right-4 rounded-md border-l-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer z-10 overflow-hidden bg-white border border-gray-200"
                                    style={{ 
                                        top: `${top}px`, 
                                        height: `${height}px`,
                                        borderLeftColor: '#1c9902ff'
                                    }}
                                >
                                    {/* Fond coloré très léger */}
                                    <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-gray-100 to-white pointer-events-none"></div>

                                    <div className="relative p-2 h-full flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-sm text-gray-900 truncate pr-2">
                                                    {e.salle?.nom_salle || "Salle Inconnue"}
                                                </span>
                                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 bg-gray-50 text-gray-600 border-gray-200">
                                                    {e.categorie}
                                                </Badge>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
                                                <Clock size={12} className="text-gray-400" />
                                                <span>
                                                    {start.format("HH:mm")} - {end.format("HH:mm")}
                                                </span>
                                            </div>
                                            
                                            <div className="text-xs text-gray-600 truncate flex items-center gap-1.5">
                                                 <User size={12} className="text-gray-400" />
                                                 {e.nom_client || "Client inconnu"}
                                            </div>
                                        </div>

                                        {/* Afficher plus d'infos si la boîte est assez grande */}
                                        {height > 100 && (
                                            <div className="mt-auto pt-2 border-t border-gray-50 flex justify-between items-end">
                                                <span className="text-[10px] text-gray-400">Agent: {e.agent?.name}</span>
                                                <span className="font-bold text-xs text-gray-900">
                                                    {e.montant?.toLocaleString()} FCFA
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}