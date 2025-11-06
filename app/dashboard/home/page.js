"use client";

import React, { useEffect, useState } from 'react'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Calendar, AlertCircle, PartyPopper, Clock4, ClockAlert, Clock12, Plus, Share } from 'lucide-react';
import CalendarView from '@/components/CalendarView';
import { fetchEvents } from '@/utils/evenUtils';

import { getEventStatus } from '@/lib/evenHelper';
import DayCalendar from '@/components/DayCalendar';

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

    const nbreven = events.length
    const nbrevenprevus = events.filter(e => getEventStatus(e.date_debut, e.date_fin) === 'A venir').length
    const nbrevenencours = events.filter(e => getEventStatus(e.date_debut, e.date_fin) === 'En cours').length
    const nbreventermines = events.filter(e => getEventStatus(e.date_debut, e.date_fin) === 'Terminé').length

    const stats = [
        {
            title: 'Total Evènements',
            value: nbreven,
            icon: PartyPopper,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-700'
        },
        {
            title: 'Prévus',
            value: nbrevenprevus,
            icon: ClockAlert,
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-700'
        },
        {
            title: 'En cours',
            value: nbrevenencours,
            icon: Clock4,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-700'
        },
        {
            title: 'Terminé',
            value: nbreventermines,
            icon: Clock12,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700'
        }
    ];

    return (
        <div>
            <div className="bg-white border-1 border-gray-200 rounded-xl p-6 text-black mb-3">
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

            <div className="flex w-full flex-col gap-6">
                <Tabs defaultValue="jour">
                    <TabsList>
                        <TabsTrigger value="jour">Jour</TabsTrigger>
                        <TabsTrigger value="mois">Mois</TabsTrigger>
                    </TabsList>
                    <TabsContent value="jour">
                        <Card>
                            <CardHeader>
                                <CardTitle>Evènements jounaliers</CardTitle>
                                <CardDescription>
                                    Make changes to your account here. Click save when you&apos;re
                                    done.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <DayCalendar events={events} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="mois">
                        <Card>
                            <CardHeader>
                                <CardTitle>Evènements mensuels</CardTitle>
                                <CardDescription>
                                    Change your password here. After saving, you&apos;ll be logged
                                    out.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <CalendarView events={formattedEvents} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>




            <div>

            </div>




        </div>
    )
}
