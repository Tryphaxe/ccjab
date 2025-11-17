"use client";

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { PartyPopper, Clock4, ClockAlert, Clock12 } from 'lucide-react';
import CalendarView from '@/components/CalendarView';
import { fetchEvents } from '@/utils/evenUtils';
import { getEventStatus } from '@/lib/evenHelper';
import DayCalendar from '@/components/DayCalendar';
import { ButtonGroup } from '@/components/ui/button-group';
import WeeksEvents from '@/components/WeeksEvents';

// 👉 Création du composant ButtonGroup simple
function BtGroup({ activeView, onChange }) {
    return (
        <ButtonGroup>
            <Button
                variant={activeView === "jour" ? "default" : "outline"}
                onClick={() => onChange("jour")}
            >
                Jour
            </Button>
            <Button
                variant={activeView === "semaine" ? "default" : "outline"}
                onClick={() => onChange("semaine")}
            >
                Semaine
            </Button>
            <Button
                variant={activeView === "mois" ? "default" : "outline"}
                onClick={() => onChange("mois")}
            >
                Mois
            </Button>
        </ButtonGroup>
    );
}

export default function Page() {
    const [isloading, setIsLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [activeView, setActiveView] = useState("jour");

    useEffect(() => {
        fetchEvents(setEvents, setIsLoading);
    }, []);

    const formattedEvents = events.map((e) => ({
        id: e.id,
        nom_salle: e.salle.nom_salle,
        agent: { nom: e.agent.name },
        type_evenement: e.type,
        categorie: e.categorie,
        statut: getEventStatus(e.date_debut, e.date_fin),
        date_debut: e.date_debut,
        date_fin: e.date_fin,
        montant: e.montant
    }));

    const nbreven = events.length;
    const nbrevenprevus = events.filter(e => getEventStatus(e.date_debut, e.date_fin) === 'A venir').length;
    const nbrevenencours = events.filter(e => getEventStatus(e.date_debut, e.date_fin) === 'En cours').length;
    const nbreventermines = events.filter(e => getEventStatus(e.date_debut, e.date_fin) === 'Terminé').length;

    const stats = [
        { title: 'Total Evènements', value: nbreven, icon: PartyPopper, textColor: 'text-green-700', bgColor: 'bg-green-50' },
        { title: 'Prévus', value: nbrevenprevus, icon: ClockAlert, textColor: 'text-orange-700', bgColor: 'bg-orange-50' },
        { title: 'En cours', value: nbrevenencours, icon: Clock4, textColor: 'text-purple-700', bgColor: 'bg-purple-50' },
        { title: 'Terminé', value: nbreventermines, icon: Clock12, textColor: 'text-blue-700', bgColor: 'bg-blue-50' }
    ];

    return (
        <div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-black mb-3">
                <h1 className="text-2xl font-bold mb-2">Tableau de bord administrateur</h1>
                <p className="text-gray-700">Vue d&apos;ensemble de la gestion des évènements</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col gap-6">
                {/* 👉 Boutons à la place des Tabs */}
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Vue des évènements</h2>
                    <BtGroup activeView={activeView} onChange={setActiveView} />
                </div>

                {/* 🗓️ Contenu selon la vue choisie */}
                {activeView === "jour" ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Évènements journaliers</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <DayCalendar events={events} />
                        </CardContent>
                    </Card>
                ) : activeView === "semaine" ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Évènements de la semaine</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <WeeksEvents />
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Évènements mensuels</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <CalendarView events={formattedEvents} />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}