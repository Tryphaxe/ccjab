"use client";

import React, { useEffect, useState } from 'react';
import { FileText, Megaphone, Plus, TrendingUp, Loader, Eye, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dash() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, actus: 0, pubs: 0 });
    const [recentPosts, setRecentPosts] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch('/api/post');
                const data = await res.json();

                if (res.ok) {
                    setStats({
                        total: data.length,
                        actus: data.filter(p => p.type === 'ACTU').length,
                        pubs: data.filter(p => p.type === 'PUB').length
                    });
                    setRecentPosts(data.slice(0, 3));
                }
            } catch (error) {
                console.error("Erreur", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const statCards = [
        { title: 'Total Publications', value: stats.total, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Actualités', value: stats.actus, icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Publicités', value: stats.pubs, icon: Megaphone, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader className="animate-spin" /></div>;

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Espace Éditeur</h1>
                    <p className="text-gray-500">Gérez les contenus du site web.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white p-5 rounded-xl border flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-500">{stat.title}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bg}`}><Icon className={`w-5 h-5 ${stat.color}`} /></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}