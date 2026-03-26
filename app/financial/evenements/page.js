"use client";

import React, { useState, useEffect, useMemo } from 'react'
import { Info, Plus, Loader, Trash2, Share, CalendarCheck2, Phone, Pen, User, PartyPopper, UserStar, FilterX, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import { Badge } from "@/components/ui/badge";
import { eventCategories, eventTypesByCategory } from '@/lib/list';
import { submitForm, fetchEvents, deleteEvent, updateEvent, deleteManyEvents } from '@/utils/evenUtils';
import { fetchAgents } from '@/utils/agentUtils';
import { fetchSalles } from '@/utils/salleUtils';
import { formatEventDate, getEventStatus } from '@/lib/evenHelper';
import { exportEventsToPDF } from '@/lib/exportEvent';
import { DateTimePicker } from '@/components/DateTimePicker';

const ITEMS_PER_PAGE = 10; // Nombre d'éléments par page

export default function page() {
    const [filters, setFilters] = useState({});
    const [events, setEvents] = useState([])
    const [agents, setAgents] = useState([])
    const [salles, setSalles] = useState([])
    const [isloading, setIsLoading] = useState(true)
    const [loading, setLoading] = useState(false)
    const [openn, setOpenn] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [open, setOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // États pour la sélection multiple
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);


    useEffect(() => {
        fetchEvents(setEvents, setIsLoading);
        fetchAgents(setAgents, setIsLoading);
        fetchSalles(setSalles, setIsLoading);
    }, []);

    const reloadEvents = () => fetchEvents(setEvents, setIsLoading);

    const filteredEvents = useMemo(() => {
        return events.filter((e) => {
            const statut = getEventStatus(e.date_debut, e.date_fin);
            if (filters.agent && e.agent.name !== filters.agent) return false;
            if (filters.type && e.type !== filters.type) return false;
            if (filters.categorie && e.categorie !== filters.categorie) return false;
            if (filters.statut && statut !== filters.statut) return false;
            if (filters.date_debut && new Date(e.date_debut) < new Date(filters.date_debut)) return false;
            if (filters.date_fin && new Date(e.date_fin) > new Date(filters.date_fin)) return false;
            return true;
        });
    }, [events, filters]);

    // Réinitialiser la page quand les filtres changent
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    // Logique de pagination
    const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentEvents = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);

    // Petit loader visuel lors du filtrage
    useEffect(() => {
        if (Object.keys(filters).length > 0) {
            setLoading(true);
            const timer = setTimeout(() => setLoading(false), 300);
            return () => clearTimeout(timer);
        }
    }, [filters]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!selectedEvent) return;
        setLoading(true);
        await updateEvent(
            selectedEvent.id,
            form,
            reloadEvents,
            setLoading,
            () => setSelectedEvent(null)
        );
    };

    // --- LOGIQUE DE SÉLECTION MULTIPLE ---
    const handleSelectAll = () => {
        if (selectedIds.length === filteredEvents.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredEvents.map(e => e.id));
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = async () => {
        setLoading(true);
        // Appel à la fonction utilitaire qui appelle l'API
        await deleteManyEvents(selectedIds, reloadEvents);
        setLoading(false);
        setIsBulkDeleteDialogOpen(false);
        setSelectedIds([]);
    };

    const getOccupiedSlots = (salleId) => {
        if (!salleId) return [];
        return events
            .filter(e => e.salle_id === salleId)
            .map(e => ({
                start: new Date(e.date_debut),
                end: new Date(e.date_fin)
            }));
    };

    useEffect(() => {
        if (open || selectedEvent) {
            // Reset form dates if needed or handle side effects
        }
    }, [form.salle_id]);

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 text-gray-900">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gestion des Évènements</h1>
                        <p className="text-sm text-gray-500 mt-1">Planifiez, filtrez et gérez tous vos évènements en un clin d'œil.</p>
                    </div>
                </div>

                {/* Filtres */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500">Agent</Label>
                            <Select value={filters.agent || ""} onValueChange={(value) => setFilters({ ...filters, agent: value })}>
                                <SelectTrigger className="w-full bg-gray-50/50 border-gray-200">
                                    <SelectValue placeholder="Tous les agents" />
                                </SelectTrigger>
                                <SelectContent>
                                    {agents.map((agent) => (
                                        <SelectItem key={agent.id} value={agent.name}>{agent.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500">Catégorie & Type</Label>
                            <div className="flex gap-1">
                                <Select value={filters.categorie || ""} onValueChange={(value) => setFilters({ ...filters, categorie: value, type: "" })}>
                                    <SelectTrigger className="w-1/2 bg-gray-50/50 border-gray-200">
                                        <SelectValue placeholder="Cat." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {eventCategories.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={filters.type || ""} onValueChange={(value) => setFilters({ ...filters, type: value })} disabled={!filters.categorie}>
                                    <SelectTrigger className="w-1/2 bg-gray-50/50 border-gray-200">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filters.categorie && eventTypesByCategory[filters.categorie]?.map((t) => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500">Période</Label>
                            <div className="flex gap-2 items-center">
                                <Input type="date" className="bg-gray-50/50 border-gray-200 text-xs px-2" value={filters.date_debut || ""} onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })} />
                                <span className="text-gray-300">-</span>
                                <Input type="date" className="bg-gray-50/50 border-gray-200 text-xs px-2" value={filters.date_fin || ""} onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500">Statut</Label>
                            <Select value={filters.statut || ""} onValueChange={(value) => setFilters({ ...filters, statut: value })}>
                                <SelectTrigger className="w-full bg-gray-50/50 border-gray-200">
                                    <SelectValue placeholder="Tous" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A venir">À venir</SelectItem>
                                    <SelectItem value="En cours">En cours</SelectItem>
                                    <SelectItem value="Terminé">Terminé</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setFilters({})}>
                            <FilterX className="w-4 h-4 mr-2" /> Reset
                        </Button>
                    </div>
                </div>

                {/* Contenu Principal */}
                {isloading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader className='animate-spin w-6 h-6 mb-3 text-green-600' />
                        <span className="font-medium">Chargement des données...</span>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300'>
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                            <Info className='w-8 h-8 text-gray-400' />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Aucun évènement trouvé</h3>
                        <p className="text-gray-500 max-w-sm text-center mt-1">
                            Essayez de modifier vos filtres ou créez un nouvel évènement pour commencer.
                        </p>
                    </div>
                ) : (

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
                            {/* Checkbox "Tout sélectionner" ajoutée ici */}
                            <div className="flex items-center justify-between h-7 w-full">
                                <div className="flex items-center gap-2 cursor-pointer" onClick={handleSelectAll}>
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                                        checked={filteredEvents.length > 0 && selectedIds.length === filteredEvents.length}
                                        onChange={() => { }} // Géré par le div onClick
                                    />
                                    <Label className="cursor-pointer text-xs font-medium text-gray-600 select-none">
                                        {selectedIds.length === filteredEvents.length ? "Tout désélectionner" : "Tout sélectionner"}
                                    </Label>
                                </div>

                                {selectedIds.length > 0 && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setIsBulkDeleteDialogOpen(true)}
                                        className="animate-in fade-in zoom-in duration-200"
                                    >
                                        <Trash2 size={16} className="mr-2" /> Supprimer ({selectedIds.length})
                                    </Button>
                                )}
                            </div>
                        </div>
                        {currentEvents.map((event) => (
                            <div key={event.id} className="group p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-all duration-200 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                                <div className="flex items-center h-full">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                                        checked={selectedIds.includes(event.id)}
                                        onChange={() => handleSelectOne(event.id)}
                                    />
                                </div>

                                {/* 1. Bloc Informations Principales */}
                                <div className="md:w-1/4 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-base font-bold text-gray-900 truncate">{event.type}</span>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getEventStatus(event.date_debut, event.date_fin) === 'En cours' ? 'text-yellow-700 bg-yellow-100' :
                                            getEventStatus(event.date_debut, event.date_fin) === 'A venir' ? 'text-blue-700 bg-blue-100' :
                                                'text-green-700 bg-green-100'
                                            }`}>
                                            {getEventStatus(event.date_debut, event.date_fin)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 flex gap-2 items-start">
                                        <CalendarCheck2 size={14} className="mt-0.5 shrink-0" />
                                        <span
                                            className="line-clamp-2"
                                            dangerouslySetInnerHTML={{ __html: formatEventDate(event.date_debut, event.date_fin) }}
                                        />
                                    </div>
                                </div>

                                {/* 2. Bloc Détails & Finances */}
                                <div className="md:w-1/4">
                                    <div className="flex items-center gap-1.5 text-gray-900 font-semibold text-sm mb-0.5">
                                        <PartyPopper size={14} className="text-gray-400" />
                                        {event.nom_evenement || event.description || "Pas de nom"}
                                    </div>
                                    <div className="pl-5">
                                        <p className="text-sm font-medium text-gray-700">
                                            {event.montant.toLocaleString("fr-FR")} Fcfa
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Avance: {event.avance === 0 ? event.avance : (event.avance || 0) + " Fcfa"} • <span className="italic">{event.categorie}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* 3. Bloc Intervenants */}
                                <div className="md:w-1/4 flex flex-col gap-2">
                                    <div className="flex items-start gap-2">
                                        <User size={14} className="mt-0.5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 leading-none">{event.nom_client}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                <Phone size={10} /> {event.contact_client}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <UserStar size={14} className="mt-0.5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 leading-none">{event.agent.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Barre de pagination */}
                        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                            <div className="text-xs text-gray-500 hidden sm:block">
                                Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à <span className="font-medium">{Math.min(indexOfLastItem, filteredEvents.length)}</span> sur <span className="font-medium">{filteredEvents.length}</span> résultats
                            </div>
                            <div className="flex items-center gap-2 mx-auto sm:mx-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 px-2"
                                >
                                    <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline ml-1">Précédent</span>
                                </Button>
                                <span className="text-sm font-medium mx-2">
                                    Page {currentPage} / {totalPages > 0 ? totalPages : 1}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="h-8 px-2"
                                >
                                    <span className="hidden sm:inline mr-1">Suivant</span> <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}