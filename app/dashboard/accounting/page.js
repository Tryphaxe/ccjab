"use client";

import React, { useEffect, useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import {
    EqualApproximately,
    Filter,
    HandCoins,
    HousePlus,
    MapPinHouse,
    TrendingUp,
    TrendingDown,
    Calendar,
    CalendarDays,
    CalendarRange,
    Loader
} from 'lucide-react';
import ChartAreaDefault from '@/components/Area';
import TableList from '@/components/Table';
import FiltreBar from '@/components/FiltreBar';
import { fetchEvents } from '@/utils/evenUtils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TopSalles from '@/components/SalleDonut';

// Composant Sélecteur de Période (Style Pillule)
const PeriodSelector = ({ activePeriod, onChange }) => {
    const periods = [
        { id: 'semaine', label: 'Semaine', icon: CalendarRange },
        { id: 'mois', label: 'Mois', icon: CalendarDays },
        { id: 'annee', label: 'Année', icon: Calendar },
    ];

    return (
        <div className="flex items-center p-1 bg-white rounded-lg border border-gray-200 shadow-sm">
            {periods.map((p) => {
                const Icon = p.icon;
                const isActive = activePeriod === p.id;
                return (
                    <button
                        key={p.id}
                        onClick={() => onChange(p.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                            ${isActive
                                ? 'bg-gray-900 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                            }
                        `}
                    >
                        <Icon size={14} />
                        {p.label}
                    </button>
                );
            })}
        </div>
    );
};

export default function FinancePage() {
    const [events, setEvents] = useState([]);
    const [periode, setPeriode] = useState("semaine");
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetchEvents(setEvents, setLoading);
    }, []);

    // --- Calcul des Données du Graphique (Memoized) ---
    const chartData = useMemo(() => {
        const now = new Date();
        let filtered = [];

        if (periode === "semaine") {
            const last7 = Array.from({ length: 7 }).map((_, i) => {
                const day = new Date();
                day.setDate(now.getDate() - (6 - i));
                return day;
            });
            filtered = last7.map((day) => {
                const total = events
                    .filter((e) => {
                        const d = new Date(e.date_debut);
                        return d.getDate() === day.getDate() && d.getMonth() === day.getMonth() && d.getFullYear() === day.getFullYear();
                    })
                    .reduce((acc, e) => acc + (e.montant || 0), 0);
                return { month: day.toLocaleDateString("fr-FR", { weekday: "short" }), desktop: total };
            });
        } else if (periode === "mois") {
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const weeks = [1, 2, 3, 4, 5];
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
        } else if (periode === "annee") {
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
    }, [events, periode]);

    // --- Calcul des Statistiques Dynamiques (Memoized) ---
    const stats = useMemo(() => {
        const now = new Date();
        let startCurrent, endCurrent, startPrev, endPrev;
        let periodLabel;

        // 1. Définition des plages de dates (Actuelle vs Précédente)
        if (periode === "semaine") {
            // Semaine glissante (7 derniers jours)
            endCurrent = new Date(now);
            startCurrent = new Date(now);
            startCurrent.setDate(now.getDate() - 6);
            startCurrent.setHours(0, 0, 0, 0);

            // Période précédente
            endPrev = new Date(startCurrent);
            endPrev.setDate(startCurrent.getDate() - 1);
            endPrev.setHours(23, 59, 59, 999);

            startPrev = new Date(endPrev);
            startPrev.setDate(endPrev.getDate() - 6);
            startPrev.setHours(0, 0, 0, 0);

            periodLabel = "vs 7j préc.";
        } else if (periode === "mois") {
            // Mois civil courant
            startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
            endCurrent = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

            // Mois précédent
            startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endPrev = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

            periodLabel = "vs mois préc.";
        } else {
            // Année civile courante
            startCurrent = new Date(now.getFullYear(), 0, 1);
            endCurrent = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

            // Année précédente
            startPrev = new Date(now.getFullYear() - 1, 0, 1);
            endPrev = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

            periodLabel = "vs année préc.";
        }

        // 2. Filtrage des événements
        const filterEvents = (start, end) => events.filter(e => {
            const d = new Date(e.date_debut);
            return d >= start && d <= end;
        });

        const currentEvents = filterEvents(startCurrent, endCurrent);
        const prevEvents = filterEvents(startPrev, endPrev);

        // 3. Fonctions de calcul
        const sumRevenue = (arr) => arr.reduce((acc, e) => acc + (e.montant || 0), 0);
        const countEvents = (arr) => arr.length;
        const avgRevenue = (arr) => arr.length > 0 ? sumRevenue(arr) / arr.length : 0;

        // 4. Calcul des valeurs actuelles et précédentes
        const currRev = sumRevenue(currentEvents);
        const prevRev = sumRevenue(prevEvents);

        const currCount = countEvents(currentEvents);
        const prevCount = countEvents(prevEvents);

        const currAvg = avgRevenue(currentEvents);
        const prevAvg = avgRevenue(prevEvents);

        // 5. Calcul des pourcentages de tendance
        const calculateTrend = (curr, prev) => {
            if (prev === 0) return curr > 0 ? 100 : 0; // Si 0 avant et >0 maintenant, +100% (ou infini symboliquement)
            return ((curr - prev) / prev) * 100;
        };

        const trendRev = calculateTrend(currRev, prevRev);
        const trendCount = calculateTrend(currCount, prevCount);
        const trendAvg = calculateTrend(currAvg, prevAvg);

        // 6. Salle la plus louée (Période courante)
        const salleCounts = currentEvents.reduce((acc, e) => {
            const name = e.salle?.nom_salle;
            if (name) acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});

        const mostRentedEntry = Object.entries(salleCounts).sort((a, b) => b[1] - a[1])[0];
        const mostRentedSalle = mostRentedEntry ? mostRentedEntry[0] : "Aucune";

        // Tendance Top Salle (comparaison du volume de cette salle avec la période précédente)
        let trendSalle = 0;
        if (mostRentedSalle !== "Aucune") {
            const prevCountSalle = prevEvents.filter(e => e.salle?.nom_salle === mostRentedSalle).length;
            trendSalle = calculateTrend(mostRentedEntry[1], prevCountSalle);
        }

        // Helper pour formater l'affichage
        const formatTrend = (val) => `${val > 0 ? '+' : ''}${val.toFixed(0)}% ${periodLabel}`;
        const getTrendColor = (val) => val >= 0 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-red-700 bg-red-50 border-red-200";
        const getTrendIcon = (val) => val >= 0 ? TrendingUp : TrendingDown;

        return [
            {
                title: "Revenu",
                value: currRev.toLocaleString("fr-FR") + " Fcfa",
                icon: HandCoins,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                trendValue: formatTrend(trendRev),
                trendStyle: getTrendColor(trendRev),
                TrendIcon: getTrendIcon(trendRev)
            },
            {
                title: "Locations",
                value: currCount,
                icon: MapPinHouse,
                color: "text-blue-600",
                bg: "bg-blue-50",
                trendValue: formatTrend(trendCount),
                trendStyle: getTrendColor(trendCount),
                TrendIcon: getTrendIcon(trendCount)
            },
            {
                title: "Panier Moyen",
                value: currAvg.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " Fcfa",
                icon: EqualApproximately,
                color: "text-purple-600",
                bg: "bg-purple-50",
                trendValue: formatTrend(trendAvg),
                trendStyle: getTrendColor(trendAvg),
                TrendIcon: getTrendIcon(trendAvg)
            },
            {
                title: "Top Salle",
                value: mostRentedSalle,
                icon: HousePlus,
                color: "text-orange-600",
                bg: "bg-orange-50",
                trendValue: mostRentedSalle !== "Aucune" ? formatTrend(trendSalle) : "-",
                trendStyle: mostRentedSalle !== "Aucune" ? getTrendColor(trendSalle) : "text-gray-500 bg-gray-50",
                TrendIcon: mostRentedSalle !== "Aucune" ? getTrendIcon(trendSalle) : TrendingUp
            },
        ];
    }, [events, periode]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
                <Loader className='animate-spin w-6 h-6 mb-3 text-green-600' />
                <span className="font-medium text-gray-500">Chargement des données financières...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 text-gray-900 pb-24">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Aperçu Financier</h1>
                        <p className="text-sm text-gray-500 mt-1">Suivez vos revenus et analysez la performance de vos salles.</p>
                    </div>
                    <PeriodSelector activePeriod={periode} onChange={setPeriode} />
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        const TrendIcon = stat.TrendIcon;
                        return (
                            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                        <Icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                    {/* Badge Tendance Dynamique */}
                                    <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${stat.trendStyle}`}>
                                        <TrendIcon size={12} />
                                        {stat.trendValue}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">{stat.title}</h3>
                                    <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Graphique */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ChartAreaDefault data={chartData} />
                    <TopSalles />
                </div>

                {/* Tableau */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-gray-500" />
                        Dernières réservations
                    </h2>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-1">
                        <TableList />
                    </div>
                </div>

                {/* Bouton Filtre Flottant */}
                <Button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-8 right-8 h-10 w-10 cursor-pointer rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 z-50 flex items-center justify-center group"
                >
                    <Filter className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="sr-only">Filtrer</span>
                </Button>

                {/* Dialog Filtres */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
                        <DialogHeader className="p-6 pb-2 border-b border-gray-100 bg-gray-50/50">
                            <DialogTitle className="flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                Filtres avancés
                            </DialogTitle>
                        </DialogHeader>
                        <div className="px-2 overflow-y-auto">
                            <FiltreBar />
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    )
}