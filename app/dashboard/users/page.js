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
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteUser, submitForm, fetchUsers, updateUser } from '@/utils/userUtils';

export default function page() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [open, setOpen] = useState(false);
    const [openn, setOpenn] = useState(false);
    const [users, setUsers] = useState([])
    const [isloading, setIsLoading] = useState(true)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: '',
        contact: '',
        email: '',
        password: '',
        role: '',
    });
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSelectChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    useEffect(() => {
        fetchUsers(setUsers, setIsLoading);
    }, []);

    // Fonction pour enregistrer un nouveau departement
    const handleSubmit = async (e) => {
        e.preventDefault();
        await submitForm({
            data: form,
            setLoading,
            reload: () => fetchUsers(setUsers, setIsLoading),
            successMessage: "Utilisateur ajouté avec succès.",
            errorMessage: "Erreur lors de l'ajout de l'utilisateur.",
        });
    };

    const reloadUsers = () => fetchUsers(setUsers, setIsLoading);
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        setLoading(true);
        await updateUser(
            selectedUser.id,
            form,
            reloadUsers,
            setLoading,
            () => setSelectedUser(null) // Ferme le dialog
        );
    };

    const getRole = (role) => {
        switch (role) {
            case "AGENT":
                return "text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium";
            case "ADMIN":
                return "text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium";
            case "FINANCIER":
                return "text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium";
            default:
                return "";
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4 pb-2">
                <h1 className="text-xl font-medium text-gray-900">Gestion des utilisateurs</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline"><Plus size={16} />Ajouter</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Ajouter un utilisateur</DialogTitle>
                            <DialogDescription>
                                Veuillez renseigner les informations ci-dessous pour ajouter un nouvel utilisateur.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className='max-h-54 overflow-y-auto pr-3 mb-3'>
                                {/* <h1 className="text-lg font-medium text-gray-900 my-2">Informations du client</h1> */}
                                <div className="grid gap-4">
                                    <div className="grid gap-4">
                                        <Select
                                            value={form.role}
                                            onValueChange={(value) => handleSelectChange("role", value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Rôle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel> Choisissez le rôle</SelectLabel>
                                                    <SelectItem key="1" value="ADMIN">
                                                        Admin
                                                    </SelectItem>
                                                    <SelectItem key="2" value="AGENT">
                                                        Agent
                                                    </SelectItem>
                                                    <SelectItem key="3" value="FINANCIER">
                                                        Financier
                                                    </SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
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
            ) : users.length === 0 ? (
                <div className='flex flex-col items-center justify-center gap-3 p-3'>
                    <div className="flex items-center justify-center gap-2">
                        <Info className='w-4 h-4 text-red-800' />
                        <span className="ml-2 text-gray-700">Aucun utilisateur enrégistré !</span>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className=""></TableHead>
                                <TableHead className="">Nom et prénom(s)</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((ag) => {
                                return (
                                    <TableRow key={ag.id}>
                                        <TableCell className="font-medium flex items-center">
                                            <span className="text-lg uppercase flex items-center justify-center w-10 h-10 font-medium text-gray-700 bg-gray-100 rounded-lg">
                                                {
                                                    (`${ag.name}`).split(' ').map(n => n[0]).join('')
                                                }
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {ag.name}
                                        </TableCell>
                                        <TableCell>{ag.contact}</TableCell>
                                        <TableCell>{ag.email}</TableCell>
                                        <TableCell><span className={getRole(ag.role)}>{ag.role}</span></TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            {/* ✅ Bouton de suppression avec modal de confirmation */}
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setUserToDelete(ag);
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
                                                    setSelectedUser(ag); // sélectionne l'agent
                                                    setForm({              // initialise le formulaire avec les infos existantes
                                                        name: ag.name || '',
                                                        email: ag.email || '',
                                                        contact: ag.contact || '',
                                                        password: ag.password || '',     // mot de passe vide par défaut
                                                        role: ag.role || '',
                                                    });
                                                }}
                                            >
                                                <Pen className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Dialog global pour supprimer */}
            <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Supprimer l'utilisateur ?</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. L'utilisateur {userToDelete?.name} sera définitivement supprimé.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUserToDelete(null)}>Annuler</Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                deleteUser(userToDelete.id, reloadUsers);
                                setUserToDelete(null);
                            }}
                        >
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog global pour modifier un agent */}
            <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Modifier l'utilisateur</DialogTitle>
                        <DialogDescription>
                            Modifie les informations de l'utilisateur {selectedUser?.name}.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <form onSubmit={handleUpdate}>
                            <div className="grid gap-4 mb-3">
                                <div className="grid gap-4">
                                    <Select
                                        value={form.role}
                                        onValueChange={(value) => handleSelectChange("role", value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Rôle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel> Choisissez le rôle</SelectLabel>
                                                <SelectItem key="1" value="ADMIN">
                                                    Admin
                                                </SelectItem>
                                                <SelectItem key="2" value="AGENT">
                                                    Agent
                                                </SelectItem>
                                                <SelectItem key="3" value="FINACIER">
                                                    Financier
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
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