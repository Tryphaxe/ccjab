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
import { submitForm, fetchEventPage, deleteEvent, updateEvent, deleteManyEvents, updateEventVisibility } from '@/utils/evenUtils';
import { fetchAgents } from '@/utils/agentUtils';
import { fetchSalles } from '@/utils/salleUtils';
import { formatEventDate, getEventStatus } from '@/lib/evenHelper';
import { exportEventsToPDF } from '@/lib/exportEvent';
import { DateTimePicker } from '@/components/DateTimePicker';
import { Switch } from '@/components/ui/switch';
import { uploadImage } from '@/utils/uploadEventsUtils';
import { uploadFile } from '@/utils/uploadFichesUtils';
import ExportEventsButton from '@/components/ExportEventsButton';
import { EventOriginBadge, EventOriginLegend, getEventOriginColor } from '@/components/EventOrigin';
import { useAuth } from '@/lib/AuthContext';
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
                        <Label htmlFor="pdf-upload" className="font-semibold text-sm text-[#1b1b1d] cursor-pointer">
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
                            <p className="text-sm font-semibold text-[#1b1b1d]">Cliquez pour ajouter une affiche</p>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5Mo)</p>
                        </div>
                    )}
                </div>
            </div>
            {/* -------------------------------------- */}
            {/* Section Client */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#1b1b1d] bg-gray-50 p-2 rounded-md border border-gray-100 flex items-center gap-2">
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
                <label className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50/60 p-3 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={form.organise_par_ccjab === true} onChange={(event) => setForm({ ...form, organise_par_ccjab: event.target.checked })} className="mt-0.5 rounded border-gray-300 text-orange-700 focus:ring-orange-600" />
                    <span><strong>Évènement organisé par le CCJAB</strong><span className="block text-xs text-gray-500">Décochez cette case pour un évènement organisé par un client externe.</span></span>
                </label>
            </div>

            {/* Section Évènement */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#1b1b1d] bg-gray-50 p-2 rounded-md border border-gray-100 flex items-center gap-2">
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
                        <div className="grid grid-cols-2 gap-3 p-3 border border-[#eee8eb] rounded-md bg-white">
                            {salles.map((salle) => (
                                <label key={salle.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-[#1b1b1d] focus:ring-gray-900"
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
                            disabledSlots={getOccupiedSlots(form.salle_ids)}
                        />
                    </div>
                    <div className="space-y-1">
                        <DateTimePicker
                            label="Date fin"
                            value={form.date_fin ? new Date(form.date_fin) : undefined}
                            onChange={(dateTime) => setForm(prev => ({ ...prev, date_fin: dateTime.toISOString() }))}
                            disabledSlots={getOccupiedSlots(form.salle_ids)}
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
                <h3 className="text-sm font-semibold text-[#1b1b1d] bg-gray-50 p-2 rounded-md border border-gray-100 flex items-center gap-2">
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
    const { isAdmin } = useAuth();
    const [filters, setFilters] = useState({});
    const [events, setEvents] = useState([])
    const [occupancyEvents, setOccupancyEvents] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
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
        organise_par_ccjab: false,
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

    useEffect(() => () => {
        if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    }, [preview]);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    useEffect(() => {
        fetchAgents(setAgents, setIsLoading);
        if (isAdmin) fetchSalles(setSalles, setIsLoading);
    }, [isAdmin]);

    useEffect(() => {
        const timer = setTimeout(() => fetchEventPage({ page: currentPage, pageSize: ITEMS_PER_PAGE, filters }, setEvents, setTotalResults, setIsLoading), 250);
        return () => clearTimeout(timer);
    }, [currentPage, filters]);

    useEffect(() => {
        const roomIds = form.salle_ids || [];
        if (!roomIds.length) { setOccupancyEvents([]); return; }
        const controller = new AbortController();
        const params = new URLSearchParams();
        roomIds.forEach((id) => params.append('roomId', id));
        fetch(`/api/even/occupancy?${params}`, { signal: controller.signal })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Erreur de disponibilité.');
                setOccupancyEvents(data);
            })
            .catch((error) => { if (error.name !== 'AbortError') console.error(error); });
        return () => controller.abort();
    }, [form.salle_ids]);

    const reloadEvents = () => fetchEventPage({ page: currentPage, pageSize: ITEMS_PER_PAGE, filters }, setEvents, setTotalResults, setIsLoading);

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
            organise_par_ccjab: false,
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

        return occupancyEvents.some(e => {
            if (e.id === excludeId) return false;
            // Conflit si l'évènement existant occupe l'une des salles qu'on tente de réserver
            const occupeUneDesSalles = e.salles?.some(s => salleIds.includes(s.id));
            return occupeUneDesSalles && (start < new Date(e.date_fin) && end > new Date(e.date_debut));
        });
    };

    const isConflict = useMemo(() => {
        const excludeId = selectedEvent ? selectedEvent.id : null;
        return hasConflict(form.date_debut, form.date_fin, form.salle_ids, excludeId);
    }, [form.date_debut, form.date_fin, form.salle_ids, occupancyEvents, selectedEvent]);

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
                reload: reloadEvents,
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
        return events;
    }, [events]);

    // Réinitialiser la page quand les filtres changent
    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds([]);
    }, [filters]);

    // Logique de pagination
    const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);
    const indexOfFirstItem = totalResults ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
    const indexOfLastItem = Math.min(currentPage * ITEMS_PER_PAGE, totalResults);
    const currentEvents = filteredEvents;

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
        const pageIds = filteredEvents.map((event) => event.id);
        const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
        if (allPageSelected) {
            setSelectedIds((current) => current.filter((id) => !pageIds.includes(id)));
        } else {
            setSelectedIds((current) => [...new Set([...current, ...pageIds])]);
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

    const getOccupiedSlots = (salleIds = []) => {
        if (!Array.isArray(salleIds) || salleIds.length === 0) return [];
        return occupancyEvents
            .filter(e => e.salles?.some(salle => salleIds.includes(salle.id)))
            .map(e => ({
                start: new Date(e.date_debut),
                end: new Date(e.date_fin)
            }));
    };

    useEffect(() => {
        if (open || selectedEvent) {
            // Reset form dates if needed or handle side effects
        }
    }, [form.salle_ids, occupancyEvents]);

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
            reloadEvents(); // On recharge les données réelles
        }
    };

    return (
        <main className="min-h-screen bg-[#fcf8fb] text-[#1b1b1d]">
            <div className="w-full">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#a93105]">Programmation · Régie culturelle</p>
                        <h1 className="font-[Georgia] text-3xl font-semibold tracking-tight text-[#1b1b1d]">{isAdmin ? 'Gestion des Évènements' : 'Évènements'}</h1>
                        <p className="text-sm text-gray-500 mt-1">{isAdmin ? "Planifiez, filtrez et gérez tous vos évènements en un clin d'œil." : "Consultation des évènements en lecture seule."}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {isAdmin && <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-[#a93105] hover:bg-[#862300] shadow-sm">
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
                                        <EventFormFields
                                            form={form}
                                            handleChange={handleChange}
                                            handleSelectChange={handleSelectChange}
                                            setForm={setForm}
                                            salles={salles}
                                            agents={agents}
                                            getOccupiedSlots={getOccupiedSlots}
                                            preview={preview}
                                            handleImageChange={handleImageChange}
                                            pdfLink={pdfLink}
                                            handlePdfChange={handlePdfChange}
                                        />
                                    </form>
                                </div>
                                <DialogFooter className="p-6 pt-2 border-t bg-[#fcf8fb] flex-col sm:flex-col items-stretch gap-2">
                                    {/* ALERTE DE CONFLIT */}
                                    {isConflict && (
                                        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md animate-in fade-in slide-in-from-bottom-1">
                                            <Info size={16} className="shrink-0" />
                                            <span className="font-medium">
                                                Conflit : La salle est déjà réservée sur ce créneau horaire.
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 mt-2">
                                        <DialogClose asChild>
                                            <Button variant="outline">Annuler</Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            form="add-event-form"
                                            // On désactive le bouton si loading OU si conflit
                                            disabled={loading || isConflict}
                                            className={isConflict ? "opacity-50 cursor-not-allowed" : ""}
                                        >
                                            {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                            Sauvegarder
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>}

                        <ExportEventsButton />
                    </div>
                </div>

                <section aria-label="Résumé des résultats" className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                        { label: 'Événements correspondants', value: totalResults, note: 'Selon les filtres actifs', icon: PartyPopper, tone: 'bg-[#fae9e3] text-[#a93105]' },
                        { label: 'Affichés sur cette page', value: events.length, note: `Page ${currentPage}${totalPages ? ` sur ${totalPages}` : ''}`, icon: CalendarCheck2, tone: 'bg-[#e2f1e8] text-[#446554]' },
                        { label: 'Sélectionnés', value: selectedIds.length, note: 'Prêts pour une action groupée', icon: Eye, tone: 'bg-[#ffeed1] text-[#7b5500]' },
                    ].map(({ label, value, note, icon: Icon, tone }) => (
                        <article key={label} className="flex items-center gap-4 rounded-2xl border border-[#eee8eb] bg-white p-4 shadow-[0_2px_12px_rgba(42,24,30,0.035)] sm:p-5">
                            <span className={`rounded-xl p-3 ${tone}`}><Icon size={19} /></span>
                            <div className="min-w-0"><p className="text-xs font-semibold text-[#765f58]">{label}</p><p className="mt-1 text-2xl font-bold tracking-tight text-[#1b1b1d]">{value}</p><p className="mt-0.5 text-[11px] text-[#8d7169]">{note}</p></div>
                        </article>
                    ))}
                </section>

                {/* Filtres */}
                <section aria-label="Filtres des événements" className="mb-6 rounded-2xl border border-[#eee8eb] bg-white p-4 shadow-[0_2px_12px_rgba(42,24,30,0.035)] sm:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#f0edef] pb-3"><div><h2 className="text-sm font-bold text-[#1b1b1d]">Affiner la programmation</h2><p className="mt-0.5 text-xs text-[#8d7169]">Combinez les critères pour retrouver rapidement un événement.</p></div><EventOriginLegend /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                        <div className="space-y-1.5">
                            <Label htmlFor="event-search" className="text-xs font-medium text-gray-500">Recherche</Label>
                            <Input id="event-search" type="search" placeholder="Événement, client…" value={filters.q || ""} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500">Agent</Label>
                            <Select value={filters.agent || ""} onValueChange={(value) => setFilters({ ...filters, agent: value })}>
                                <SelectTrigger className="w-full bg-[#fcf8fb] border-[#eee8eb]">
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
                                    <SelectTrigger className="w-1/2 bg-[#fcf8fb] border-[#eee8eb]">
                                        <SelectValue placeholder="Cat." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {eventCategories.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={filters.type || ""} onValueChange={(value) => setFilters({ ...filters, type: value })} disabled={!filters.categorie}>
                                    <SelectTrigger className="w-1/2 bg-[#fcf8fb] border-[#eee8eb]">
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
                                <Input type="date" className="bg-[#fcf8fb] border-[#eee8eb] text-xs px-2" value={filters.date_debut || ""} onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })} />
                                <span className="text-gray-300">-</span>
                                <Input type="date" className="bg-[#fcf8fb] border-[#eee8eb] text-xs px-2" value={filters.date_fin || ""} onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-gray-500">Statut</Label>
                            <Select value={filters.statut || ""} onValueChange={(value) => setFilters({ ...filters, statut: value })}>
                                <SelectTrigger className="w-full bg-[#fcf8fb] border-[#eee8eb]">
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
                </section>

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
                        <h3 className="text-lg font-semibold text-[#1b1b1d]">Aucun évènement trouvé</h3>
                        <p className="text-gray-500 max-w-sm text-center mt-1">
                            Essayez de modifier vos filtres ou créez un nouvel évènement pour commencer.
                        </p>
                    </div>
                ) : (

                    <div className="flex flex-col gap-3">
                        {isAdmin && <div className="flex items-center justify-between rounded-xl border border-[#eee8eb] bg-white px-4 py-3 shadow-sm">
                            {/* Checkbox "Tout sélectionner" ajoutée ici */}
                            <div className="flex items-center justify-between h-7 w-full">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-[#1b1b1d] focus:ring-gray-900 cursor-pointer"
                                        checked={filteredEvents.length > 0 && filteredEvents.every((event) => selectedIds.includes(event.id))}
                                        onChange={handleSelectAll}
                                    />
                                    <Label className="cursor-pointer text-xs font-medium text-gray-600 select-none">
                                        {filteredEvents.length > 0 && filteredEvents.every((event) => selectedIds.includes(event.id)) ? "Tout désélectionner" : "Tout sélectionner"}
                                    </Label>
                                </label>

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
                        </div>}
                        <EventOriginLegend className="rounded-xl border border-[#eee8eb] bg-white px-4 py-3 shadow-sm" />
                        {currentEvents.map((event) => (
                            <article key={event.id} style={{ borderLeftColor: getEventOriginColor(event) }} className="group flex flex-col justify-between gap-4 rounded-2xl border border-[#eee8eb] border-l-4 bg-white p-4 shadow-[0_2px_12px_rgba(42,24,30,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md md:flex-row md:items-center sm:p-5">

                                {/* 0. Checkbox de sélection */}
                                {isAdmin && <div className="flex items-center h-full md:w-auto">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-[#1b1b1d] focus:ring-gray-900 cursor-pointer"
                                        checked={selectedIds.includes(event.id)}
                                        onChange={() => handleSelectOne(event.id)}
                                    />
                                </div>}

                                {/* 1. Bloc Image + Infos Principales (Regroupés pour l'alignement) */}
                                <div className="flex items-center gap-4 md:w-1/3 min-w-0">

                                    {/* --- IMAGE MINIATURE --- */}
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#eee8eb] bg-gray-100 shadow-sm sm:h-20 sm:w-20">
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
                                            <span className="text-base font-bold text-[#1b1b1d] truncate" title={event.type}>
                                                {event.nom_evenement || event.type || "Évènement sans nom"}
                                            </span>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${getEventStatus(event.date_debut, event.date_fin) === 'En cours' ? 'text-yellow-700 bg-yellow-100' :
                                                getEventStatus(event.date_debut, event.date_fin) === 'A venir' ? 'text-blue-700 bg-blue-100' :
                                                    'text-green-700 bg-green-100'
                                                }`}>
                                                {getEventStatus(event.date_debut, event.date_fin)}
                                            </span>
                                            <EventOriginBadge event={event} className="text-[10px]" />
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
                                    <div className="flex items-center gap-1.5 text-[#1b1b1d] font-semibold text-sm mb-0.5">
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
                                            <p className="text-sm font-semibold text-[#1b1b1d] leading-none truncate">{event.nom_client}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                <Phone size={10} /> {event.contact_client}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <UserStar size={14} className="mt-0.5 text-gray-400" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-700 leading-none truncate">{event.agent?.name || 'Non assigné'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Bloc Actions & Visibilité */}
                                <div className="flex items-center justify-between md:justify-end gap-3 md:w-auto mt-2 md:mt-0">

                                    {/* Switch Visibilité */}
                                    {isAdmin && <div className="flex items-center gap-2 mr-2">
                                        <Switch
                                            checked={event.visible}
                                            onCheckedChange={() => handleVisibilityToggle(event)}
                                            id={`list-switch-${event.id}`}
                                            className="data-[state=checked]:bg-emerald-600 scale-75" // scale-75 pour le rendre plus discret
                                        />
                                    </div>}

                                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        {/* --- NOUVEAU : BOUTON PDF --- */}
                                        {event.fiche && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 bg-white text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Empêche de cliquer sur la ligne si elle est interactive
                                                    window.open(event.fiche, '_blank');
                                                }}
                                                title="Télécharger la fiche technique"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                            </Button>
                                        )}
                                        {isAdmin && <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-[#eee8eb]"
                                            onClick={() => {
                                                setSelectedEvent(event);
                                                setPreview(event.image || null);
                                                setImageFile(null);
                                                // PDF (AJOUT)
                                                setPdfLink(event.fiche || null); // On charge l'URL existante
                                                setPdfFile(null);
                                                setForm({
                                                    nom_evenement: event.nom_evenement || '',
                                                    categorie: event.categorie || '',
                                                    montant: event.montant || '',
                                                    avance: event.avance || '',
                                                    date_debut: event.date_debut || '',
                                                    date_fin: event.date_fin || '',
                                                    description: event.description || '',
                                                    nom_client: event.nom_client || '',
                                                    organise_par_ccjab: event.organise_par_ccjab === true,
                                                    contact_client: event.contact_client || '',
                                                    type: event.type || '',
                                                    salle_ids: event.salles?.map(s => s.id) || [],
                                                    agent_id: event.agent_id || '',
                                                    image: event.image || '',
                                                    fiche: event.fiche || '',
                                                });
                                            }}
                                        >
                                            <Pen className="w-3.5 h-3.5" />
                                        </Button>}

                                        {isAdmin && <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8 bg-white text-red-500 border border-red-100 hover:bg-red-50 hover:text-red-700 shadow-sm"
                                            onClick={() => {
                                                setEventToDelete(event);
                                            }}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>}
                                    </div>
                                </div>

                            </article>
                        ))}

                        {/* Barre de pagination */}
                        <div className="flex items-center justify-between p-4 border-t border-[#eee8eb] bg-gray-50">
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

                {/* --- MODALES --- */}

                {/* Dialog Suppression Multiple (NOUVEAU) */}
                {isAdmin && <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle className="text-red-600 flex items-center gap-2">
                                <Trash2 size={18} /> Suppression multiple
                            </DialogTitle>
                            <DialogDescription className="pt-2">
                                Vous êtes sur le point de supprimer <strong>{selectedIds.length} évènement(s)</strong>.
                                <br />Cette action est irréversible.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => setIsBulkDeleteDialogOpen(false)}>Annuler</Button>
                            <Button variant="destructive" onClick={handleBulkDelete} disabled={loading}>
                                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                Confirmer la suppression
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>}

                {/* Dialog Suppression */}
                {isAdmin && <Dialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle className="text-red-600 flex items-center gap-2">
                                <Trash2 size={18} /> Supprimer l'évènement ?
                            </DialogTitle>
                            <DialogDescription className="pt-2">
                                Vous êtes sur le point de supprimer l'évènement <strong>{eventToDelete?.type}</strong> du client <strong>{eventToDelete?.nom_client}</strong>.<br />
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
                </Dialog>}

                {/* Dialog Modification */}
                {isAdmin && <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle>Modifier l'évènement</DialogTitle>
                            <DialogDescription>Mettez à jour les informations ci-dessous.</DialogDescription>
                        </DialogHeader>
                        <div className="p-6 pt-2 overflow-y-auto">
                            <form id="edit-event-form" onSubmit={handleUpdate}>
                                <EventFormFields
                                    form={form}
                                    handleChange={handleChange}
                                    handleSelectChange={handleSelectChange}
                                    setForm={setForm}
                                    salles={salles}
                                    agents={agents}
                                    getOccupiedSlots={getOccupiedSlots}
                                    preview={preview}
                                    handleImageChange={handleImageChange}
                                    pdfLink={pdfLink}
                                    handlePdfChange={handlePdfChange}
                                />
                            </form>
                        </div><DialogFooter className="p-6 pt-2 border-t bg-[#fcf8fb] flex-col sm:flex-col items-stretch gap-2">
                            {/* ALERTE DE CONFLIT */}
                            {isConflict && (
                                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md animate-in fade-in slide-in-from-bottom-1">
                                    <Info size={16} className="shrink-0" />
                                    <span className="font-medium">
                                        Conflit : La salle est déjà réservée sur ce créneau.
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 mt-2">
                                <DialogClose asChild>
                                    <Button variant="outline">Annuler</Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    form="edit-event-form"
                                    disabled={loading || isConflict}
                                >
                                    {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Pen className="mr-2 h-4 w-4" />}
                                    Mettre à jour
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>}

            </div>
        </main>
    )
}
