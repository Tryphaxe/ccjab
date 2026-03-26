"use client";

import React, { useState, useEffect, useMemo } from 'react'
import { Info, Plus, Loader, Trash2, Share, CalendarCheck2, Phone, Pen, User, PartyPopper, UserStar, FilterX, FileText, ChevronLeft, ChevronRight, Eye, EyeOff, Upload, Image } from 'lucide-react';
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
import { submitForm, fetchEvents, deleteEvent, updateEvent, deleteManyEvents, updateEventVisibility } from '@/utils/evenUtils';
import { fetchAgents } from '@/utils/agentUtils';
import { fetchSalles } from '@/utils/salleUtils';
import { formatEventDate, getEventStatus } from '@/lib/evenHelper';
import { exportEventsToPDF } from '@/lib/exportEvent';
import { DateTimePicker } from '@/components/DateTimePicker';
import { Switch } from '@/components/ui/switch';
import { uploadImage } from '@/utils/uploadEventsUtils';
import { uploadFile } from '@/utils/uploadFichesUtils';
const DEFAULT_IMAGE = "/images/default-salle.png";

const ITEMS_PER_PAGE = 10; // Nombre d'éléments par page

const EventFormFields = React.memo(
    ({ form, handleChange, handleSelectChange, setForm, salles, agents, getOccupiedSlots, handleImageChange, preview, pdfLink, handlePdfChange }) => (
        <div className='grid gap-4 py-2'>
            {/* --- NOUVELLE ZONE : FICHE TECHNIQUE --- */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-md text-blue-600">
                        <FileText size={20} />
                    </div>
                    <div>
                        <Label htmlFor="pdf-upload" className="font-semibold text-sm text-gray-900 cursor-pointer">
                            Fiche Technique (PDF)
                        </Label>
                        <p className="text-xs text-gray-500">
                            {pdfLink ? "Fichier actuel enregistré" : "Aucun fichier sélectionné"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Lien pour voir le PDF existant */}
                    {pdfLink && typeof pdfLink === 'string' && (
                        <Button type="button" variant="ghost" size="sm" className="h-8 text-blue-600" onClick={() => window.open(pdfLink, '_blank')}>
                            <Eye size={16} />
                        </Button>
                    )}

                    {/* Input file caché + Bouton déclencheur */}
                    <div className="relative">
                        <input
                            id="pdf-upload"
                            type="file"
                            accept="application/pdf"
                            onChange={handlePdfChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button type="button" variant="outline" size="sm" className="h-8 pointer-events-none">
                            <Upload size={14} className="mr-2" />
                            {pdfLink && typeof pdfLink !== 'string' ? "Modifier" : "Ajouter"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- ZONE D'UPLOAD D'IMAGE AJOUTÉE --- */}
            <div className="flex flex-col items-center gap-4 mb-2">
                <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden group">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {preview ? (
                        <>
                            <img
                                src={preview}
                                alt="Prévisualisation"
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                onError={(e) => e.target.src = DEFAULT_IMAGE}
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-sm font-medium flex items-center gap-2">
                                    <Pen size={14} /> Changer l'image
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-500">
                            <div className="bg-white p-3 rounded-full shadow-sm mb-2 inline-block">
                                <Upload className="w-6 h-6 text-emerald-600" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900">Cliquez pour ajouter une affiche</p>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5Mo)</p>
                        </div>
                    )}
                </div>
            </div>
            {/* -------------------------------------- */}
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
                        <Label htmlFor="nom_evenement" className="text-xs text-gray-500">Nom de l'évènement</Label>
                        <Input
                            id="nom_evenement"
                            name="nom_evenement"
                            value={form.nom_evenement}
                            onChange={handleChange}
                            placeholder="ex: Gala de charité 2026"
                        />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <Label className="text-xs text-gray-500">Lieu(x) de l'évènement</Label>
                        <div className="grid grid-cols-2 gap-3 p-3 border border-gray-200 rounded-md bg-white">
                            {salles.map((salle) => (
                                <label key={salle.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                        checked={form.salle_ids?.includes(salle.id) || false}
                                        onChange={(e) => {
                                            const currentIds = form.salle_ids || [];
                                            const newIds = e.target.checked
                                                ? [...currentIds, salle.id]
                                                : currentIds.filter(id => id !== salle.id);
                                            setForm({ ...form, salle_ids: newIds });
                                        }}
                                    />
                                    <span className="text-sm font-medium text-gray-700">{salle.nom_salle}</span>
                                </label>
                            ))}
                        </div>
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
    ));

export default function page() {
    const [filters, setFilters] = useState({});
    const [events, setEvents] = useState([])
    const [agents, setAgents] = useState([])
    const [salles, setSalles] = useState([])
    const [isloading, setIsLoading] = useState(true)
    const [loading, setLoading] = useState(false)
    // const [openn, setOpenn] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [open, setOpen] = useState(false);

    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    // --- AJOUTS PDF ---
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfLink, setPdfLink] = useState(null);

    const [form, setForm] = useState({
        nom_evenement: '',
        categorie: '',
        montant: '',
        avance: '',
        date_debut: '',
        date_fin: '',
        description: '',
        nom_client: '',
        contact_client: '',
        type: '',
        salle_ids: [],
        agent_id: '',
        image: '',
        fiche: '',
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // États pour la sélection multiple
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

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
        setOpen(false); setPreview(null);
        setImageFile(null);
        // --- RESET PDF ---
        setPdfFile(null);
        setPdfLink(null);
        setForm({
            nom_evenement: '',
            categorie: '',
            montant: '',
            avance: '',
            date_debut: '',
            date_fin: '',
            description: '',
            nom_client: '',
            contact_client: '',
            type: '',
            salle_ids: [],
            agent_id: '',
            image: '',
            fiche: '',
        });
    }

    // --- FONCTION DE GESTION DE L'IMAGE ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPdfFile(file);
            // On utilise l'objet File temporairement pour l'affichage conditionnel du bouton "Modifier"
            setPdfLink(file);
        }
    };

    const hasConflict = (startIso, endIso, salleIds, excludeId = null) => {
        if (!salleIds || salleIds.length === 0 || !startIso || !endIso) return false;
        const start = new Date(startIso);
        const end = new Date(endIso);

        return events.some(e => {
            if (e.id === excludeId) return false;
            // Conflit si l'évènement existant occupe l'une des salles qu'on tente de réserver
            const occupeUneDesSalles = e.salles?.some(s => salleIds.includes(s.id));
            return occupeUneDesSalles && (start < new Date(e.date_fin) && end > new Date(e.date_debut));
        });
    };

    const isConflict = useMemo(() => {
        const excludeId = selectedEvent ? selectedEvent.id : null;
        return hasConflict(form.date_debut, form.date_fin, form.salle_ids, excludeId);
    }, [form.date_debut, form.date_fin, form.salle_ids, events, selectedEvent]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isConflict) return;

        setLoading(true); // Activez le loading manuellement ici pour englober l'upload

        try {
            let imageUrl = null;
            if (imageFile) {
                imageUrl = await uploadImage(imageFile, 'event');
            }

            let pdfUrl = null;
            if (pdfFile) {
                // On peut réutiliser la même fonction uploadFile car Supabase gère le type
                // Ou spécifier un bucket différent si vous voulez 'documents'
                pdfUrl = await uploadFile(pdfFile, 'fiches_event');
            }

            await submitForm({
                data: { ...form, image: imageUrl, fiche: pdfUrl }, // On injecte l'URL
                setLoading,
                reload: () => fetchEvents(setEvents, setIsLoading),
                successMessage: "Évènement ajouté avec succès.",
                errorMessage: "Erreur lors de l'ajout.",
            });
            onClose();
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
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

        try {
            let imageUrl = form.image; // Par défaut, on garde l'ancienne URL

            // Si un NOUVEAU fichier a été choisi, on l'upload
            if (imageFile) {
                imageUrl = await uploadImage(imageFile, 'event');
            }

            // PDF Logic (AJOUT)
            let pdfUrl = form.fiche; // Par défaut, ancienne URL
            if (pdfFile) {
                // Si nouveau fichier, on upload
                pdfUrl = await uploadFile(pdfFile, 'fiches_event');
            }

            await updateEvent(
                selectedEvent.id,
                { ...form, image: imageUrl, fiche: pdfUrl }, // On envoie la nouvelle donnée
                reloadEvents,
                setLoading,
                () => {
                    setSelectedEvent(null);
                    setPreview(null);
                    setImageFile(null);// Reset PDF
                    setPdfFile(null);
                    setPdfLink(null);
                }
            );
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
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
    }, [form.salle_ids]);

    const handleVisibilityToggle = async (ev) => {
        // 1. Mise à jour optimiste (on change l'état local immédiatement pour que ce soit fluide)
        const updatedEvents = events.map((s) =>
            s.id === ev.id ? { ...s, visible: !s.visible } : s
        );
        setEvents(updatedEvents);

        try {
            // 2. Appel à la base de données
            await updateEventVisibility(ev.id, !ev.visible);
        } catch (error) {
            fetchEvents(setEvents, setIsLoading); // On recharge les données réelles
        }
    };

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
                        {currentEvents.map((event) => (
                            <div key={event.id} className="group p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-all duration-200 flex flex-col md:flex-row md:items-center gap-4 justify-between">

                                {/* 1. Bloc Image + Infos Principales (Regroupés pour l'alignement) */}
                                <div className="flex items-center gap-4 md:w-1/3 min-w-0">

                                    {/* --- IMAGE MINIATURE --- */}
                                    <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shadow-sm">
                                        <img
                                            src={event.image || DEFAULT_IMAGE}
                                            alt={event.type}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                            onError={(e) => e.target.src = DEFAULT_IMAGE}
                                        />
                                    </div>
                                    {/* ----------------------- */}

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-base font-bold text-gray-900 truncate" title={event.type}>
                                                {event.nom_evenement || event.type || "Évènement sans nom"}
                                            </span>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${getEventStatus(event.date_debut, event.date_fin) === 'En cours' ? 'text-yellow-700 bg-yellow-100' :
                                                getEventStatus(event.date_debut, event.date_fin) === 'A venir' ? 'text-blue-700 bg-blue-100' :
                                                    'text-green-700 bg-green-100'
                                                }`}>
                                                {getEventStatus(event.date_debut, event.date_fin)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 flex gap-2 items-start">
                                            <CalendarCheck2 size={14} className="mt-0.5 shrink-0" />
                                            <span
                                                className=""
                                                dangerouslySetInnerHTML={{ __html: formatEventDate(event.date_debut, event.date_fin) }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Bloc Détails & Finances */}
                                <div className="md:w-1/5 pl-0 md:pl-4 border-l-0 md:border-l border-gray-100">
                                    <div className="flex items-center gap-1.5 text-gray-900 font-semibold text-sm mb-0.5">
                                        <PartyPopper size={14} className="text-gray-400 shrink-0" />
                                        <span className="truncate" title={event.salles?.map(s => s.nom_salle).join(" + ")}>
                                            {event.salles?.length > 0 ? event.salles.map(s => s.nom_salle).join(" + ") : "Aucune salle"}
                                        </span>
                                    </div>
                                    <div className="pl-5">
                                        <p className="text-sm font-medium text-gray-700">
                                            {event.montant.toLocaleString("fr-FR")} Fcfa
                                        </p>
                                        <p className="text-xs text-gray-500 truncate" title={`Avance: ${event.avance} • ${event.categorie}`}>
                                            Avance: {event.avance === 0 ? event.avance : (event.avance || 0) + " Fcfa"}
                                        </p>
                                    </div>
                                </div>

                                {/* 3. Bloc Intervenants */}
                                <div className="md:w-1/5 flex flex-col gap-2">
                                    <div className="flex items-start gap-2">
                                        <User size={14} className="mt-0.5 text-gray-400" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 leading-none truncate">{event.nom_client}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                <Phone size={10} /> {event.contact_client}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <UserStar size={14} className="mt-0.5 text-gray-400" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-700 leading-none truncate">{event.agent.name}</p>
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