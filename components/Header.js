'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    Home,
    Bell,
    ShieldUser,
    Warehouse,
    PartyPopper,
    Newspaper,
    LogOut,
    Slash, // Icône pour le style breadcrumb
    X,
    HandCoins,
    ClipboardList,
    Ticket
} from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useAuth } from '@/lib/AuthContext';
import { useNotifications } from './useNotifications';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Configuration de la navigation
const navigation = [
    { name: 'Vue d\'ensemble', href: '/dashboard/home', icon: Home },
    { name: 'Salles', href: '/dashboard/salle', icon: Warehouse },
    { name: 'Posts', href: '/dashboard/posts', icon: Newspaper },
    { name: 'Évènements', href: '/dashboard/evenements', icon: PartyPopper },
    { name: 'Finance', href: '/dashboard/accounting', icon: HandCoins },
    { name: 'Audit', href: '/dashboard/audit', icon: ClipboardList },
    { name: 'Équipe', href: '/dashboard/users', icon: ShieldUser },
    { name: 'Billetterie', href: '/dashboard/tickets', icon: Ticket },
];

const finance = [
    { name: 'Vue d\'ensemble', href: '/financial/home', icon: Home },
    { name: 'Évènements', href: '/financial/evenements', icon: PartyPopper },
    { name: 'Rapports', href: '/financial/accounting', icon: HandCoins },
];

const editor = [
    { name: 'Vue d\'ensemble', href: '/editor/home', icon: Home },
    { name: 'Contenus', href: '/editor/posts', icon: Newspaper },
];

const assistant = [
    { name: 'Vue d\'ensemble', href: '/dashboard/home', icon: Home },
    { name: 'Évènements', href: '/dashboard/evenements', icon: PartyPopper },
];

export default function Header() {
    const { user, logout, isAdmin, isFinancial, isEditor, isAgent, isAssistant } = useAuth();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [openDrawer, setOpenDrawer] = useState(false);
    const { notifs, nonluCount, markAllAsRead, markAsRead, isLoading: notificationsLoading, error: notificationsError } = useNotifications();

    const isActive = (href) => pathname.startsWith(href);

    const handleLogout = async () => {
        const toastId = toast.loading('Déconnexion...');
        try {
            await logout();
            toast.success('À bientôt !', { id: toastId });
        } catch (error) {
            toast.error('Erreur de déconnexion', { id: toastId });
        }
    };

    useEffect(() => {
        if (user !== undefined) setLoading(false);
    }, [user]);

    // Détermine quelle liste de navigation utiliser
    const currentNav = isAdmin ? navigation : isAssistant ? assistant : isFinancial ? finance : isEditor ? editor : [];

    return (
        <div className="sticky top-0 z-40 w-full border-b border-[#e9e1e4] bg-[#fcf8fb]/95 shadow-[0_1px_10px_rgba(42,24,30,0.045)] backdrop-blur-xl">
            {/* 1. NIVEAU SUPÉRIEUR : Identité & Actions */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-[68px] items-center justify-between">

                    {/* Gauche : Logo + Breadcrumb */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                            <Image
                                alt="Logo CCJAB"
                                src="/images/favicon.png"
                                width={38}
                                height={38}
                                className="h-9 w-9 rounded-lg bg-white p-1 object-contain shadow-sm ring-1 ring-[#e9e1e4]"
                                priority
                            />
                        </Link>

                        {/* Séparateur Slash Vercel */}
                        <Slash className="mx-3 h-5 w-5 -rotate-12 text-[#d7c8c4]" />

                        <div className="flex items-center gap-2">
                            <div className="flex flex-col leading-tight">
                                <span className="font-[Georgia] text-base font-semibold tracking-tight text-[#1b1b1d]">CCJAB</span>
                                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8d7169]">Console · Bouaké</span>
                            </div>

                            {!loading && user && (
                                <Badge variant="outline" className="ml-1 hidden h-5 border-[#e8d9d4] bg-[#f6ece8] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#a93105] sm:flex">
                                    {user.role}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Droite : Notifications & Profile */}
                    <div className="flex items-center gap-3">

                        {/* Notifications */}
                        {!loading && isAgent && (
                            <button
                                type="button"
                                onClick={() => setOpenDrawer(true)}
                                aria-label={`Notifications${nonluCount > 0 ? `, ${nonluCount} non lue${nonluCount === 1 ? '' : 's'}` : ''}`}
                                title="Notifications"
                                className="relative rounded-xl border border-[#e9e1e4] bg-white p-2 text-[#765f58] transition hover:bg-[#f6f3f5] hover:text-[#a93105] focus:outline-none"
                            >
                                <Bell className="w-5 h-5" />
                                {nonluCount > 0 && (
                                    <span className="absolute top-1 right-1 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                )}
                            </button>
                        )}

                        {/* Avatar Menu */}
                        {loading ? (
                                    <div className="h-9 w-9 animate-pulse rounded-full bg-[#f0edef]" />
                        ) : (
                            <Menu as="div" className="relative">
                                <MenuButton className="flex items-center gap-2 focus:outline-none group">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#a93105] text-xs font-bold text-white shadow-sm ring-2 ring-transparent transition-all group-hover:ring-[#fae9e3]">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                </MenuButton>

                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <MenuItems className="absolute right-0 z-50 mt-2 w-60 origin-top-right rounded-xl border border-[#e9e1e4] bg-white py-1 shadow-xl focus:outline-none">
                                        <div className="border-b border-[#f0edef] bg-[#fcf8fb] px-4 py-3">
                                            <p className="truncate text-sm font-bold text-[#1b1b1d]">{user?.name}</p>
                                            <p className="truncate text-xs text-[#8d7169]">{user?.email}</p>
                                        </div>
                                        <div className="p-1">
                                            <MenuItem>
                                                {({ active }) => (
                                                    <button
                                                        onClick={handleLogout}
                                                        className={`${active ? 'bg-gray-50 text-gray-900' : 'text-gray-500'
                                                            } group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm`}
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Se déconnecter
                                                    </button>
                                                )}
                                            </MenuItem>
                                        </div>
                                    </MenuItems>
                                </Transition>
                            </Menu>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. NIVEAU INFÉRIEUR : Navigation avec ICÔNES */}
            {(isAdmin || isAssistant || isFinancial || isEditor || pathname.includes('/agent')) && (
                <div className="border-t border-[#f0edef] bg-[#fcf8fb]">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <nav className="flex gap-1.5 overflow-x-auto py-2 no-scrollbar">

                            {/* Navigation Agent */}
                            {!isAdmin && !isAssistant && !isFinancial && !isEditor && isAgent && (
                                <Link
                                    href="/agent/home"
                                    className={`
                                        whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 flex items-center gap-2
                                        ${pathname.includes('/agent')
                                            ? 'bg-[#a93105] text-white shadow-sm'
                                            : 'text-[#765f58] hover:bg-white hover:text-[#a93105]'
                                        }
                                    `}
                                >
                                    <Home size={16} className={pathname.includes('/agent') ? "text-white" : "text-[#8d7169] group-hover:text-[#a93105]"} />
                                    Accueil Agent
                                </Link>
                            )}

                            {/* Navigation Admin & Finance */}
                            {currentNav.map((item) => {
                                const active = isActive(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`
                                            group whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 flex items-center gap-2
                                            ${active
                                                ? 'bg-[#a93105] text-white shadow-sm'
                                                : 'text-[#765f58] hover:bg-white hover:text-[#a93105]'
                                            }
                                        `}
                                    >
                                        <Icon
                                            size={16}
                                            className={`transition-colors duration-200 ${active ? "text-white" : "text-[#8d7169] group-hover:text-[#a93105]"
                                                }`}
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            )}

            {/* Drawer Notifications (inchangé) */}
            <Dialog open={openDrawer} onClose={setOpenDrawer} className="relative z-50">
                <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-[1px] transition-opacity" />
                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <DialogPanel className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out bg-white shadow-2xl flex flex-col h-full border-l border-gray-100">
                                <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
                                    <DialogTitle className="text-base font-semibold text-gray-900">Notifications</DialogTitle>
                                    <button onClick={() => setOpenDrawer(false)} className="rounded-md p-2 text-gray-400 hover:bg-gray-100">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                {notifs.length > 0 && (
                                    <div className="px-6 py-2 bg-gray-50 border-b border-gray-100 flex justify-end">
                                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs text-gray-600 hover:text-black h-8">
                                            Tout marquer comme lu
                                        </Button>
                                    </div>
                                )}
                                <div className="flex-1 overflow-y-auto p-0">
                                    {notifs.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-6">
                                            <p className="text-gray-500 text-sm">{notificationsLoading ? "Chargement des notifications…" : notificationsError || "Aucune nouvelle notification."}</p>
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-gray-100">
                                            {notifs.map((notif) => (
                                                <li key={notif.id} className={`p-4 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/30' : ''}`}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs font-semibold text-gray-900">Système</span>
                                                        <span className="text-[10px] text-gray-400">
                                                            {new Date(notif.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 leading-snug">{notif.message}</p>
                                                    {!notif.isRead && (
                                                        <button onClick={() => markAsRead(notif.id)} className="mt-2 text-xs text-blue-600 hover:underline">
                                                            Marquer comme lu
                                                        </button>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
