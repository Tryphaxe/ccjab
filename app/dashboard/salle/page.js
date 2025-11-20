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

export default function page() {
    const [salleToDelete, setSalleToDelete] = useState(null);
    const [salles, setSalles] = useState([])
    const [events, setEvents] = useState([])  // <-- STOCKAGE DES EVENTS
    const [isloading, setIsLoading] = useState(true)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        nom_salle: '',
        nombre_place: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        fetchSalles(setSalles, setIsLoading);
        fetchEvents(setEvents, () => {});  // <-- CHARGER LES EVENTS
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
            data: form,
            setLoading,
            reload: () => fetchSalles(setSalles, setIsLoading),
            successMessage: "Salle ajoutée avec succès.",
            errorMessage: "Erreur lors de l'ajout de la salle.",
        });
    };

    const reloadSalles = () => fetchSalles(setSalles, setIsLoading);

    return (
        <div>
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
                                <div className="grid gap-4">
                                    <div className="grid gap-3">
                                        <Label>Nom de la salle</Label>
                                        <Input name="nom_salle" value={form.nom_salle} onChange={handleChange} required />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label>Nombre de place</Label>
                                        <Input type="number" name="nombre_place" value={form.nombre_place} onChange={handleChange} />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">

                    {salles.map((sal) => {
                        const occupee = isSalleOccupee(sal.id);

                        return (
                            <div key={sal.id} className="relative bg-white rounded-xl border border-gray-200 p-3">

                                {/* BADGE OCCUPÉ / LIBRE */}
                                <span
                                    className={`text-xs px-3 py-1 rounded-full text-white 
                                    ${occupee ? "bg-red-600" : "bg-green-600"}`}
                                >
                                    {occupee ? "Occupée" : "Libre"}
                                </span>

                                <div className="flex items-center justify-between">
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
    )
}