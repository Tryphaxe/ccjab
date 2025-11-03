"use client";

import React, { useState, useEffect } from 'react'
import { Info, Pen, Plus, Radius, Trash2 } from 'lucide-react';
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
import { deleteAdmin, submitForm, fetchAdmins, updateAdmin } from '@/utils/adminUtils';

export default function page() {
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [adminToDelete, setAdminToDelete] = useState(null);
    const [open, setOpen] = useState(false);
    const [openn, setOpenn] = useState(false);
    const [admins, setAdmins] = useState([])
    const [isloading, setIsLoading] = useState(true)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: '',
        contact: '',
        email: '',
        password: '',
    });
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        fetchAdmins(setAdmins, setIsLoading);
    }, []);

    // Fonction pour enregistrer un nouveau departement
    const handleSubmit = async (e) => {
        e.preventDefault();
        await submitForm({
            data: form,
            setLoading,
            reload: () => fetchAdmins(setAdmins, setIsLoading),
            successMessage: "Admin ajouté avec succès.",
            errorMessage: "Erreur lors de l'ajout de l'admin.",
        });
    };

    const reloadAdmins = () => fetchAdmins(setAdmins, setIsLoading);
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!selectedAdmin) return;
        setLoading(true);
        await updateAdmin(
            selectedAdmin.id,
            form,
            reloadAdmins,
            setLoading,
            () => setSelectedAdmin(null) // Ferme le dialog
        );
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                <h1 className="text-xl font-medium text-gray-900">Gestion des admin</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline"><Plus size={16} />Ajouter</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Ajouter un admin</DialogTitle>
                            <DialogDescription>
                                Veuillez renseigner les informations ci-dessous pour ajouter un nouvel admin.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className='max-h-54 overflow-y-auto pr-3 mb-3'>
                                {/* <h1 className="text-lg font-medium text-gray-900 my-2">Informations du client</h1> */}
                                <div className="grid gap-4">
                                    <div className="grid gap-3">
                                        <Label htmlFor="name-1">Nom et prénom(s)</Label>
                                        <Input id="name-1" name="name" value={form.name} onChange={handleChange} required />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" value={form.email} onChange={handleChange} required />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="password">Mot de passe</Label>
                                        <Input id="password" type="password" name="password" value={form.password} onChange={handleChange} required />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="contact">Contact</Label>
                                        <Input id="contact" name="contact" value={form.contact} onChange={handleChange} required />
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
            ) : admins.length === 0 ? (
                <div className='flex flex-col items-center justify-center gap-3 p-3'>
                    <div className="flex items-center justify-center gap-2">
                        <Info className='w-4 h-4 text-red-800' />
                        <span className="ml-2 text-gray-700">Aucun admin enrégistré !</span>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                    {admins.map((ag) => (
                        <div key={ag.id} className="bg-white rounded-xl border border-gray-200 p-3">
                            <div className="flex flex-col items-center justify-between gap-4">
                                <div className="w-18 h-18 bg-green-100 rounded-xl flex items-center justify-center">
                                    <span className="text-xl font-medium text-green-700">
                                        {
                                            (`${ag.name}`).split(' ').map(n => n[0]).join('')
                                        }
                                    </span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-gray-900 mt-1">{ag.name}</p>
                                        <p className="text-sm font-medium text-gray-600">
                                            {ag.contact}
                                        </p>
                                    </div>
                                </div>

                                <div className='flex items-center gap-3'>
                                    {/* ✅ Bouton de suppression avec modal de confirmation */}
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setAdminToDelete(ag);
                                            setOpenn(true);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="cursor-pointer bg-gray-200 text-black hover:bg-gray-300"
                                        onClick={() => {
                                            setSelectedAdmin(ag); // sélectionne l'agent
                                            setForm({              // initialise le formulaire avec les infos existantes
                                                name: ag.name || '',
                                                email: ag.email || '',
                                                contact: ag.contact || '',
                                                password: ag.password || '',     // mot de passe vide par défaut
                                            });
                                        }}
                                    >
                                        <Pen className="w-4 h-4" />
                                    </Button>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Dialog global pour supprimer */}
            <Dialog open={!!adminToDelete} onOpenChange={(open) => !open && setAdminToDelete(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Supprimer l'agent ?</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. L'agent {adminToDelete?.name} sera définitivement supprimé.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAdminToDelete(null)}>Annuler</Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                deleteAgent(adminToDelete.id, reloadAdmins);
                                setAdminToDelete(null);
                            }}
                        >
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog global pour modifier un agent */}
            <Dialog open={!!selectedAdmin} onOpenChange={(open) => !open && setSelectedAdmin(null)}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Modifier l'agent</DialogTitle>
                        <DialogDescription>
                            Modifie les informations de l'agent {selectedAdmin?.name}.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedAdmin && (
                        <form onSubmit={handleUpdate}>
                            <div className="grid gap-4 mb-3">
                                <div className="grid gap-3">
                                    <Label>Nom et prénom(s)</Label>
                                    <Input name="name" value={form.name} onChange={handleChange} required />
                                </div>
                                <div className="grid gap-3">
                                    <Label>Email</Label>
                                    <Input name="email" value={form.email} onChange={handleChange} required />
                                </div>
                                <div className="grid gap-3">
                                    <Label>Mot de passe</Label>
                                    <Input type="password" name="password" value={form.password} onChange={handleChange} />
                                </div>
                                <div className="grid gap-3">
                                    <Label>Contact</Label>
                                    <Input name="contact" value={form.contact} onChange={handleChange} required />
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Annuler</Button>
                                </DialogClose>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Mise à jour..." : "Mettre à jour"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}