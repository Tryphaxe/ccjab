"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Info, Radius, CalendarCheck2, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function Page() {
    const [isloading, setIsLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [filters, setFilters] = useState({});
    const [agents, setAgents] = useState([]);
    const [salles, setSalles] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        fetchEvents(setEvents, setIsLoading);
        fetchAgents(setAgents, setIsLoading);
        fetchSalles(setSalles, setIsLoading);
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
        if (filteredEvents.length === 0) {
            return {
                total: 0,
                montantTotal: 0,
                salleTop: "-",
                agentTop: "-",
                categorieTop: "-",
                montantMoyen: 0,
                dureeTotale: 0,
                plusGrosMontant: 0
            };
        }

        const total = filteredEvents.length;
        const montantTotal = filteredEvents.reduce((sum, e) => sum + (e.montant || 0), 0);

        const dureeTotale = filteredEvents.reduce((sum, e) => {
            const debut = new Date(e.date_debut);
            const fin = new Date(e.date_fin);
            const diff = (fin - debut) / (1000 * 60 * 60); // heures
            return sum + (diff > 0 ? diff : 0);
        }, 0);

        const plusGrosMontant = Math.max(...filteredEvents.map(e => e.montant || 0));

        // Salle la plus louée
        const salleCount = {};
        filteredEvents.forEach(e => {
            salleCount[e.salle.nom_salle] = (salleCount[e.salle.nom_salle] || 0) + 1;
        });
        const salleTop = Object.entries(salleCount).sort((a, b) => b[1] - a[1])[0][0];

        // Agent le plus actif
        const agentCount = {};
        filteredEvents.forEach(e => {
            agentCount[e.agent.name] = (agentCount[e.agent.name] || 0) + 1;
        });
        const agentTop = Object.entries(agentCount).sort((a, b) => b[1] - a[1])[0][0];

        // Catégorie la plus demandée
        const catCount = {};
        filteredEvents.forEach(e => {
            catCount[e.categorie] = (catCount[e.categorie] || 0) + 1;
        });
        const categorieTop = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0][0];

        const montantMoyen = montantTotal / total;

        return {
            total,
            montantTotal,
            salleTop,
            agentTop,
            categorieTop,
            montantMoyen,
            dureeTotale,
            plusGrosMontant
        };
    }, [filteredEvents]);

    useEffect(() => {
        if (Object.keys(filters).length > 0) {
            setLoading(true);
            const timer = setTimeout(() => setLoading(false), 400);
            return () => clearTimeout(timer);
        }
    }, [filters]);

    return (
        <div>
            {/* Filtre */}
            <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl">
                    <Select value={filters.agent || ""} onValueChange={(value) => setFilters({ ...filters, agent: value })}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Agent" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Agents</SelectLabel>
                                {agents.map(agent => (
                                    <SelectItem key={agent.id} value={agent.name}>{agent.name}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select value={filters.categorie || ""} onValueChange={(value) => setFilters({ ...filters, categorie: value, type: "" })}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Catégories</SelectLabel>
                                {eventCategories.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select value={filters.type || ""} onValueChange={(value) => setFilters({ ...filters, type: value })} disabled={!filters.categorie}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder={filters.categorie ? "Type" : "Choisissez une catégorie"} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Types</SelectLabel>
                                {(filters.categorie ? eventTypesByCategory[filters.categorie] || [] : []).map(t => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select value={filters.statut || ""} onValueChange={(value) => setFilters({ ...filters, statut: value })}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Statut</SelectLabel>
                                <SelectItem value="A venir">À venir</SelectItem>
                                <SelectItem value="En cours">En cours</SelectItem>
                                <SelectItem value="Terminé">Terminé</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <div className="flex flex-col">
                        <Label className="text-xs text-gray-500">Début</Label>
                        <Input type="date" value={filters.date_debut || ""} onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })} className="w-full sm:w-40" />
                    </div>

                    <div className="flex flex-col">
                        <Label className="text-xs text-gray-500">Fin</Label>
                        <Input type="date" value={filters.date_fin || ""} onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })} className="w-full sm:w-40" />
                    </div>

                    <Button variant="outline" className="mt-2 sm:mt-0" onClick={() => setFilters({})}>Réinitialiser</Button>
                </div>
            </div>

            {/* Statistiques */}
            {(filters.date_debut && filters.date_fin) && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                    <div className="p-5 bg-white rounded-xl shadow border">
                        <p className="text-sm text-gray-500">Nombre d’évènements</p>
                        <h2 className="text-2xl font-bold">{stats.total}</h2>
                    </div>
                    <div className="p-5 bg-white rounded-xl shadow border">
                        <p className="text-sm text-gray-500">Montant total généré</p>
                        <h2 className="text-2xl font-bold">{stats.montantTotal} FCFA</h2>
                    </div>
                    <div className="p-5 bg-white rounded-xl shadow border">
                        <p className="text-sm text-gray-500">Salle la plus louée</p>
                        <h2 className="text-xl font-semibold">{stats.salleTop}</h2>
                    </div>
                    <div className="p-5 bg-white rounded-xl shadow border">
                        <p className="text-sm text-gray-500">Agent le plus actif</p>
                        <h2 className="text-xl font-semibold">{stats.agentTop}</h2>
                    </div>
                    <div className="p-5 bg-white rounded-xl shadow border">
                        <p className="text-sm text-gray-500">Catégorie la plus demandée</p>
                        <h2 className="text-xl font-semibold">{stats.categorieTop}</h2>
                    </div>
                    <div className="p-5 bg-white rounded-xl shadow border">
                        <p className="text-sm text-gray-500">Montant moyen / évènement</p>
                        <h2 className="text-xl font-semibold">{Math.round(stats.montantMoyen)} FCFA</h2>
                    </div>
                    <div className="p-5 bg-white rounded-xl shadow border">
                        <p className="text-sm text-gray-500">Durée totale louée</p>
                        <h2 className="text-xl font-semibold">{Math.round(stats.dureeTotale)} h</h2>
                    </div>
                    <div className="p-5 bg-white rounded-xl shadow border">
                        <p className="text-sm text-gray-500">Plus gros évènement</p>
                        <h2 className="text-xl font-semibold">{stats.plusGrosMontant} FCFA</h2>
                    </div>
                </div>
            )}

            {isloading || loading ? (
                <div className="flex items-center justify-center gap-3 p-3">
                    <Radius className='animate-spin w-4 h-4 text-blue-950' />
                    <span className="ml-2 text-gray-700">Chargement en cours...</span>
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className='flex flex-col items-center justify-center gap-3 p-3'>
                    <div className="flex items-center justify-center gap-2">
                        <Info className='w-4 h-4 text-red-800' />
                        <span className="ml-2 text-gray-700">Aucun évènement enregistré !</span>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                    {filteredEvents.map(event => (
                        <div key={event.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-lg font-semibold text-gray-800">{event.type}</span>
                                <span className={`text-sm font-medium px-3 py-1 rounded-full ${getEventStatus(event.date_debut, event.date_fin) === 'En cours' ? 'text-yellow-700 bg-yellow-100' : getEventStatus(event.date_debut, event.date_fin) === 'A venir' ? 'text-blue-700 bg-blue-100' : 'text-green-700 bg-green-100'}`}>
                                    {getEventStatus(event.date_debut, event.date_fin)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                                <CalendarCheck2 size={16} /> {formatEventDate(event.date_debut, event.date_fin)}
                            </p>
                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
                                <p className="text-lg font-semibold text-gray-900">{event.nom_client}</p>
                                <p className="text-sm text-gray-600 flex items-center gap-2"><Phone size={14} /> {event.contact_client}</p>
                            </div>
                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Évènement</h3>
                                <p className="text-lg font-semibold text-gray-900">{event.salle.nom_salle}</p>
                                <p className="text-sm text-gray-600">Catégorie: {event.categorie}</p>
                            </div>
                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Agent assigné</h3>
                                <p className="text-lg font-semibold text-gray-900">{event.agent.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}