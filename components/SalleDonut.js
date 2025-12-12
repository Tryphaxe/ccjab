"use client"

import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, TrendingUp } from "lucide-react"

// Palette de couleurs
const COLORS = [
    "#7c3aed", "#3b82f6", "#ef8146ff", "#10b981",
    "#f59e0b", "#f43f5e", "#06b6d4", "#8b5cf6"
]

export function SalleDonut({ data }) {
    if (!data || data.length === 0) {
        return (
            <Card className="w-full shadow-sm h-full flex items-center justify-center p-6">
                <div className="text-gray-500 text-sm">Aucune donnée sur cette période.</div>
            </Card>
        );
    }

    const chartData = data.map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length],
    }))

    return (
        <Card className="w-full shadow-sm h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-green-900">
                    Salles les plus utilisées
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex flex-col md:flex-row items-center gap-8 h-full">
                    {/* LÉGENDE */}
                    <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                        {chartData.map((salle, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <div className="p-2 rounded-md bg-opacity-20 shrink-0" style={{ backgroundColor: `${salle.color}20` }}>
                                    <Building2 size={16} style={{ color: salle.color }} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium text-gray-700 truncate" title={salle.name}>{salle.name}</span>
                                    <span className="text-xs font-bold text-gray-900">
                                        {salle.percentage}% <span className="text-gray-400 font-normal">({salle.count})</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* GRAPHIQUE */}
                    <div className="w-full md:w-1/2 h-[200px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%" cy="50%"
                                    innerRadius={55} outerRadius={75}
                                    paddingAngle={5}
                                    dataKey="count"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`${value} événements`, 'Volume']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-0">
                <div className="flex items-center gap-2 text-xs text-gray-400 w-full justify-center md:justify-start">
                    <TrendingUp className="w-3 h-3" /> Basé sur la période sélectionnée
                </div>
            </CardFooter>
        </Card>
    )
}

// Ce composant reçoit maintenant les événements filtrés depuis le parent
export default function TopSalles({ events = [] }) {
    
    // Calcul dynamique basé sur les props 'events'
    const data = useMemo(() => {
        if (!events || events.length === 0) return [];

        // 1. Compter les occurrences par salle
        const stats = {};
        events.forEach(e => {
            // On gère les différents formats possibles (relation ou champ direct)
            const nomSalle = e.salle?.nom_salle || e.nom_salle || "Salle inconnue";
            
            if (!stats[nomSalle]) {
                stats[nomSalle] = 0;
            }
            stats[nomSalle] += 1;
        });

        const total = events.length;

        // 2. Transformer en tableau, trier et prendre le top 8
        return Object.entries(stats)
            .map(([name, count]) => ({
                name,
                count,
                percentage: total > 0 ? Math.round((count / total) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

    }, [events]); // Recalcule uniquement si 'events' change

    return (
        <div className="h-full">
            <SalleDonut data={data} />
        </div>
    )
}