"use client";

import React, { useEffect, useState } from 'react'
import { Calendar, AlertCircle, PartyPopper, Clock4, ClockAlert, Clock12, Plus, Share } from 'lucide-react';
import CalendarView from '@/components/CalendarView';
import { fetchEvents } from '@/utils/evenUtils';

import { getEventStatus } from '@/lib/evenHelper';

export default function page() {
    const [isloading, setIsLoading] = useState(true)
    const [events, setEvents] = useState([]);

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

    const stats = [
        {
            title: 'Total Evènements',
            value: 15,
            icon: PartyPopper,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-700'
        },
        {
            title: 'Prévus',
            value: 15,
            icon: ClockAlert,
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-700'
        },
        {
            title: 'En cours',
            value: 15,
            icon: Clock4,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-700'
        },
        {
            title: 'Terminé',
            value: 15,
            icon: Clock12,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700'
        }
    ];

    return (
        <div>
            <div className="bg-gray-100 border-2 border-gray-200 rounded-xl p-6 text-black mb-3">
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

            <CalendarView
                events={formattedEvents}
            />


        </div>
    )
}
