"use client";

import React, { useEffect, useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress" // Assure-toi d'avoir ce composant ou remplace par une div simple
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
    Loader,
    Wallet,
    AlertCircle,
    Users,
    Tag,
    Trophy
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
import TopSalles from '@/components/SalleDonut';

// --- NOUVEAU COMPOSANT : Leaderboard Agents ---
const AgentLeaderboard = ({ events }) => {
    const agentStats = useMemo(() => {
        const stats = {};
        events.forEach(e => {
            const agentName = e.agent?.name || "Non assigné"; // Adapter selon ta structure (e.agent.nom ou e.agent.name)
            if (!stats[agentName]) stats[agentName] = { name: agentName, total: 0, count: 0 };
            stats[agentName].total += (e.montant || 0);
            stats[agentName].count += 1;
        });
        return Object.values(stats).sort((a, b) => b.total - a.total).slice(0, 5); // Top 5
    }, [events]);

    const maxVal = agentStats[0]?.total || 1;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Top Agents
            </h3>
            <div className="space-y-5">
                {agentStats.map((agent, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700 flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {index + 1}
                                </div>
                                {agent.name}
                            </span>
                            <span className="font-bold text-gray-900">{agent.total.toLocaleString()} F</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                                style={{ width: `${(agent.total / maxVal) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 text-right">{agent.count} ventes</p>
                    </div>
                ))}
                {agentStats.length === 0 && <p className="text-sm text-gray-500 italic">Aucune donnée agent.</p>}
            </div>
        </div>
    );
};

// --- NOUVEAU COMPOSANT : Répartition par Catégorie ---
const CategoryBreakdown = ({ events }) => {
    const catStats = useMemo(() => {
        const stats = {};
        let totalGlobal = 0;
        events.forEach(e => {
            const cat = e.categorie || "Autre";
            if (!stats[cat]) stats[cat] = 0;
            stats[cat] += (e.montant || 0);
            totalGlobal += (e.montant || 0);
        });
        
        return Object.entries(stats)
            .sort(([, a], [, b]) => b - a)
            .map(([name, value]) => ({
                name,
                value,
                percent: totalGlobal > 0 ? (value / totalGlobal) * 100 : 0
            }));
    }, [events]);

    const colors = ["bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-gray-500"];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-500" />
                Revenus par Catégorie
            </h3>
            <div className="space-y-4">
                {catStats.map((cat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-50 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                            <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{cat.value.toLocaleString()} F</p>
                            <p className="text-xs text-gray-500">{cat.percent.toFixed(1)}%</p>
                        </div>
                    </div>
                ))}
                {catStats.length === 0 && <p className="text-sm text-gray-500 italic">Aucune catégorie.</p>}
            </div>
        </div>
    );
};

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
    const [periode, setPeriode] = useState("mois"); // Changé par défaut à "mois" pour plus de pertinence
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetchEvents(setEvents, setLoading);
    }, []);

    // --- Calcul des Données du Graphique ---
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

    // --- Calcul des Statistiques KPI ---
    const stats = useMemo(() => {
        const now = new Date();
        let startCurrent, endCurrent;
        let periodLabel;

        // Définition simple des plages pour les KPIs
        if (periode === "semaine") {
            endCurrent = new Date(now);
            startCurrent = new Date(now);
            startCurrent.setDate(now.getDate() - 6);
            periodLabel = "vs 7j préc.";
        } else if (periode === "mois") {
            startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
            endCurrent = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            periodLabel = "vs mois préc.";
        } else {
            startCurrent = new Date(now.getFullYear(), 0, 1);
            endCurrent = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            periodLabel = "vs année préc.";
        }

        const currentEvents = events.filter(e => {
            const d = new Date(e.date_debut);
            return d >= startCurrent && d <= endCurrent;
        });

        // Calculs
        const currRev = currentEvents.reduce((acc, e) => acc + (e.montant || 0), 0);
        
        // Reste à percevoir (Montant - Avance)
        const resteAPercevoir = currentEvents.reduce((acc, e) => {
            const montant = e.montant || 0;
            const avance = e.avance || 0;
            return acc + (montant - avance);
        }, 0);

        // Taux d'annulation
        const totalEventsCount = currentEvents.length;

        return [
            {
                title: "Chiffre d'Affaires",
                value: currRev.toLocaleString("fr-FR") + " F",
                icon: HandCoins,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                trendValue: "Total Facturé", // Simplifié
                trendStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
                TrendIcon: TrendingUp
            },
            {
                title: "Reste à Percevoir",
                value: resteAPercevoir.toLocaleString("fr-FR") + " F",
                icon: Wallet,
                color: "text-amber-600",
                bg: "bg-amber-50",
                trendValue: "Trésorerie latente",
                trendStyle: "text-amber-700 bg-amber-50 border-amber-200",
                TrendIcon: AlertCircle
            },
            {
                title: "Nombre d'Évènements",
                value: totalEventsCount,
                icon: MapPinHouse,
                color: "text-blue-600",
                bg: "bg-blue-50",
                trendValue: periodLabel,
                trendStyle: "text-blue-700 bg-blue-50 border-blue-200",
                TrendIcon: Users
            },
        ];
    }, [events, periode]);

    // Filtrage pour les sous-composants (Graphiques, Agents, etc)
    const filteredEventsForComponents = useMemo(() => {
        // On réapplique la logique de date pour passer les bons événements aux composants enfants
        const now = new Date();
        let start, end;
        if (periode === "semaine") {
            start = new Date(now); start.setDate(now.getDate() - 6);
        } else if (periode === "mois") {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
        } else {
            start = new Date(now.getFullYear(), 0, 1);
        }
        return events.filter(e => new Date(e.date_debut) >= start);
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
                        <p className="text-sm text-gray-500 mt-1">Suivez vos revenus, créances et performances commerciales.</p>
                    </div>
                    <PeriodSelector activePeriod={periode} onChange={setPeriode} />
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        const TrendIcon = stat.TrendIcon;
                        return (
                            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                        <Icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
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

                {/* Section Graphiques Principaux */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Graphique de revenu (prend 2 colonnes) */}
                    <div className="lg:col-span-1">
                         <ChartAreaDefault data={chartData} />
                    </div>
                    {/* Top Salles (prend 1 colonne) */}
                    <div className="lg:col-span-1">
                        <TopSalles events={filteredEventsForComponents} />
                    </div>
                </div>

                {/* Nouvelle Section : Analyse Détaillée (Agents & Catégories) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AgentLeaderboard events={filteredEventsForComponents} />
                    <CategoryBreakdown events={filteredEventsForComponents} />
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