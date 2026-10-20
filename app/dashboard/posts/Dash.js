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
        { title: 'Total Publications', value: stats.total, icon: TrendingUp, color: 'text-[#a93105]', bg: 'bg-[#fae9e3]' },
        { title: 'Actualités', value: stats.actus, icon: FileText, color: 'text-[#446554]', bg: 'bg-[#e2f1e8]' },
        { title: 'Publicités', value: stats.pubs, icon: Megaphone, color: 'text-[#7b5500]', bg: 'bg-[#ffeed1]' },
    ];

    if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader className="animate-spin" /></div>;

    return (
        <section aria-label="Indicateurs des publications" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="flex items-center justify-between rounded-2xl border border-[#eee8eb] bg-white p-5 shadow-[0_2px_12px_rgba(42,24,30,0.035)]">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#765f58]">{stat.title}</p>
                                <p className="mt-2 font-[Georgia] text-3xl font-semibold text-[#1b1b1d]">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bg}`}><Icon className={`w-5 h-5 ${stat.color}`} /></div>
                        </div>
                    );
                })}
        </section>
    );
}
