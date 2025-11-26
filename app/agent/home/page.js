"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Info, 
    Loader, 
    CalendarCheck2, 
    Phone, 
    Filter,
    Calendar as CalendarIcon,
    ListFilter,
    MapPin,
    User,
    Clock,
    Wallet
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CalendarView from '@/components/CalendarView';
import { eventCategories, eventTypesByCategory } from '@/lib/list';
import { fetchEventsAgent } from '@/utils/evenAgentUtils';
import { fetchSalles } from '@/utils/salleUtils';
import { formatEventDate, getEventStatus } from '@/lib/evenHelper';
import { useAuth } from '@/lib/AuthContext';

export default function AgentDashboard() {
    const [isloading, setIsLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [filters, setFilters] = useState({});
    const [salles, setSalles] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const loadData = async () => {
            if (user !== undefined) setLoading(false);
            if (user?.id) {
                setIsLoading(true);
                await Promise.all([
                    fetchEventsAgent(user.id, setEvents, () => {}),
                    fetchSalles(setSalles, () => {})
                ]);
                setIsLoading(false);
            }
        };
        loadData();
    }, [user]);

    // Formatage pour le CalendarView
    const formattedEvents = useMemo(() => events.map((e) => ({
        id: e.id,
        nom_salle: e.salle?.nom_salle,
        agent: { nom: e.agent?.name },
        type_evenement: e.type,
        categorie: e.categorie,
        statut: getEventStatus(e.date_debut, e.date_fin),
        date_debut: e.date_debut,
        date_fin: e.date_fin,
        montant: e.montant,
        description: e.description
    })), [events]);

    // Filtrage pour la liste
    const filteredEvents = useMemo(() => {
        return events.filter((e) => {
            const statut = getEventStatus(e.date_debut, e.date_fin);

            if (filters.type && e.type !== filters.type) return false;
            if (filters.categorie && e.categorie !== filters.categorie) return false;
            if (filters.statut && statut !== filters.statut) return false;
            if (filters.date_debut && new Date(e.date_debut) < new Date(filters.date_debut)) return false;
            if (filters.date_fin && new Date(e.date_fin) > new Date(filters.date_fin)) return false;

            return true;
        });
    }, [events, filters]);

    // Loader visuel lors du filtrage
    useEffect(() => {
        if (Object.keys(filters).length > 0) {
            setLoading(true);
            const timer = setTimeout(() => setLoading(false), 300);
            return () => clearTimeout(timer);
        }
    }, [filters]);

    const getStatusBadgeStyles = (status) => {
        switch(status) {
            case 'En cours': return 'text-orange-700 bg-orange-50 border-orange-200 hover:bg-orange-100';
            case 'A venir': return 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100';
            default: return 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100';
        }
    };

    if (isloading && !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
                <Loader className='animate-spin w-6 h-6 mb-3 text-green-600' />
                <span className="font-medium text-gray-500">Chargement de votre espace...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 text-gray-900">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header de bienvenue */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Bonjour, <span className="text-blue-700">{user?.name || "Agent"}</span> 👋
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Voici le planning de vos évènements.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="font-medium text-gray-700">{events.length} évènements assignés</span>
                    </div>
                </div>

                {/* Section Calendrier */}
                <CalendarView events={formattedEvents} />

                {/* Section Liste & Filtres */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <ListFilter className="w-5 h-5 text-gray-500" />
                            Liste détaillée
                        </h2>
                    </div>

                    {/* Barre de Filtres */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-700">
                            <Filter className="w-4 h-4" /> Filtrer les résultats
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {/* Catégorie */}
                            <Select value={filters.categorie || ""} onValueChange={(value) => setFilters({ ...filters, categorie: value, type: "" })}>
                                <SelectTrigger className="bg-gray-50 border-gray-200">
                                    <SelectValue placeholder="Toutes catégories" />
                                </SelectTrigger>
                                <SelectContent>
                                    {eventCategories.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Type */}
                            <Select value={filters.type || ""} onValueChange={(value) => setFilters({ ...filters, type: value })} disabled={!filters.categorie}>
                                <SelectTrigger className="bg-gray-50 border-gray-200">
                                    <SelectValue placeholder="Type d'évènement" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(filters.categorie ? eventTypesByCategory[filters.categorie] || [] : []).map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Statut */}
                            <Select value={filters.statut || ""} onValueChange={(value) => setFilters({ ...filters, statut: value })}>
                                <SelectTrigger className="bg-gray-50 border-gray-200">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A venir">À venir</SelectItem>
                                    <SelectItem value="En cours">En cours</SelectItem>
                                    <SelectItem value="Terminé">Terminé</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Dates */}
                            <Input 
                                type="date" 
                                className="bg-gray-50 border-gray-200" 
                                value={filters.date_debut || ""} 
                                onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })} 
                            />
                            
                            {/* Reset Button */}
                            {Object.keys(filters).length > 0 ? (
                                <Button variant="outline" onClick={() => setFilters({})} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100">
                                    Réinitialiser
                                </Button>
                            ) : (
                                <div className="hidden lg:block"></div> // Spacer
                            )}
                        </div>
                    </div>

                    {/* Liste des Évènements */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[300px] flex flex-col">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 flex-1">
                                <Loader className='animate-spin w-8 h-8 text-blue-600 mb-2' />
                                <span className="text-sm text-gray-500">Mise à jour...</span>
                            </div>
                        ) : filteredEvents.length === 0 ? (
                            <div className='flex flex-col items-center justify-center py-12 text-gray-400 flex-1'>
                                <div className="bg-gray-50 p-4 rounded-full mb-3">
                                    <Info className='w-8 h-8 text-gray-400' />
                                </div>
                                <span className="text-gray-600 font-medium">Aucun résultat trouvé</span>
                            </div>
                        ) : (
                            <ScrollArea className="h-[500px]">
                                <div>
                                    {filteredEvents.map((event) => {
                                        const status = getEventStatus(event.date_debut, event.date_fin);
                                        return (
                                            <div 
                                                key={event.id} 
                                                className="group p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                            >
                                                {/* Colonne 1 : Infos Principales */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-base font-bold text-gray-900 truncate">
                                                            {event.nom_salle || "Salle Inconnue"}
                                                        </span>
                                                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-semibold border ${getStatusBadgeStyles(status)}`}>
                                                            {status}
                                                        </Badge>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-1">
                                                        <span className="flex items-center gap-1.5">
                                                            <CalendarCheck2 size={14} className="text-gray-400" /> 
                                                            <span dangerouslySetInnerHTML={{ __html: formatEventDate(event.date_debut, event.date_fin) }} />
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                                                            {event.type}
                                                        </span>
                                                        <span className="text-gray-400">•</span>
                                                        <span>{event.categorie}</span>
                                                    </div>
                                                </div>

                                                {/* Colonne 2 : Client */}
                                                <div className="md:w-1/4 border-t md:border-t-0 border-gray-100 pt-2 md:pt-0 mt-2 md:mt-0">
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                                                        <User size={10} /> Client
                                                    </p>
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{event.nom_client}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                                        <Phone size={12} /> {event.contact_client}
                                                    </p>
                                                </div>

                                                {/* Colonne 3 : Financier (Pour l'agent, peut-être moins pertinent mais présent) */}
                                                <div className="md:w-1/6 md:text-right border-t md:border-t-0 border-gray-100 pt-2 md:pt-0 mt-2 md:mt-0 flex flex-row md:flex-col justify-between items-center md:items-end">
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5 flex items-center gap-1 md:justify-end">
                                                        <Wallet size={10} /> Montant
                                                    </p>
                                                    <span className="text-sm font-bold text-gray-900">
                                                        ### <span className="text-[10px] text-gray-500 font-normal">FCFA</span>
                                                    </span>
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
        </div>
    );
}