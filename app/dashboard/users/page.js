"use client";

import React, { useState, useEffect } from 'react'
import {
    Info,
    Pen,
    Plus,
    Trash2,
    Loader,
    Search,
    User,
    Mail,
    Phone,
    Shield,
    Lock,
    UserCog
} from 'lucide-react';
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
    TableCell,
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
import { Badge } from "@/components/ui/badge"
import { deleteUser, submitForm, fetchUsers, updateUser } from '@/utils/userUtils';


// Composant de formulaire réutilisable (pour éviter la duplication de code)
const UserFormFields = React.memo(({ form, handleChange, handleSelectChange, selectedUser }) => (
    <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="role" className="text-xs font-medium text-gray-500">Rôle & Permissions</Label>
                <Select value={form.role} onValueChange={(value) => handleSelectChange("role", value)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                        <SelectItem value="AGENT">Agent</SelectItem>
                        <SelectItem value="FINANCIER">Financier</SelectItem>
                        <SelectItem value="EDITOR">Éditeur</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-medium text-gray-500">Nom complet</Label>
                <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input id="name" name="name" className="pl-9" value={form.name} onChange={handleChange} required />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="contact" className="text-xs font-medium text-gray-500">Téléphone</Label>
                <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input id="contact" name="contact" className="pl-9" value={form.contact} onChange={handleChange} required />
                </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email" className="text-xs font-medium text-gray-500">Adresse Email</Label>
                <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input id="email" name="email" type="email" className="pl-9" value={form.email} onChange={handleChange} required />
                </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="password" className="text-xs font-medium text-gray-500">Mot de passe</Label>
                <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input id="password" name="password" type="password" className="pl-9" value={form.password} onChange={handleChange} required={!selectedUser} placeholder={selectedUser ? "Laisser vide pour ne pas changer" : "••••••••"} />
                </div>
            </div>
        </div>
    </div>
));


export default function UsersPage() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [users, setUsers] = useState([])
    const [isloading, setIsLoading] = useState(true)
    const [loading, setLoading] = useState(false)
    const [isAddOpen, setIsAddOpen] = useState(false);

    // État du formulaire
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

    const reloadUsers = () => fetchUsers(setUsers, setIsLoading);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await submitForm({
            data: form,
            setLoading,
            reload: reloadUsers,
            successMessage: "Utilisateur ajouté avec succès.",
            errorMessage: "Erreur lors de l'ajout.",
        });
        setIsAddOpen(false);
        // Reset form
        setForm({ name: '', contact: '', email: '', password: '', role: '' });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        setLoading(true);
        await updateUser(
            selectedUser.id,
            form,
            reloadUsers,
            setLoading,
            () => setSelectedUser(null)
        );
    };

    // Helper pour le badge de rôle
    const RoleBadge = ({ role }) => {
        switch (role) {
            case "ADMIN":
                return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200 shadow-none">Administrateur</Badge>;
            case "FINANCIER":
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 shadow-none">Financier</Badge>;
            case "AGENT":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 shadow-none">Agent</Badge>;
            case "EDITEUR":
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 shadow-none">Éditeur</Badge>;
            default:
                return <Badge variant="outline" className="text-gray-500">{role}</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 text-gray-900">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Équipe & Utilisateurs</h1>
                        <p className="text-sm text-gray-500 mt-1">Gérez les accès et les rôles de vos collaborateurs.</p>
                    </div>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20">
                                <Plus className="w-4 h-4 mr-2" /> Ajouter un membre
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Nouveau Membre</DialogTitle>
                                <DialogDescription>Ajoutez un nouvel utilisateur et définissez ses permissions.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit}>
                                <UserFormFields
                                    form={form}
                                    handleChange={handleChange}
                                    handleSelectChange={handleSelectChange}
                                    selectedUser={selectedUser} />
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline" type="button">Annuler</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={loading}>
                                        {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                        Créer le compte
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {isloading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Loader className='animate-spin w-6 h-6 mb-3 text-green-600' />
                            <span className="font-medium">Chargement des utilisateurs...</span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-20'>
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                <UserCog className='w-8 h-8 text-gray-400' />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Aucun utilisateur</h3>
                            <p className="text-gray-500 max-w-sm text-center mt-1">
                                Il n'y a pas encore d'utilisateurs enregistrés dans le système.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="w-[80px] text-center">Avatar</TableHead>
                                    <TableHead>Identité</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="text-center">
                                            <div className="mx-auto w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 uppercase shadow-sm">
                                                {user.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900">{user.name}</span>
                                                <span className="text-xs text-gray-500">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone size={14} className="text-gray-400" />
                                                {user.contact}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <RoleBadge role={user.role} />
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setForm({
                                                            name: user.name || '',
                                                            email: user.email || '',
                                                            contact: user.contact || '',
                                                            password: '', // On ne pré-remplit pas le password par sécurité
                                                            role: user.role || '',
                                                        });
                                                    }}
                                                >
                                                    <Pen size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => setUserToDelete(user)}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* --- MODALES --- */}

                {/* Delete Confirmation */}
                <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle className="text-red-600 flex items-center gap-2">
                                <Shield className="w-5 h-5" /> Suppression d'accès
                            </DialogTitle>
                            <DialogDescription className="pt-2">
                                Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete?.name}</strong> ?<br />
                                Cette action révoquera immédiatement ses accès.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-2">
                            <Button variant="outline" onClick={() => setUserToDelete(null)}>Annuler</Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    deleteUser(userToDelete.id, reloadUsers);
                                    setUserToDelete(null);
                                }}
                            >
                                Confirmer la suppression
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Modifier l'utilisateur</DialogTitle>
                            <DialogDescription>Mettez à jour les informations de {selectedUser?.name}.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate}>
                            <UserFormFields
                                form={form}
                                handleChange={handleChange}
                                handleSelectChange={handleSelectChange}
                                selectedUser={selectedUser} />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button">Annuler</Button>
                                </DialogClose>
                                <Button type="submit" disabled={loading}>
                                    {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : "Enregistrer"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    )
}