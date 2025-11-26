"use client";

import React, { useEffect, useState } from "react";
import { startOfWeek, endOfWeek, addWeeks, format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { 
    ChevronLeft, 
    ChevronRight, 
    CalendarRange, 
    MapPin, 
    User, 
    Banknote, 
    Clock, 
    Loader2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function WeeksEvents() {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadEvents = async (date) => {
        setIsLoading(true);
        const start = startOfWeek(date, { weekStartsOn: 1 });
        const end = endOfWeek(date, { weekStartsOn: 1 });

        try {
            const res = await fetch(
                `/api/even/weeks?start=${start.toISOString()}&end=${end.toISOString()}`
            );
            const data = await res.json();
            setEvents(data);
        } catch (error) {
            console.error("Erreur chargement events:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadEvents(currentWeek);
    }, [currentWeek]);

    const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
    const previousWeek = () => setCurrentWeek(addWeeks(currentWeek, -1));

    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });

    return (
        <div className="flex flex-col h-full">
            {/* --- En-tête de navigation --- */}
            <div className="flex items-center justify-between mb-6 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={previousWeek}
                    className="hover:bg-gray-100 text-gray-600"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-2">
                    <div className="bg-orange-50 p-2 rounded-lg">
                        <CalendarRange className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Semaine du</p>
                        <h2 className="text-sm sm:text-base font-bold text-gray-900">
                            {format(start, "d MMM", { locale: fr })} - {format(end, "d MMM yyyy", { locale: fr })}
                        </h2>
                    </div>
                </div>

                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={nextWeek}
                    className="hover:bg-gray-100 text-gray-600"
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>

            {/* --- Liste des événements --- */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Loader2 className='animate-spin w-8 h-8 mb-2 text-orange-600' />
                        <span className="text-sm">Chargement du planning...</span>
                    </div>
                ) : events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                        <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                            <CalendarRange className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Aucun évènement prévu cette semaine</p>
                    </div>
                ) : (
                    events.map((even) => (
                        <div
                            key={even.id}
                            className="group bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-orange-200 relative overflow-hidden"
                        >
                            {/* Bandeau latéral de couleur selon statut (optionnel, ici bleu par défaut) */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 group-hover:bg-orange-600 transition-colors"></div>

                            <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between pl-3">
                                
                                {/* Colonne Gauche : Date & Titre */}
                                <div className="space-y-3 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-100">
                                            {even.categorie}
                                        </Badge>
                                        <Badge variant="secondary" className="text-gray-600 bg-gray-100">
                                            {even.type}
                                        </Badge>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-700 transition-colors">
                                            {even.salle?.nom_salle || "Lieu non spécifié"}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <Clock className="w-4 h-4" />
                                            <span className="capitalize">
                                                {format(new Date(even.date_debut), "EEEE d MMMM", { locale: fr })} 
                                                <span className="mx-1">•</span> 
                                                {format(new Date(even.date_debut), "HH:mm")} - {format(new Date(even.date_fin), "HH:mm")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Infos Client & Agent */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                        <div className="flex items-start gap-2 text-sm">
                                            <User className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-gray-500 text-xs uppercase font-semibold">Client</p>
                                                <p className="text-gray-900 font-medium">{even.nom_client || "—"}</p>
                                                <p className="text-gray-500 text-xs">{even.contact_client}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm">
                                            <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
                                                <span className="text-[10px] font-bold text-gray-600">A</span>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs uppercase font-semibold">Agent</p>
                                                <p className="text-gray-900 font-medium">{even.agent?.name || "—"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Colonne Droite : Finances */}
                                <div className="sm:text-right flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-1 sm:border-l sm:border-gray-100 sm:pl-5 sm:min-w-[140px]">
                                    <div className="flex flex-col items-start sm:items-end">
                                        <span className="text-xs text-gray-500 font-medium mb-0.5 flex items-center gap-1">
                                            <Banknote className="w-3 h-3" /> Total
                                        </span>
                                        <span className="text-lg font-bold text-gray-900">
                                            {(even.montant ?? 0).toLocaleString('fr-FR')} <span className="text-xs font-normal text-gray-500">FCFA</span>
                                        </span>
                                    </div>

                                    <Separator className="hidden sm:block my-2 w-full" />
                                    
                                    {/* Séparateur mobile */}
                                    <div className="h-8 w-px bg-gray-200 sm:hidden mx-2"></div>

                                    <div className="flex flex-col items-start sm:items-end">
                                        <span className="text-xs text-gray-500 font-medium mb-0.5">Avance</span>
                                        <span className={`text-sm font-bold ${(even.avance ?? 0) > 0 ? "text-emerald-600" : "text-gray-400"}`}>
                                            {(even.avance ?? 0).toLocaleString('fr-FR')} FCFA
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}