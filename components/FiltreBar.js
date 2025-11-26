"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Info, 
    Loader2, 
    CalendarCheck2, 
    Phone, 
    Filter,
    Hash,
    Coins,
    MapPin,
    UserCheck,
    Tag,
    Clock,
    Trophy,
    CalendarDays,
    Loader
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { eventCategories, eventTypesByCategory } from '@/lib/list';
import { fetchEvents } from '@/utils/evenUtils';
import { fetchAgents } from '@/utils/agentUtils';
import { fetchSalles } from '@/utils/salleUtils';
import { formatEventDate, getEventStatus } from '@/lib/evenHelper';
import { useAuth } from '@/lib/AuthContext';

export default function EventsPage() {
    const [isloading, setIsLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [filters, setFilters] = useState({});
    const [agents, setAgents] = useState([]);
    const [salles, setSalles] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([
                fetchEvents(setEvents, () => {}), // On gère le loading globalement
                fetchAgents(setAgents, () => {}),
                fetchSalles(setSalles, () => {})
            ]);
            setIsLoading(false);
        };
        loadData();
    }, [user]);

    const filteredEvents = useMemo(() => {
        return events.filter((e) => {
            const statut = getEventStatus(e.date_debut, e.date_fin);

            if (filters.type && e.type !== filters.type) return false;
            if (filters.categorie && e.categorie !== filters.categorie) return false;
            if (filters.statut && statut !== filters.statut) return false;
            if (filters.agent && e.agent.name !== filters.agent) return false;
            if (filters.date_debut && new Date(e.date_debut) < new Date(filters.date_debut)) return false;
            if (filters.date_fin && new Date(e.date_fin) > new Date(filters.date_fin)) return false;

            return true;
        });
    }, [events, filters]);

    const stats = useMemo(() => {
        if (filteredEvents.length === 0) return null;

        const total = filteredEvents.length;
        const montantTotal = filteredEvents.reduce((sum, e) => sum + (e.montant || 0), 0);

        const dureeTotale = filteredEvents.reduce((sum, e) => {
            const debut = new Date(e.date_debut);
            const fin = new Date(e.date_fin);
            const diff = (fin - debut) / (1000 * 60 * 60); // heures
            return sum + (diff > 0 ? diff : 0);
        }, 0);

        const plusGrosMontant = Math.max(...filteredEvents.map(e => e.montant || 0));

        // Helpers pour trouver le top élément
        const getTopElement = (arr) => {
            if (arr.length === 0) return "-";
            const counts = arr.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {});
            return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
        };

        const salleTop = getTopElement(filteredEvents.map(e => e.salle?.nom_salle));
        const agentTop = getTopElement(filteredEvents.map(e => e.agent?.name));
        const categorieTop = getTopElement(filteredEvents.map(e => e.categorie));
        const montantMoyen = montantTotal / total;

        return [
            { label: "Total Évènements", value: total, icon: Hash, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Revenu Généré", value: `${montantTotal.toLocaleString()} FCFA`, icon: Coins, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Salle Top", value: salleTop, icon: MapPin, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Agent Top", value: agentTop, icon: UserCheck, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Catégorie Top", value: categorieTop, icon: Tag, color: "text-pink-600", bg: "bg-pink-50" },
            { label: "Montant Moyen", value: `${Math.round(montantMoyen).toLocaleString()} FCFA`, icon: Coins, color: "text-cyan-600", bg: "bg-cyan-50" },
            { label: "Heures Louées", value: `${Math.round(dureeTotale)} h`, icon: Clock, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Record (Montant)", value: `${plusGrosMontant.toLocaleString()} FCFA`, icon: Trophy, color: "text-yellow-600", bg: "bg-yellow-50" },
        ];
    }, [filteredEvents]);

    // Petit effet de loading lors du filtrage
    useEffect(() => {
        if (Object.keys(filters).length > 0) {
            setLoading(true);
            const timer = setTimeout(() => setLoading(false), 300);
            return () => clearTimeout(timer);
        }
    }, [filters]);

    const getStatusBadgeStyles = (status) => {
        switch(status) {
            case 'En cours': return 'text-amber-700 bg-amber-100 border-amber-200';
            case 'A venir': return 'text-blue-700 bg-blue-100 border-blue-200';
            default: return 'text-emerald-700 bg-emerald-100 border-emerald-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-2 text-gray-900">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header & Filtres */}
                <div className="bg-white p-2 rounded-xl border border-gray-200 sticky top-0 z-30">                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                        {/* Agent */}
                        <Select value={filters.agent || ""} onValueChange={(value) => setFilters({ ...filters, agent: value })}>
                            <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Agent" />
                            </SelectTrigger>
                            <SelectContent>
                                {agents.map(agent => (
                                    <SelectItem key={agent.id} value={agent.name}>{agent.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Catégorie */}
                        <Select value={filters.categorie || ""} onValueChange={(value) => setFilters({ ...filters, categorie: value, type: "" })}>
                            <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                {eventCategories.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Type */}
                        <Select value={filters.type || ""} onValueChange={(value) => setFilters({ ...filters, type: value })} disabled={!filters.categorie}>
                            <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                                <SelectValue placeholder={filters.categorie ? "Type" : "Type (Choisir Cat.)"} />
                            </SelectTrigger>
                            <SelectContent>
                                {(filters.categorie ? eventTypesByCategory[filters.categorie] || [] : []).map(t => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Statut */}
                        <Select value={filters.statut || ""} onValueChange={(value) => setFilters({ ...filters, statut: value })}>
                            <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="A venir">À venir</SelectItem>
                                <SelectItem value="En cours">En cours</SelectItem>
                                <SelectItem value="Terminé">Terminé</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Dates */}
                        <div className="relative">
                            <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <Input type="date" className="pl-9 bg-gray-50 border-gray-200" value={filters.date_debut || ""} onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })} />
                        </div>
                        <div className="relative">
                            <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <Input type="date" className="pl-9 bg-gray-50 border-gray-200" value={filters.date_fin || ""} onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })} />
                        </div>
                    </div>

                    {Object.keys(filters).length > 0 && (
                        <div className="mt-3 flex justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setFilters({})} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                Réinitialiser les filtres
                            </Button>
                        </div>
                    )}
                </div>

                {/* Statistiques */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {stats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                                        <p className="text-lg font-bold text-gray-900 mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`p-2.5 rounded-full ${stat.bg}`}>
                                        <Icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Liste des Évènements */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[400px]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="font-semibold text-gray-900">Résultats ({filteredEvents.length})</h2>
                    </div>

                    {isloading || loading ? (
                        <div className="flex flex-col items-center justify-center flex-1 py-12">
                            <Loader className='animate-spin w-6 h-6 text-green-600 mb-2' />
                            <span className="text-sm text-gray-500">Chargement...</span>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className='flex flex-col items-center justify-center flex-1 py-12 text-gray-400'>
                            <div className="bg-gray-50 p-4 rounded-full mb-3">
                                <Info className='w-8 h-8 text-gray-400' />
                            </div>
                            <span className="text-gray-600 font-medium">Aucun évènement trouvé</span>
                            <p className="text-sm mt-1">Essayez de modifier vos filtres.</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[600px]">
                            <div>
                                {filteredEvents.map((event) => {
                                    const status = getEventStatus(event.date_debut, event.date_fin);
                                    return (
                                        <div 
                                            key={event.id} 
                                            className="group p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                        >
                                            {/* Colonne 1 : Infos principales */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1.5">
                                                    <span className="text-base font-bold text-gray-900 truncate">
                                                        {event.type}
                                                    </span>
                                                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-semibold border ${getStatusBadgeStyles(status)}`}>
                                                        {status}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="flex items-center text-sm text-gray-500 gap-4 mb-1">
                                                    <span className="flex items-center gap-1.5">
                                                        <CalendarCheck2 size={14} className="text-gray-400" /> 
                                                        <span dangerouslySetInnerHTML={{ __html: formatEventDate(event.date_debut, event.date_fin) }} />
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                                    <span className="font-medium text-gray-700 flex items-center gap-1">
                                                        <MapPin size={12} /> {event.salle.nom_salle}
                                                    </span>
                                                    <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                                                    <span>{event.categorie}</span>
                                                </div>
                                            </div>

                                            {/* Colonne 2 : Client */}
                                            <div className="md:w-1/4 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 mt-2 md:mt-0">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Client</p>
                                                <p className="text-sm font-semibold text-gray-900 truncate">{event.nom_client}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                                    <Phone size={12} /> {event.contact_client}
                                                </p>
                                            </div>

                                            {/* Colonne 3 : Agent & Montant */}
                                            <div className="md:w-1/5 md:text-right flex flex-row md:flex-col justify-between items-center md:items-end pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 mt-2 md:mt-0">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5 hidden md:block">Agent</p>
                                                    <span className="text-sm font-medium text-gray-700">{event.agent.name}</span>
                                                </div>
                                                <div className="md:mt-2">
                                                    <span className="text-sm font-bold text-gray-900 block">
                                                        {(event.montant || 0).toLocaleString()} <span className="text-[10px] text-gray-500 font-normal">FCFA</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </div>
        </div>
    );
}