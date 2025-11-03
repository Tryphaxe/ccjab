"use client";

import React, { useState, useEffect, useMemo } from 'react'
import CalendarView from '@/components/CalendarView';
import { Info, Radius, CalendarCheck2, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { eventCategories, eventTypes } from '@/lib/list';
import { fetchEventsAgent } from '@/utils/evenAgentUtils';
import { fetchAgents } from '@/utils/agentUtils';
import { fetchSalles } from '@/utils/salleUtils';
import { formatEventDate, getEventStatus } from '@/lib/evenHelper';
import { useAuth } from '@/lib/AuthContext';

export default function page() {
    const [isloading, setIsLoading] = useState(true)
    const [events, setEvents] = useState([]);
    const [filters, setFilters] = useState({});
    const [agents, setAgents] = useState([])
    const [salles, setSalles] = useState([])
    const [loading, setLoading] = useState(false)
    const { user } = useAuth();

    useEffect(() => {
        if (user !== undefined) setLoading(false);
        if (user?.id) {
            fetchEventsAgent(user.id, setEvents, setIsLoading);
        }
        fetchAgents(setAgents, setIsLoading);
        fetchSalles(setSalles, setIsLoading);
    }, [user]);

    const formattedEvents = events.map((e) => ({
        id: e.id,
        nom_salle: e.salle.nom_salle,
        agent: { nom: e.agent.name },
        type_evenement: e.type,
        categorie: e.categorie,
        statut: getEventStatus(e.date_debut, e.date_fin),
        date_debut: e.date_debut,
        date_fin: e.date_fin,
        montant: e.montant
    }));

    const filteredEvents = useMemo(() => {
        return events.filter((e) => {
            const statut = getEventStatus(e.date_debut, e.date_fin);

            // ✅ Filtrage par type
            if (filters.type && e.type !== filters.type) return false;

            // ✅ Filtrage par catégorie
            if (filters.categorie && e.categorie !== filters.categorie) return false;

            // ✅ Filtrage par statut
            if (filters.statut && statut !== filters.statut) return false;

            // ✅ Filtrage par date de début / fin
            if (filters.date_debut && new Date(e.date_debut) < new Date(filters.date_debut)) return false;
            if (filters.date_fin && new Date(e.date_fin) > new Date(filters.date_fin)) return false;

            return true;
        });
    }, [events, filters]);

    // 🔁 Afficher un petit loader à chaque changement de filtre
    useEffect(() => {
        if (Object.keys(filters).length > 0) {
            setLoading(true);
            const timer = setTimeout(() => setLoading(false), 400); // 400 ms pour un effet smooth
            return () => clearTimeout(timer);
        }
    }, [filters]);

    return (
        <div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-black mb-3">
                <h1 className="text-2xl font-bold mb-2">Bienvenue, agent {user ? user.name : ""}</h1>
                <p className="text-gray-700">Vue d&apos;ensemble des des évènements</p>
            </div>

            <CalendarView
                events={formattedEvents}
            />

            <div className="flex items-center justify-between bg-green-700 p-3 mt-4 mb-2">
                <h1 className="text-2xl font-medium text-white">Liste des évènements</h1>
            </div>

            {/* 🔍 Barre de filtre responsive */}
            <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl">

                    {/* Filtrer par type */}
                    <Select
                        value={filters.type || ""}
                        onValueChange={(value) => setFilters({ ...filters, type: value })}
                    >
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Types</SelectLabel>
                                {eventTypes.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {/* Filtrer par catégorie */}
                    <Select
                        value={filters.categorie || ""}
                        onValueChange={(value) => setFilters({ ...filters, categorie: value })}
                    >
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Catégories</SelectLabel>
                                {eventCategories.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {/* Filtrer par statut */}
                    <Select
                        value={filters.statut || ""}
                        onValueChange={(value) => setFilters({ ...filters, statut: value })}
                    >
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

                    {/* Date de début */}
                    <div className="flex flex-col">
                        <Label className="text-xs text-gray-500">Début</Label>
                        <Input
                            type="date"
                            value={filters.date_debut || ""}
                            onChange={(e) =>
                                setFilters({ ...filters, date_debut: e.target.value })
                            }
                            className="w-full sm:w-40"
                        />
                    </div>

                    {/* Date de fin */}
                    <div className="flex flex-col">
                        <Label className="text-xs text-gray-500">Fin</Label>
                        <Input
                            type="date"
                            value={filters.date_fin || ""}
                            onChange={(e) =>
                                setFilters({ ...filters, date_fin: e.target.value })
                            }
                            className="w-full sm:w-40"
                        />
                    </div>

                    {/* Bouton de reset */}
                    <Button
                        variant="outline"
                        className="mt-2 sm:mt-0"
                        onClick={() => setFilters({})}
                    >
                        Réinitialiser
                    </Button>
                </div>
            </div>

            {isloading || loading ? (
                <div className="flex items-center justify-center gap-3 p-3">
                    <Radius className='animate-spin w-4 h-4 text-blue-950' />
                    <span className="ml-2 text-gray-700">Chargement en cours...</span>
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className='flex flex-col items-center justify-center gap-3 p-3'>
                    <div className="flex items-center justify-center gap-2">
                        <Info className='w-4 h-4 text-red-800' />
                        <span className="ml-2 text-gray-700">Aucun évènement enrégistré !</span>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-lg font-semibold text-gray-800">{event.type}</span>
                                <span className={`text-sm font-medium px-3 py-1 rounded-full ${getEventStatus(event.date_debut, event.date_fin) === 'En cours' ? 'text-yellow-700 bg-yellow-100' :
                                    getEventStatus(event.date_debut, event.date_fin) === 'A venir' ? 'text-blue-700 bg-blue-100' :
                                        'text-green-700 bg-green-100'
                                    }`}>
                                    {getEventStatus(event.date_debut, event.date_fin)}
                                </span>
                            </div>

                            <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                                <CalendarCheck2 size={16} /> {formatEventDate(event.date_debut, event.date_fin)}
                            </p>

                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
                                <p className="text-lg font-semibold text-gray-900">{event.nom_client}</p>
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <Phone size={14} /> {event.contact_client}
                                </p>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Évènement</h3>
                                <p className="text-lg font-semibold text-gray-900">{event.salle.nom_salle}</p>
                                <p className="text-sm text-gray-600">Catégorie: {event.categorie}</p>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Agent assigné</h3>
                                <p className="text-lg font-semibold text-gray-900">{event.agent.name}</p>
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <Phone size={14} /> {event.agent.contact}
                                </p>
                            </div>
                        </div>

                    ))}
                </div>
            )}

        </div>
    )
}
