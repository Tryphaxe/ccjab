"use client";

import React, { useState, useEffect, useMemo } from 'react'
import { Info, Plus, Loader, Trash2, Share, CalendarCheck2, Phone, Pen, User, PartyPopper, UserStar, FilterX, FileText } from 'lucide-react';
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
import { submitForm, fetchEvents, deleteEvent, updateEvent } from '@/utils/evenUtils';
import { fetchAgents } from '@/utils/agentUtils';
import { fetchSalles } from '@/utils/salleUtils';
import { formatEventDate, getEventStatus } from '@/lib/evenHelper';
import { exportEventsToPDF } from '@/lib/exportEvent';
import { DateTimePicker } from '@/components/DateTimePicker';

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
    const [form, setForm] = useState({
        categorie: '',
        montant: '',
        avance: '',
        date_debut: '',
        date_fin: '',
        description: '',
        nom_client: '',
        contact_client: '',
        type: '',
        salle_id: '',
        agent_id: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    useEffect(() => {
        fetchEvents(setEvents, setIsLoading);
        fetchAgents(setAgents, setIsLoading);
        fetchSalles(setSalles, setIsLoading);
    }, []);

    const reloadEvents = () => fetchEvents(setEvents, setIsLoading);
    
    const onClose = () => {
        setOpen(false);
        setForm({
            categorie: '',
            montant: '',
            avance: '',
            date_debut: '',
            date_fin: '',
            description: '',
            nom_client: '',
            contact_client: '',
            type: '',
            salle_id: '',
            agent_id: '',
        });
    }

    const hasConflict = (startIso, endIso, salleId) => {
        if (!salleId) return false;
        const start = new Date(startIso);
        const end = new Date(endIso);
        return events.some(e => e.salle_id === salleId && (start < new Date(e.date_fin) && end > new Date(e.date_debut)));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.date_debut && form.date_fin && hasConflict(form.date_debut, form.date_fin, form.salle_id)) {
            alert("Conflit : la salle est déjà réservée sur cette plage.");
            return;
        }
        await submitForm({
            data: form,
            setLoading,
            reload: () => fetchEvents(setEvents, setIsLoading),
            successMessage: "Évènement ajouté avec succès.",
            errorMessage: "Erreur lors de l'ajout de l'évènement.",
        });
        onClose();
    };

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

    // Composant réutilisable pour le formulaire pour éviter la duplication
    const EventFormFields = () => (
        <div className='grid gap-4 py-2'>
            {/* Section Client */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-100 flex items-center gap-2">
                    <User size={14} /> Informations Client
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label htmlFor="name-1" className="text-xs text-gray-500">Nom complet</Label>
                        <Input id="name-1" name="nom_client" value={form.nom_client} onChange={handleChange} placeholder="ex: Jean Dupont" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="contact" className="text-xs text-gray-500">Contact</Label>
                        <Input id="contact" name="contact_client" value={form.contact_client} onChange={handleChange} placeholder="ex: 0102030405" />
                    </div>
                </div>
            </div>

            {/* Section Évènement */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-100 flex items-center gap-2">
                    <PartyPopper size={14} /> Détails de l'évènement
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                         <Label className="text-xs text-gray-500">Lieu</Label>
                        <Select value={form.salle_id} onValueChange={(value) => handleSelectChange("salle_id", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une salle" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Salles disponibles</SelectLabel>
                                    {salles.map((salle) => (
                                        <SelectItem key={salle.id} value={salle.id}>{salle.nom_salle}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <DateTimePicker
                            label="Date début"
                            value={form.date_debut ? new Date(form.date_debut) : undefined}
                            onChange={(dateTime) => setForm(prev => ({ ...prev, date_debut: dateTime.toISOString() }))}
                            disabledSlots={getOccupiedSlots(form.salle_id)}
                        />
                    </div>
                    <div className="space-y-1">
                        <DateTimePicker
                            label="Date fin"
                            value={form.date_fin ? new Date(form.date_fin) : undefined}
                            onChange={(dateTime) => setForm(prev => ({ ...prev, date_fin: dateTime.toISOString() }))}
                            disabledSlots={getOccupiedSlots(form.salle_id)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Catégorie</Label>
                        <Select value={form.categorie} onValueChange={(value) => { handleSelectChange("categorie", value); setForm(prev => ({ ...prev, type: "" })) }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                {eventCategories.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Type</Label>
                        <Select value={form.type} onValueChange={(value) => handleSelectChange("type", value)} disabled={!form.categorie}>
                            <SelectTrigger>
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {form.categorie && eventTypesByCategory[form.categorie]?.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="Montant" className="text-xs text-gray-500">Montant Total (FCFA)</Label>
                        <Input id="Montant" name="montant" type="number" value={form.montant} onChange={handleChange} />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="avance" className="text-xs text-gray-500">Avance reçue</Label>
                        <Input id="avance" name="avance" type="number" value={form.avance} onChange={handleChange} />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                         <Label htmlFor="description" className="text-xs text-gray-500">Description / Notes</Label>
                        <textarea id="description" name="description" value={form.description} onChange={handleChange} rows="2" className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" />
                    </div>
                </div>
            </div>

             {/* Section Agent */}
             <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-100 flex items-center gap-2">
                    <UserStar size={14} /> Agent Responsable
                </h3>
                <Select value={form.agent_id} onValueChange={(value) => handleSelectChange("agent_id", value)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner un agent" />
                    </SelectTrigger>
                    <SelectContent>
                         {agents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 text-gray-900">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gestion des Évènements</h1>
                        <p className="text-sm text-gray-500 mt-1">Planifiez, filtrez et gérez tous vos évènements en un clin d'œil.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20">
                                    <Plus size={16} className="mr-2" /> Nouvel Évènement
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0">
                                <DialogHeader className="p-6 pb-2">
                                    <DialogTitle>Ajouter un évènement</DialogTitle>
                                    <DialogDescription>Remplissez les détails ci-dessous pour créer une nouvelle réservation.</DialogDescription>
                                </DialogHeader>
                                <div className="p-6 pt-2 overflow-y-auto">
                                    <form id="add-event-form" onSubmit={handleSubmit}>
                                        <EventFormFields />
                                    </form>
                                </div>
                                <DialogFooter className="p-6 pt-2 border-t bg-gray-50/50">
                                    <DialogClose asChild>
                                        <Button variant="outline">Annuler</Button>
                                    </DialogClose>
                                    <Button type="submit" form="add-event-form" disabled={loading}>
                                        {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                        Sauvegarder
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button 
                            variant="outline"
                            onClick={() => exportEventsToPDF(events)}
                            disabled={isloading || events.length === 0}
                            className="bg-white"
                        >
                            <Share className="w-4 h-4 mr-2" /> Exporter PDF
                        </Button>
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {filteredEvents.map((event) => (
                            <div key={event.id} className="group p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-all duration-200 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                            
                            {/* 1. Bloc Informations Principales */}
                            <div className="md:w-1/4 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                <span className="text-base font-bold text-gray-900 truncate">{event.type}</span>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                    getEventStatus(event.date_debut, event.date_fin) === 'En cours' ? 'text-yellow-700 bg-yellow-100' :
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
                                    {event.salle.nom_salle}
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

                            {/* 4. Bloc Actions */}
                            <div className="flex items-center md:justify-end gap-2 md:w-auto mt-2 md:mt-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-gray-200"
                                    onClick={() => {
                                        setSelectedEvent(event);
                                        setForm({
                                            categorie: event.categorie || '',
                                            montant: event.montant || '',
                                            avance: event.avance || '',
                                            date_debut: event.date_debut || '',
                                            date_fin: event.date_fin || '',
                                            description: event.description || '',
                                            nom_client: event.nom_client || '',
                                            contact_client: event.contact_client || '',
                                            type: event.type || '',
                                            salle_id: event.salle_id || '',
                                            agent_id: event.agent_id || '',
                                        });
                                    }}
                                >
                                    <Pen className="w-3.5 h-3.5" />
                                </Button>

                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 bg-white text-red-500 border border-red-100 hover:bg-red-50 hover:text-red-700 shadow-sm"
                                    onClick={() => {
                                        setEventToDelete(event);
                                        setOpenn(true);
                                    }}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>

                            </div>
                        ))}
                    </div>
                )}

                {/* --- MODALES --- */}

                {/* Dialog Suppression */}
                <Dialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle className="text-red-600 flex items-center gap-2">
                                <Trash2 size={18} /> Supprimer l'évènement ?
                            </DialogTitle>
                            <DialogDescription className="pt-2">
                                Vous êtes sur le point de supprimer l'évènement <strong>{eventToDelete?.type}</strong> du client <strong>{eventToDelete?.nom_client}</strong>.<br/>
                                Cette action est irréversible.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => setEventToDelete(null)}>Annuler</Button>
                            <Button variant="destructive" onClick={() => { deleteEvent(eventToDelete.id, reloadEvents); setEventToDelete(null); }}>
                                Confirmer la suppression
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog Modification */}
                <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle>Modifier l'évènement</DialogTitle>
                            <DialogDescription>Mettez à jour les informations ci-dessous.</DialogDescription>
                        </DialogHeader>
                        <div className="p-6 pt-2 overflow-y-auto">
                            <form id="edit-event-form" onSubmit={handleUpdate}>
                                <EventFormFields />
                            </form>
                        </div>
                        <DialogFooter className="p-6 pt-2 border-t bg-gray-50/50">
                            <DialogClose asChild>
                                <Button variant="outline">Annuler</Button>
                            </DialogClose>
                            <Button type="submit" form="edit-event-form" disabled={loading}>
                                {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Pen className="mr-2 h-4 w-4" />}
                                Mettre à jour
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    )
}