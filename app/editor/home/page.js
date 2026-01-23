"use client";

import React, { useEffect, useState } from 'react';
import { FileText, Megaphone, Plus, TrendingUp, Loader, Eye, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function RedacteurHomePage() {
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
        <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Espace Éditeur</h1>
                    <p className="text-gray-500">Gérez les contenus du site web.</p>
                </div>
                <Link href="/editor/posts">
                    <Button className="bg-black text-white"><Plus className="mr-2 h-4 w-4" /> Nouveau</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white p-5 rounded-xl border flex justify-between items-center shadow-sm">
                            <div>
                                <p className="text-sm text-gray-500">{stat.title}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bg}`}><Icon className={`w-5 h-5 ${stat.color}`} /></div>
                        </div>
                    );
                })}
            </div>

            <h2 className="text-lg font-semibold">Récemment ajouté</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                        <div className="h-32 w-full bg-gray-100 relative">
                            {post.mediaUrl ? (
                                <img src={post.mediaUrl} alt={post.titre} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    {post.type === 'PUB' ? <Megaphone /> : <FileText />}
                                </div>
                            )}
                            <Badge className={`absolute top-2 right-2 ${post.type === 'PUB' ? 'bg-purple-500' : 'bg-green-500'}`}>
                                {post.type === 'PUB' ? 'PUB' : 'ACTU'}
                            </Badge>
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-bold truncate">{post.titre}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">{post.contenu}</p>
                            <div className="flex justify-between mt-3 text-xs text-gray-400">
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                {post.isPromoted && <span className="text-amber-600 flex items-center gap-1"><Eye size={12} /> Promu</span>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}