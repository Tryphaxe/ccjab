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

export default function page() {
    const [salleToDelete, setSalleToDelete] = useState(null);
    const [salles, setSalles] = useState([])
    const [isloading, setIsLoading] = useState(true)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        nom_salle: '',
        nombre_place: '',
    });
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        fetchSalles(setSalles, setIsLoading);
    }, []);

    // Fonction pour enregistrer un nouveau departement
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
                                {/* <h1 className="text-lg font-medium text-gray-900 my-2">Informations du client</h1> */}
                                <div className="grid gap-4">
                                    <div className="grid gap-3">
                                        <Label htmlFor="name-1">Nom de la salle</Label>
                                        <Input id="name-1" name="nom_salle" value={form.nom_salle} onChange={handleChange} required />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="number">Nombre de place</Label>
                                        <Input type="number" id="number" name="nombre_place" value={form.nombre_place} onChange={handleChange} />
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
                    <div className="flex items-center justify-center gap-2">
                        <Info className='w-4 h-4 text-red-800' />
                        <span className="ml-2 text-gray-700">Aucune salle enrégistrée !</span>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                    {salles.map((sal) => (
                        <div key={sal.id} className="bg-white rounded-xl border border-gray-200 p-3">
                            <div className="flex items-center justify-between">
                                <div className='flex items-center gap-3'>
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <span className="text-sm font-medium text-green-700">
                                            {
                                                (`${sal.nom_salle}`).split(' ').map(n => n[0]).join('')
                                            }
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
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setSalleToDelete(sal);
                                        setOpen(true);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Dialog global pour supprimer */}
            <Dialog open={!!salleToDelete} onOpenChange={(open) => !open && setSalleToDelete(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Supprimer l'agent ?</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. L'agent {salleToDelete?.nom_salle} sera définitivement supprimé.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSalleToDelete(null)}>Annuler</Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                deleteAgent(salleToDelete.id, reloadSalles);
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