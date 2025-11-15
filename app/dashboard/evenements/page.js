"use client";

import React, { useState, useEffect, useMemo } from 'react'
import { Info, Plus, Radius, Trash2, SquarePen, ChevronDownIcon, Share, CalendarCheck2, Phone, Pen, User, PartyPopper, UserStar } from 'lucide-react';
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

            // ✅ Filtrage par agent
            if (filters.agent && e.agent.name !== filters.agent) return false;

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

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!selectedEvent) return;
        setLoading(true);
        await updateEvent(
            selectedEvent.id,
            form,
            reloadEvents,
            setLoading,
            () => setSelectedEvent(null) // Ferme le dialog
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
        // réinitialise les dates si la salle change
        setForm(prev => ({ ...prev, date_debut: '', date_fin: '' }));
        // optionnel : focus sur le DateTimePicker
    }, [form.salle_id]);


    return (
        <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                <h1 className="text-xl font-medium text-gray-900">Gestion des évènements</h1>
                <div className="flex items-center gap-2 mb-4">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Plus size={16} />Ajouter</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[525px]">
                            <DialogHeader>
                                <DialogTitle>Ajouter un évènement</DialogTitle>
                                <DialogDescription>
                                    Veuillez renseigner les informations ci-dessous pour ajouter un nouvel évènement.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit}>
                                <div className='max-h-54 overflow-y-auto pr-3 mb-3'>
                                    <h1 className="text-lg font-medium text-gray-900 my-2">Informations du client</h1>
                                    <div className="grid gap-4">
                                        <div className="grid gap-3">
                                            <Label htmlFor="name-1">Nom et prénom(s)</Label>
                                            <Input id="name-1" name="nom_client" value={form.nom_client} onChange={handleChange} />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="contact">Contact</Label>
                                            <Input id="contact" name="contact_client" value={form.contact_client} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <h1 className="text-lg font-medium text-gray-900 my-2">Informations sur l'évènement</h1>
                                    <div className="grid gap-4">
                                        <Select
                                            value={form.salle_id}
                                            onValueChange={(value) => handleSelectChange("salle_id", value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Nom de la salle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Salles</SelectLabel>
                                                    {salles.map((salle) => (
                                                        <SelectItem key={salle.id} value={salle.id}>
                                                            {salle.nom_salle}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <DateTimePicker
                                            label="Date début"
                                            value={form.date_debut ? new Date(form.date_debut) : undefined}
                                            onChange={(dateTime) => setForm(prev => ({ ...prev, date_debut: dateTime.toISOString() }))}
                                            disabledSlots={getOccupiedSlots(form.salle_id)}
                                        />
                                        <DateTimePicker
                                            label="Date fin"
                                            value={form.date_fin ? new Date(form.date_fin) : undefined}
                                            onChange={(dateTime) => setForm(prev => ({ ...prev, date_fin: dateTime.toISOString() }))}
                                            disabledSlots={getOccupiedSlots(form.salle_id)}
                                        />
                                        <Select
                                            value={form.categorie}
                                            onValueChange={(value) => {
                                                handleSelectChange("categorie", value);
                                                // Réinitialiser le type si on change de catégorie
                                                setForm((prev) => ({ ...prev, type: "" }));
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
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

                                        {/* Sélecteur de type dépendant de la catégorie */}
                                        <Select
                                            value={form.type}
                                            onValueChange={(value) => handleSelectChange("type", value)}
                                            disabled={!form.categorie} // désactive tant qu'aucune catégorie n'est choisie
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Type d'évènement" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Types</SelectLabel>
                                                    {form.categorie &&
                                                        eventTypesByCategory[form.categorie]?.map((type) => (
                                                            <SelectItem key={type} value={type}>
                                                                {type}
                                                            </SelectItem>
                                                        ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>


                                        <div className="grid gap-3">
                                            <Label htmlFor="Montant">Montant</Label>
                                            <Input id="Montant" name="montant" value={form.montant} onChange={handleChange} />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="avance">Avance (optionnel)</Label>
                                            <Input id="avance" name="avance" value={form.avance} onChange={handleChange} />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="Description">Description</Label>
                                            <textarea id="description" name="description" value={form.description} onChange={handleChange} rows="2" className="resize-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent" />
                                        </div>
                                    </div>
                                    <h1 className="text-lg font-medium text-gray-900 my-2">Informations sur l'agent</h1>

                                    <Select
                                        value={form.agent_id}
                                        onValueChange={(value) => handleSelectChange("agent_id", value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Nom et prénom(s) de l'agent" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Choisissez l'agent</SelectLabel>
                                                {agents.map((agent) => (
                                                    <SelectItem key={agent.id} value={agent.id}>
                                                        {agent.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Annuler</Button>
                                    </DialogClose>
                                    <Button type="submit">Sauvegarder</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <button
                        onClick={() => exportEventsToPDF(events)}
                        disabled={isloading || events.length === 0}
                        className="flex items-center cursor-pointer gap-2 px-4 py-2 border border-green-700 bg-gray-50 text-green-800 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <Share className="w-4 h-4" />
                        Exporter Pdf
                    </button>
                </div>
            </div>

            {/* 🔍 Barre de filtre responsive */}
            <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl">
                    {/* Filtrer par agent */}
                    <Select
                        value={filters.agent || ""}
                        onValueChange={(value) => setFilters({ ...filters, agent: value })}
                    >
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Agent" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Agents</SelectLabel>
                                {agents.map((agent) => (
                                    <SelectItem key={agent.id} value={agent.name}>
                                        {agent.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.categorie || ""}
                        onValueChange={(value) =>
                            setFilters({
                                ...filters,
                                categorie: value,
                                type: "", // Réinitialise le type quand la catégorie change
                            })
                        }
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

                    {/* Filtrer par type (lié à la catégorie) */}
                    <Select
                        value={filters.type || ""}
                        onValueChange={(value) => setFilters({ ...filters, type: value })}
                        disabled={!filters.categorie} // Désactivé si aucune catégorie choisie
                    >
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue
                                placeholder={
                                    filters.categorie ? "Type" : "Choisissez une catégorie d'abord"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Types</SelectLabel>
                                {(filters.categorie
                                    ? eventTypesByCategory[filters.categorie] || []
                                    : []
                                ).map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {t}
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

                            <div className="flex items-center gap-2">
                                <CalendarCheck2 size={16} /> Date de l'évènement
                            </div>

                            <p className="text-sm text-gray-600 mb-4 min-h-[40px]"
                                dangerouslySetInnerHTML={{ __html: formatEventDate(event.date_debut, event.date_fin) }}
                            />

                            <div className="mb-4">
                                <h3 className="text-sm bg-gray-100 px-2 py-1 rounded-md mb-1 gap-2 flex items-center"><User size={16} />Client</h3>
                                <p className="text-lg font-semibold text-gray-900">{event.nom_client}</p>
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <Phone size={14} /> {event.contact_client}
                                </p>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-sm bg-gray-100 px-2 py-1 rounded-md mb-1 gap-2 flex items-center"><PartyPopper size={16} />Évènement</h3>
                                <p className="text-lg font-semibold text-gray-900">{event.salle.nom_salle}</p>
                                <p className="text-lg font-semibold text-gray-900">{event.montant.toLocaleString("fr-FR") + " Fcfa"}</p>
                                <p className="text-md text-gray-600">Avance: {event.avance === 0 ? event.avance : 0 + " Fcfa"}</p>
                                <p className="text-sm text-gray-600">Catégorie: {event.categorie}</p>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-sm bg-gray-100 px-2 py-1 rounded-md mb-1 gap-2 flex items-center"><UserStar size={16} />Agent assigné</h3>
                                <p className="text-lg font-semibold text-gray-900">{event.agent.name}</p>
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <Phone size={14} /> {event.agent.contact}
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="hover:bg-red-100 transition-colors"
                                    onClick={() => {
                                        setEventToDelete(event);
                                        setOpenn(true);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
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
                                    <Pen className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                    ))}
                </div>
            )
            }

            {/* Dialog global pour supprimer */}
            <Dialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Supprimer l'évènement ?</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. L'évènement <b>{eventToDelete?.type}</b> pour le client <b>{eventToDelete?.nom_client}</b> sera définitivement supprimé.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEventToDelete(null)}>Annuler</Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                deleteEvent(eventToDelete.id, reloadEvents);
                                setEventToDelete(null);
                            }}
                        >
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Modifier l'évènement</DialogTitle>
                        <DialogDescription>
                            Modifie les informations de l'évènement ci-dessous.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEvent && (
                        <form onSubmit={handleUpdate}>
                            <div className='max-h-54 overflow-y-auto pr-3 mb-3'>
                                <h1 className="text-lg font-medium text-gray-900 my-2">Informations du client</h1>
                                <div className="grid gap-4">
                                    <div className="grid gap-3">
                                        <Label htmlFor="name-1">Nom et prénom(s)</Label>
                                        <Input id="name-1" name="nom_client" value={form.nom_client} onChange={handleChange} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="contact">Contact</Label>
                                        <Input id="contact" name="contact_client" value={form.contact_client} onChange={handleChange} />
                                    </div>
                                </div>
                                <h1 className="text-lg font-medium text-gray-900 my-2">Informations sur l'évènement</h1>
                                <div className="grid gap-4">
                                    <DateTimePicker
                                        label="Date début"
                                        value={form.date_debut ? new Date(form.date_debut) : undefined}
                                        onChange={(dateTime) => setForm(prev => ({ ...prev, date_debut: dateTime.toISOString() }))}
                                    />
                                    <DateTimePicker
                                        label="Date fin"
                                        value={form.date_fin ? new Date(form.date_fin) : undefined}
                                        onChange={(dateTime) => setForm(prev => ({ ...prev, date_fin: dateTime.toISOString() }))}
                                    />
                                    <Select
                                        value={form.salle_id}
                                        onValueChange={(value) => handleSelectChange("salle_id", value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Nom de la salle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Salles</SelectLabel>
                                                {salles.map((salle) => (
                                                    <SelectItem key={salle.id} value={salle.id}>
                                                        {salle.nom_salle}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={form.categorie}
                                        onValueChange={(value) => {
                                            handleSelectChange("categorie", value)
                                            setForm((prev) => ({ ...prev, type: "" })) // reset le type
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
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

                                    {/* Type (lié dynamiquement à la catégorie) */}
                                    <Select
                                        value={form.type}
                                        onValueChange={(value) =>
                                            handleSelectChange("type", value)
                                        }
                                        disabled={!form.categorie}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Type d'évènement" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Types</SelectLabel>
                                                {form.categorie &&
                                                    eventTypesByCategory[form.categorie]?.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>

                                    <div className="grid gap-3">
                                        <Label htmlFor="Montant">Montant</Label>
                                        <Input id="Montant" name="montant" value={form.montant} onChange={handleChange} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="avance">Avance (optionnel)</Label>
                                        <Input id="avance" name="avance" value={form.avance} onChange={handleChange} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="Description">Description</Label>
                                        <textarea id="description" name="description" value={form.description} onChange={handleChange} rows="2" className="resize-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent" />
                                    </div>
                                </div>
                                <h1 className="text-lg font-medium text-gray-900 my-2">Informations sur l'agent</h1>

                                <Select
                                    value={form.agent_id}
                                    onValueChange={(value) => handleSelectChange("agent_id", value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Nom et prénom(s) de l'agent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Choisissez l'agent</SelectLabel>
                                            {agents.map((agent) => (
                                                <SelectItem key={agent.id} value={agent.id}>
                                                    {agent.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button">
                                        Annuler
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Mise à jour..." : "Mettre à jour"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    )
}