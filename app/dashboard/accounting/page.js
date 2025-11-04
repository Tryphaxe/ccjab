"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { EqualApproximately, HandCoins, HousePlus, MapPinHouse } from 'lucide-react';
import ChartAreaDefault from '@/components/Area';
import TableList from '@/components/Table';
import { fetchEvents } from '@/utils/evenUtils';

export default function page() {
    const [events, setEvents] = useState([]);
    const [periode, setPeriode] = useState("semaine"); // semaine | mois | annee
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents(setEvents, setLoading);
    }, []);

    // Helper pour regrouper les events par jour/semaine/mois
    const getChartData = (events, periode) => {
        const now = new Date();
        let filtered = [];

        if (periode === "semaine") {
            // 7 derniers jours
            const last7 = Array.from({ length: 7 }).map((_, i) => {
                const day = new Date();
                day.setDate(now.getDate() - (6 - i));
                return day;
            });

            filtered = last7.map((day) => {
                const total = events
                    .filter((e) => {
                        const d = new Date(e.date_debut);
                        return (
                            d.getDate() === day.getDate() &&
                            d.getMonth() === day.getMonth() &&
                            d.getFullYear() === day.getFullYear()
                        );
                    })
                    .reduce((acc, e) => acc + (e.montant || 0), 0);

                return { month: day.toLocaleDateString("fr-FR", { weekday: "short" }), desktop: total };
            });
        }

        if (periode === "mois") {
            // Regrouper par semaine (S1, S2...) du mois courant
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const weeks = [1, 2, 3, 4];
            filtered = weeks.map((week) => {
                const total = events
                    .filter((e) => {
                        const d = new Date(e.date_debut);
                        const weekOfMonth = Math.ceil(d.getDate() / 7);
                        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && weekOfMonth === week;
                    })
                    .reduce((acc, e) => acc + (e.montant || 0), 0);
                return { month: "S" + week, desktop: total };
            });
        }

        if (periode === "annee") {
            // Regrouper par mois de l'année
            filtered = Array.from({ length: 12 }).map((_, i) => {
                const total = events
                    .filter((e) => {
                        const d = new Date(e.date_debut);
                        return d.getMonth() === i && d.getFullYear() === now.getFullYear();
                    })
                    .reduce((acc, e) => acc + (e.montant || 0), 0);
                return { month: new Date(0, i).toLocaleString("fr-FR", { month: "short" }), desktop: total };
            });
        }

        return filtered;
    };

    const chartData = getChartData(events, periode);

    const salleCounts = events
        .map(e => e.salle?.nom_salle)
        .reduce((acc, curr) => {
            if (curr) acc[curr] = (acc[curr] || 0) + 1;
            return acc;
        }, {});

    const mostRentedSalle = Object.keys(salleCounts).length > 0
        ? Object.entries(salleCounts).sort((a, b) => b[1] - a[1])[0][0] // la salle avec le plus grand nombre
        : "N/A";

    const stats = [
        {
            title: "Revenu total",
            value: (events.reduce((acc, e) => acc + (e.montant || 0), 0)).toLocaleString("fr-FR") + " Fcfa",
            icon: HandCoins,
            bgColor: "bg-green-50",
            textColor: "text-green-700",
        },
        {
            title: "Nombre de locations",
            value: events.length,
            icon: MapPinHouse,
            bgColor: "bg-orange-50",
            textColor: "text-orange-700",
        },
        {
            title: "Location moyenne",
            value: events.length > 0
                ? (events.reduce((acc, e) => acc + (e.montant || 0), 0) / events.length)
                    .toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " Fcfa"
                : "0,00 Fcfa",
            icon: EqualApproximately,
            bgColor: "bg-purple-50",
            textColor: "text-purple-700",
        },
        {
            title: "Salle la plus louée",
            value: mostRentedSalle,
            icon: HousePlus,
            bgColor: "bg-blue-50",
            textColor: "text-blue-700",
        },
    ];


    return (
        <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                <h1 className="text-xl font-medium text-gray-900">Aperçu financier</h1>
                <div className="flex flex-col items-start gap-8">
                    <ButtonGroup>
                        <Button variant={periode === "semaine" ? "default" : "outline"} onClick={() => setPeriode("semaine")}>Semaine</Button>
                        <Button variant={periode === "mois" ? "default" : "outline"} onClick={() => setPeriode("mois")}>Mois</Button>
                        <Button variant={periode === "annee" ? "default" : "outline"} onClick={() => setPeriode("annee")}>Année</Button>
                    </ButtonGroup>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <ChartAreaDefault data={chartData} />

            <h1 className="text-xl font-medium text-gray-900 mt-5">Réservations récentes</h1>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mt-3">
                <TableList />
            </div>

        </div>
    )
}
