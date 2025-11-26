"use client";

import React, { useEffect, useState, useMemo } from 'react'
import { PartyPopper, Clock4, ClockAlert, Clock12, CalendarDays, CalendarRange, Calendar, Loader } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import CalendarView from '@/components/CalendarView';
import DayCalendar from '@/components/DayCalendar';
import WeeksEvents from '@/components/WeeksEvents';
import { fetchEvents } from '@/utils/evenUtils';
import { getEventStatus } from '@/lib/evenHelper';

// Composant de sélecteur de vue personnalisé (Style Segmented Control)
const ViewToggle = ({ activeView, onChange }) => {
    const views = [
        { id: 'jour', label: 'Jour', icon: Calendar },
        { id: 'semaine', label: 'Semaine', icon: CalendarRange },
        { id: 'mois', label: 'Mois', icon: CalendarDays },
    ];

    return (
        <div className="flex items-center p-1 bg-gray-100/80 rounded-lg border border-gray-200">
            {views.map((view) => {
                const Icon = view.icon;
                const isActive = activeView === view.id;
                return (
                    <button
                        key={view.id}
                        onClick={() => onChange(view.id)}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                            ${isActive 
                                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                            }
                        `}
                    >
                        <Icon size={14} className={isActive ? "text-blue-600" : ""} />
                        {view.label}
                    </button>
                );
            })}
        </div>
    );
};

export default function Page() {
    const [isloading, setIsLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [activeView, setActiveView] = useState("mois"); // Défaut sur Mois souvent plus pertinent

    useEffect(() => {
        fetchEvents(setEvents, setIsLoading);
    }, []);

    // Utilisation de useMemo pour éviter de recalculer à chaque rendu
    const formattedEvents = useMemo(() => events.map((e) => ({
        id: e.id,
        nom_salle: e.salle.nom_salle,
        agent: { nom: e.agent.name },
        type_evenement: e.type,
        categorie: e.categorie,
        statut: getEventStatus(e.date_debut, e.date_fin),
        date_debut: e.date_debut,
        date_fin: e.date_fin,
        montant: e.montant
    })), [events]);

    const nbreven = events.length;
    const nbrevenprevus = events.filter(e => getEventStatus(e.date_debut, e.date_fin) === 'A venir').length;
    const nbrevenencours = events.filter(e => getEventStatus(e.date_debut, e.date_fin) === 'En cours').length;
    const nbreventermines = events.filter(e => getEventStatus(e.date_debut, e.date_fin) === 'Terminé').length;

    const stats = [
        { title: 'Total Évènements', value: nbreven, icon: PartyPopper, color: 'text-gray-600', bg: 'bg-gray-100' },
        { title: 'À venir', value: nbrevenprevus, icon: ClockAlert, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'En cours', value: nbrevenencours, icon: Clock4, color: 'text-amber-600', bg: 'bg-amber-50' },
        { title: 'Terminés', value: nbreventermines, icon: Clock12, color: 'text-emerald-600', bg: 'bg-emerald-50' }
    ];

    if (isloading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
                <Loader className='animate-spin w-6 h-6 mb-3 text-green-600' />
                <span className="font-medium text-gray-500">Chargement du tableau de bord...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 text-gray-900">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tableau de bord</h1>
                    <p className="text-sm text-gray-500 mt-1">Vue d'ensemble et planification des évènements.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`w-10 h-10 ${stat.bg} rounded-full flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Section Calendrier */}
                <div className="space-y-4">
                    {/* Barre de contrôle */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            Planning
                            <span className="text-xs font-normal text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                                {activeView === 'jour' ? "Journalier" : activeView === 'semaine' ? "Hebdomadaire" : "Mensuel"}
                            </span>
                        </h2>
                        <ViewToggle activeView={activeView} onChange={setActiveView} />
                    </div>

                    {/* Contenu conditionnel */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
                        {activeView === "jour" && (
                            <div className="p-4 md:p-6 animate-in fade-in duration-300">
                                <DayCalendar events={events} />
                            </div>
                        )}
                        
                        {activeView === "semaine" && (
                            <div className="p-4 md:p-6 animate-in fade-in duration-300">
                                <WeeksEvents />
                            </div>
                        )}

                        {activeView === "mois" && (
                            <div className="p-4 md:p-6 animate-in fade-in duration-300">
                                <CalendarView events={formattedEvents} />
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}