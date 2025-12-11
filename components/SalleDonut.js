"use client"

import React, { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"

// Palette de couleurs
const COLORS = [
    "#7c3aed", "#3b82f6", "#d946ef", "#10b981",
    "#f59e0b", "#f43f5e", "#06b6d4", "#8b5cf6"
]

export function SalleDonut({ data }) {
    // Sécurité : Si pas de données, on n'affiche rien ou un message
    if (!data || data.length === 0) {
        return <div className="text-center p-4 text-gray-500">Aucune donnée disponible.</div>;
    }

    const chartData = data.map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length],
    }))

    return (
        <Card className="w-full shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-green-900">
                    Salles les plus utilisées
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* LÉGENDE */}
                    <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
                        {chartData.map((salle, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="p-2 rounded-md bg-opacity-20" style={{ backgroundColor: `${salle.color}20` }}>
                                    <Building2 size={18} style={{ color: salle.color }} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-700">{salle.name}</span>
                                    <span className="text-xs font-bold text-gray-900">
                                        {salle.percentage}% <span className="text-gray-400 font-normal">({salle.count})</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* GRAPHIQUE */}
                    <div className="w-full md:w-1/2 h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={80}
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
        </Card>
    )
}

// ⚠️ CORRECTION ICI : Enlever 'async' devant function
export default function TopSalles() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true) // ⚠️ CORRECTION ICI : Décommenté
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchData() {
            try {
                // Assure-toi que ton fichier route est bien dans app/api/topsalle/route.js
                const response = await fetch('/api/topsalle')

                if (!response.ok) {
                    throw new Error('Erreur réseau')
                }

                const result = await response.json()
                setData(result)
            } catch (err) {
                console.error(err)
                setError("Impossible de charger les statistiques.")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <div>
            {/* Gestion de l'affichage (Loading / Erreur / Données) */}
            {loading ? (
                <div className="text-gray-500 animate-pulse">Chargement des données...</div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <SalleDonut data={data} />
            )}
        </div>
    )
}