"use client";

import React, { useState, useEffect } from 'react'
import { Info, Plus, Loader, Trash2, Armchair, BoxSelect, Eye, EyeOff, Pen, Upload, Image } from 'lucide-react';
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from '@/components/ui/badge';
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch"

import { uploadImage } from '@/utils/uploadSallesUtils';
import { deleteSalle, fetchSalles, submitForm, updateSalleVisibility, updateSalleFull } from '@/utils/salleUtils';
import { fetchEvents } from '@/utils/evenUtils';
import { deleteCommodite, fetchCommodites, submitCommodite } from '@/utils/commoditeUtils';

export default function page() {
    const [salleToEdit, setSalleToEdit] = useState(null)
    const [salleToDelete, setSalleToDelete] = useState(null);
    const [salles, setSalles] = useState([])
    const [events, setEvents] = useState([])
    const [isloading, setIsLoading] = useState(true)
    const [loading, setLoading] = useState(false)
    const [commodites, setCommodites] = useState([]);
    const [selected, setSelected] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [form, setForm] = useState({
        nom_salle: '',
        nombre_place: '',
        commodites: [],
    });
    const [formu, setFormu] = useState({
        nom: '',
    });

    const toggle = (id) => {
        setSelected(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const hc = (e) => {
        setFormu({ ...formu, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        fetchSalles(setSalles, setIsLoading);
        fetchCommodites(setCommodites, setIsLoading);
        fetchEvents(setEvents, () => { });
    }, []);

    const isSalleOccupee = (salleId) => {
        const now = new Date();
        return events.some((ev) => {
            if (!ev.salle_id) return false;
            if (ev.salle_id !== salleId) return false;
            const d1 = new Date(ev.date_debut);
            const d2 = new Date(ev.date_fin);
            return now >= d1 && now <= d2;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let imageUrl = null;

        // 1. Si une image a été choisie, on l'upload d'abord
        if (imageFile) {
            imageUrl = await uploadImage(imageFile, 'salles');
        }
        await submitForm({
            data: { ...form, commodites: selected, image: imageUrl },
            setLoading,
            reload: () => fetchSalles(setSalles, setIsLoading),
            successMessage: "Salle ajoutée avec succès.",
            errorMessage: "Erreur lors de l'ajout de la salle.",
        });
        setPreview(null);
        setImageFile(null);
        setSelected([]);
        setForm({ nom_salle: "", nombre_place: "", commodites: [] });
    };

    const hs = async (e) => {
        e.preventDefault();
        await submitCommodite({
            data: formu,
            setLoading,
            reload: () => fetchCommodites(setCommodites, setIsLoading),
            successMessage: "Commodité ajoutée avec succès.",
            errorMessage: "Erreur lors de l'ajout de la commodité.",
        });
        setFormu({ nom: '' }); // Reset form
    };

    const reloadSalles = () => fetchSalles(setSalles, setIsLoading);
    const reloadCom = () => fetchCommodites(setCommodites, setIsLoading);

    const handleVisibilityToggle = async (salle) => {
        // 1. Mise à jour optimiste (on change l'état local immédiatement pour que ce soit fluide)
        const updatedSalles = salles.map((s) =>
            s.id === salle.id ? { ...s, visible: !s.visible } : s
        );
        setSalles(updatedSalles);

        try {
            // 2. Appel à la base de données
            await updateSalleVisibility(salle.id, !salle.visible);
        } catch (error) {
            // 3. Si erreur, on remet l'état précédent
            console.error("Erreur de modification", error);
            fetchSalles(setSalles, setIsLoading); // On recharge les données réelles
        }
    };

    const handleEditClick = (salle) => {
        // 1. On ouvre le modal via cet état
        setSalleToEdit(salle);

        // 2. On pré-remplit le formulaire principal avec les infos de la salle
        setForm({
            nom_salle: salle.nom_salle,
            nombre_place: salle.nombre_place
        });

        // 3. On pré-coche les commodités existantes
        // Note: salle.commodites est un tableau d'objets { commoditeId: 1, ... }
        const commoditesIds = salle.commodites.map(c => c.commoditeId);
        setSelected(commoditesIds);

        // On affiche l'image actuelle ou l'image par défaut
        setPreview(salle.image || DEFAULT_IMAGE);
        setImageFile(null); // On reset le fichier en attente
    };

    const handleUpdateSubmit = async () => {
        setLoading(true);

        let imageUrl = salleToEdit.image; // Par défaut, on garde l'ancienne

        // Si l'utilisateur a choisi une nouvelle photo, on l'upload
        if (imageFile) {
            imageUrl = await uploadImage(imageFile, 'salles');
        }

        await updateSalleFull(salleToEdit.id, {
            nom_salle: form.nom_salle,
            nombre_place: form.nombre_place,
            commodites: selected,
            image: imageUrl
        }, () => {
            fetchSalles(setSalles, setIsLoading); // Recharger la liste
            setSalleToEdit(null); // Fermer le modal
        });
        setLoading(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Créer une URL temporaire pour la prévisualisation immédiate
            setPreview(URL.createObjectURL(file));
        }
    };
    const DEFAULT_IMAGE = "/images/default-salle.png";

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 text-gray-900">
            <div className="max-w-7xl mx-auto">

                {/* Header de la page */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gestion des Espaces</h1>
                        <p className="text-sm text-gray-500 mt-1">Gérez vos salles et leurs équipements.</p>
                    </div>

                    {/* Légende rapide */}
                    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-gray-600 font-medium">Disponible</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                            <span className="text-gray-600 font-medium">Occupée</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* SECTION GAUCHE : LISTE DES SALLES (Prend 8/12 colonnes sur desktop) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <BoxSelect className="w-5 h-5 text-gray-500" />
                                Liste des salles
                            </h2>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20">
                                        <Plus className="w-4 h-4 mr-2" /> Nouvelle Salle
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>Ajouter une salle</DialogTitle>
                                        <DialogDescription>Créez un nouvel espace pour vos événements.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                                        {/* Zone d'upload d'image */}
                                        <div className="col-span-4 flex flex-col items-center gap-4 mb-4">
                                            <div className="relative w-full h-40 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden">

                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />

                                                {preview ? (
                                                    <img src={preview} alt="Prévisualisation" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center text-gray-500">
                                                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                                        <p className="text-xs font-medium">Cliquez pour ajouter une photo</p>
                                                        <p className="text-[10px] text-gray-400">JPG, PNG (Max 5Mo)</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="nom_salle">Nom de la salle</Label>
                                                <Input id="nom_salle" name="nom_salle" placeholder="Ex: Salle de Conférence A" value={form.nom_salle} onChange={handleChange} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="nombre_place">Capacité (personnes)</Label>
                                                <Input id="nombre_place" type="number" name="nombre_place" placeholder="0" value={form.nombre_place} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-3 pt-2">
                                                <Label>Commodités incluses</Label>
                                                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 max-h-40 overflow-y-auto">
                                                    {commodites.map(c => (
                                                        <label key={c.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                onChange={() => toggle(c.id)}
                                                                checked={selected.includes(c.id)}
                                                            />
                                                            {c.nom}
                                                        </label>
                                                    ))}
                                                    {commodites.length === 0 && <span className="text-xs text-gray-400 col-span-2">Aucune commodité disponible</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline" type="button">Annuler</Button>
                                            </DialogClose>
                                            <Button type="submit" disabled={loading}>
                                                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                                {loading ? 'Création...' : 'Créer la salle'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {isloading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Loader className='animate-spin w-8 h-8 mb-2' />
                                <span>Chargement des espaces...</span>
                            </div>
                        ) : salles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300 text-center">
                                <div className="bg-gray-50 p-4 rounded-full mb-3">
                                    <Info className='w-6 h-6 text-gray-400' />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Aucune salle</h3>
                                <p className="text-gray-500 max-w-sm mt-1 mb-4">Commencez par ajouter votre première salle pour gérer les événements.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {salles.map((sal) => {
                                    const occupee = isSalleOccupee(sal.id);

                                    return (
                                        <div key={sal.id} className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden flex flex-col">

                                            {/* Barre de statut latérale */}
                                            <div className={`absolute top-0 left-0 bottom-0 w-1.5 z-10 ${occupee ? "bg-rose-500" : "bg-emerald-500"}`}></div>

                                            {/* --- ZONE IMAGE AJOUTÉE --- */}
                                            <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                                                <img
                                                    src={sal.image || DEFAULT_IMAGE}
                                                    alt={sal.nom_salle}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onError={(e) => e.target.src = DEFAULT_IMAGE} // Fallback si l'image casse
                                                />
                                                {/* Overlay sombre au survol pour faire ressortir le texte si besoin */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                                            </div>
                                            {/* -------------------------- */}

                                            <div className="p-5 pl-7 flex flex-col flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                                                            {sal.nombre_place} places
                                                        </p>
                                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                            {sal.nom_salle}
                                                        </h3>
                                                    </div>
                                                    <Badge variant={occupee ? "destructive" : "secondary"} className={`${!occupee && "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"} border-0`}>
                                                        {occupee ? "Occupée" : "Libre"}
                                                    </Badge>
                                                </div>

                                                <Separator className="my-3" />

                                                <div className="flex flex-wrap gap-2 mb-4 min-h-[1.5rem]">
                                                    {sal.commodites.length > 0 ? (
                                                        sal.commodites.map((item) => (
                                                            <span key={item.commodite.id} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                                                                {item.commodite.nom}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Aucun équipement spécifié</span>
                                                    )}
                                                </div>

                                                {/* Bloc Actions et Visibilité (poussé vers le bas grâce à mt-auto) */}
                                                <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-50">

                                                    {/* Le Switch de visibilité */}
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={sal.visible}
                                                            onCheckedChange={() => handleVisibilityToggle(sal)}
                                                            id={`switch-${sal.id}`}
                                                            className="data-[state=checked]:bg-emerald-600"
                                                        />
                                                        <Label
                                                            htmlFor={`switch-${sal.id}`}
                                                            className={`text-xs font-medium cursor-pointer flex items-center gap-1.5 ${sal.visible ? "text-emerald-700" : "text-gray-400"}`}
                                                        >
                                                            {sal.visible ? (
                                                                <><Eye size={14} /> Visible</>
                                                            ) : (
                                                                <><EyeOff size={14} /> Masquée</>
                                                            )}
                                                        </Label>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEditClick(sal)}
                                                            className="h-8 w-8 p-0 border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <Pen size={14} />
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => setSalleToDelete(sal)}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-1.5" /> Supprimer
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* SECTION DROITE : COMMODITÉS (Sticky sidebar sur desktop) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Armchair className="w-4 h-4 text-gray-500" />
                                    Commodités
                                </h2>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:text-blue-600">
                                            <Plus size={16} />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[400px]">
                                        <DialogHeader>
                                            <DialogTitle>Nouvelle commodité</DialogTitle>
                                            <DialogDescription>Ajoutez un équipement disponible dans vos salles.</DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={hs} className="space-y-4 mt-2">
                                            <div className="space-y-2">
                                                <Label>Nom de l'équipement</Label>
                                                <Input name="nom" placeholder="Ex: Projecteur, Wifi..." value={formu.nom} onChange={hc} required />
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit">Ajouter</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                                {isloading ? (
                                    <div className="flex justify-center py-4"><Loader className='animate-spin w-5 h-5 text-gray-400' /></div>
                                ) : commodites.length === 0 ? (
                                    <p className="text-sm text-center text-gray-400 py-4 italic">Aucune commodité enregistrée.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {commodites.map(c => (
                                            <div key={c.id} className="group flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-colors">
                                                <span className="text-sm font-medium text-gray-700">{c.nom}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all"
                                                    onClick={() => {deleteCommodite(c.id, reloadCom), reloadSalles}}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Dialog de confirmation suppression salle */}
                <Dialog open={!!salleToDelete} onOpenChange={(open) => !open && setSalleToDelete(null)}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle className="text-red-600 flex items-center gap-2">
                                <Trash2 className="w-5 h-5" /> Supprimer la salle
                            </DialogTitle>
                            <DialogDescription className="pt-2">
                                Êtes-vous sûr de vouloir supprimer <strong>{salleToDelete?.nom_salle}</strong> ? <br />
                                Cette action est irréversible et supprimera l'historique associé.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setSalleToDelete(null)}>Annuler</Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    deleteSalle(salleToDelete.id, reloadSalles);
                                    setSalleToDelete(null);
                                }}
                            >
                                Confirmer la suppression
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* --- MODAL DE MODIFICATION --- */}
                <Dialog open={!!salleToEdit} onOpenChange={(open) => !open && setSalleToEdit(null)}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Modifier la salle</DialogTitle>
                            <DialogDescription>Modifiez les informations ci-dessous.</DialogDescription>
                        </DialogHeader>

                        {/* On réutilise les mêmes champs que l'ajout */}
                        <div className="grid gap-4 py-4">
                            <div className="flex flex-col items-center gap-4 mb-2">
                                <div className="relative w-full h-40 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {preview ? (
                                        <img src={preview} alt="Prévisualisation" className="w-full h-full object-cover" onError={(e) => e.target.src = DEFAULT_IMAGE} />
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                            <p className="text-xs font-medium">Changer la photo</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-nom" className="text-right">Nom</Label>
                                <Input
                                    id="edit-nom"
                                    value={form.nom_salle}
                                    onChange={(e) => setForm({ ...form, nom_salle: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-cap" className="text-right">Capacité</Label>
                                <Input
                                    id="edit-cap"
                                    type="number"
                                    value={form.nombre_place}
                                    onChange={(e) => setForm({ ...form, nombre_place: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>

                            {/* Gestion des commodités (Checkbox) */}
                            <div className="grid grid-cols-4 gap-4 mt-2">
                                <Label className="text-right pt-2">Équipements</Label>
                                <div className="col-span-3 grid grid-cols-2 gap-2">
                                    {commodites.map((com) => (
                                        <div key={com.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`edit-com-${com.id}`}
                                                checked={selected.includes(com.id)}
                                                onChange={() => {
                                                    if (selected.includes(com.id)) {
                                                        setSelected(selected.filter(id => id !== com.id));
                                                    } else {
                                                        setSelected([...selected, com.id]);
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <label htmlFor={`edit-com-${com.id}`} className="text-sm text-gray-600 cursor-pointer">
                                                {com.nom}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSalleToEdit(null)}>Annuler</Button>
                            <Button onClick={handleUpdateSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    )
}