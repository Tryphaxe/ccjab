"use client";

import React, { useState, useEffect } from 'react'
import { Info, Plus, Radius, Trash2 } from 'lucide-react';
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

import { deleteSalle, fetchSalles, submitForm } from '@/utils/salleUtils';
import { fetchEvents } from '@/utils/evenUtils';   // <-- IMPORT POUR EVENTS
import { deleteCommodite, fetchCommodites, submitCommodite } from '@/utils/commoditeUtils';
import { Badge } from '@/components/ui/badge';

export default function page() {
    const [salleToDelete, setSalleToDelete] = useState(null);
    const [salles, setSalles] = useState([])
    const [events, setEvents] = useState([])  // <-- STOCKAGE DES EVENTS
    const [isloading, setIsLoading] = useState(true)
    const [loading, setLoading] = useState(false)
    const [commodites, setCommodites] = useState([]);
    const [selected, setSelected] = useState([]);
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
        fetchEvents(setEvents, () => { });  // <-- CHARGER LES EVENTS
    }, []);

    // Vérifier si une salle est occupée
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
        await submitForm({
            data: {
                ...form,
                commodites: selected   // ⬅ IMPORTANT
            },
            setLoading,
            reload: () => fetchSalles(setSalles, setIsLoading),
            successMessage: "Salle ajoutée avec succès.",
            errorMessage: "Erreur lors de l'ajout de la salle.",
        });
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
    };

    const reloadSalles = () => fetchSalles(setSalles, setIsLoading);
    const reloadCom = () => fetchCommodites(setCommodites, setIsLoading);

    return (
        <div className="w-full h-full gap-2 grid grid-cols-3">
            <div className='col-span-2'>
                <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                    <h1 className="text-xl font-medium text-gray-900">Gestion des salles</h1>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Plus size={16} />Ajouter</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[525px]">
                            <DialogHeader>
                                <DialogTitle>Ajouter une salle</DialogTitle>
                                <DialogDescription>
                                    Veuillez renseigner les informations ci-dessous pour ajouter une nouvelle salle.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit}>
                                <div className='max-h-54 overflow-y-auto pr-3 mb-2'>
                                    <div className="grid gap-3">
                                        <div className="grid gap-3">
                                            <Label>Nom de la salle</Label>
                                            <Input name="nom_salle" value={form.nom_salle} onChange={handleChange} required />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label>Nombre de place</Label>
                                            <Input type="number" name="nombre_place" value={form.nombre_place} onChange={handleChange} />
                                        </div>
                                        <div className="mt-3 space-y-2">
                                            <h2 className="text-lg font-semibold">Commodités</h2>
                                            {commodites.map(c => (
                                                <label key={c.id} className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => toggle(c.id)}
                                                        checked={selected.includes(c.id)}
                                                    />
                                                    {c.nom}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Annuler</Button>
                                    </DialogClose>
                                    <Button type="submit">{loading ? 'Ajout en cours...' : 'Ajouter'}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="flex items-center justify-around gap-3 px-3 py-1 mb-2 rounded-md bg-gray-200">
                    <div className="flex items-center justify-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-600">
                        </div>
                        <span className="text-gray-700">Disponible</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-600">
                        </div>
                        <span className="text-gray-700">Indisponible</span>
                    </div>
                </div>


                {isloading ? (
                    <div className="flex items-center justify-center gap-3 p-3">
                        <Radius className='animate-spin w-4 h-4 text-blue-950' />
                        <span className="ml-2 text-gray-700">Chargement en cours...</span>
                    </div>
                ) : salles.length === 0 ? (
                    <div className='flex flex-col items-center justify-center gap-3 p-3'>
                        <div className="flex items-center gap-2">
                            <Info className='w-4 h-4 text-red-800' />
                            <span className="ml-2 text-gray-700">Aucune salle enregistrée !</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-4">
                        {salles.map((sal) => {
                            const occupee = isSalleOccupee(sal.id);
                            return (
                                <div key={sal.id} className={`relative bg-white rounded-xl border-l-2 ${occupee ? "border-red-600" : "border-green-600"}`}>
                                    <div className="flex items-center justify-between p-3">
                                        <div className='flex items-center gap-3'>
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <span className="text-sm font-medium text-green-700">
                                                    {sal.nom_salle.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">
                                                    {sal.nombre_place} places
                                                </p>
                                                <p className="text-xl font-bold text-gray-900 mt-1">{sal.nom_salle}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {sal.commodites.length > 0 ? (
                                                        sal.commodites.map((item) => (
                                                            <Badge variant="secondary" key={item.commodite.id}>
                                                                {item.commodite.nom}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-500 text-sm">
                                                            Aucune commodité
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => setSalleToDelete(sal)}
                                            className="cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                )}

                {/* Dialog suppression */}
                <Dialog open={!!salleToDelete} onOpenChange={(open) => !open && setSalleToDelete(null)}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Supprimer la salle ?</DialogTitle>
                            <DialogDescription>
                                Cette action est irréversible. La salle {salleToDelete?.nom_salle} sera définitivement supprimée.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSalleToDelete(null)}>Annuler</Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    deleteSalle(salleToDelete.id, reloadSalles);
                                    setSalleToDelete(null);
                                }}
                            >
                                Supprimer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div className='bg-white flex flex-col rounded-lg max-h-screen sticky top-0 overflow-y-auto p-4'>
                <div className="w-full flex items-center justify-between">
                    <h2 className="text-lg font-semibold mb-2">Commodités</h2>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Plus size={16} /></Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[525px]">
                            <DialogHeader>
                                <DialogTitle>Ajouter une commodité</DialogTitle>
                                <DialogDescription>
                                    Veuillez renseigner les informations ci-dessous pour ajouter une nouvelle commodité.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={hs}>
                                <div className='max-h-54 overflow-y-auto pr-3 mb-2'>
                                    <div className="grid gap-4">
                                        <div className="grid gap-3">
                                            <Label>Commodité</Label>
                                            <Input name="nom" value={formu.nom} onChange={hc} required />
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Annuler</Button>
                                    </DialogClose>
                                    <Button type="submit">Ajouter</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1">
                    <div className="mt-3 space-y-2">
                        {isloading ? (
                            <div className="flex items-center justify-center gap-3 p-3">
                                <Radius className='animate-spin w-4 h-4 text-blue-950' />
                            </div>
                        ) : commodites.length === 0 ? (
                            <p className="text-sm text-gray-500">Aucune commodité trouvée.</p>
                        ) : (
                            commodites.map(c => (
                                <div key={c.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-2 cursor-pointer">
                                    <span className="text-sm text-gray-800">{c.nom}</span>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={() => {
                                            deleteCommodite(c.id, reloadCom);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <Trash2 size={12} />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}