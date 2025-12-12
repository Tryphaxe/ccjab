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
    X
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
    { name: 'Évènements', href: '/dashboard/evenements', icon: PartyPopper },
    { name: 'Finance', href: '/dashboard/accounting', icon: Newspaper },
    { name: 'Équipe', href: '/dashboard/users', icon: ShieldUser },
];

const finance = [
    { name: 'Vue d\'ensemble', href: '/financial/home', icon: Home },
    { name: 'Évènements', href: '/financial/evenements', icon: PartyPopper },
    { name: 'Rapports', href: '/financial/accounting', icon: Newspaper },
];

export default function Header() {
    const { user, logout, isAdmin, isFinancial } = useAuth();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [openDrawer, setOpenDrawer] = useState(false);
    const { notifs, nonluCount, markAllAsRead, markAsRead } = useNotifications();

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
    const currentNav = isAdmin ? navigation : isFinancial ? finance : [];

    return (
        <div className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
            {/* 1. NIVEAU SUPÉRIEUR : Identité & Actions */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    
                    {/* Gauche : Logo + Breadcrumb */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                             <Image
                                alt="Logo CCJAB"
                                src="/images/favicon.png"
                                width={32}
                                height={32}
                                className="h-8 w-8 object-contain"
                                priority
                            />
                        </Link>
                        
                        {/* Séparateur Slash Vercel */}
                        <Slash className="mx-3 h-5 w-5 text-gray-300 transform -rotate-12" />
                        
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 tracking-tight">CCJAB</span>
                            
                            {!loading && user && (
                                <Badge variant="outline" className="hidden sm:flex ml-2 border-gray-200 bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 h-5">
                                    {user.role}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Droite : Notifications & Profile */}
                    <div className="flex items-center gap-4">
                        
                        {/* Notifications */}
                        {!loading && !isAdmin && !isFinancial && (
                            <button
                                onClick={() => setOpenDrawer(true)}
                                className="relative p-1.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 focus:outline-none"
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
                            <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
                        ) : (
                            <Menu as="div" className="relative">
                                <MenuButton className="flex items-center gap-2 focus:outline-none group">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 flex items-center justify-center text-white text-xs font-medium shadow-sm ring-2 ring-transparent group-hover:ring-gray-100 transition-all">
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
                                    <MenuItems className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100">
                                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/30">
                                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>
                                        <div className="p-1">
                                            <MenuItem>
                                                {({ active }) => (
                                                    <button
                                                        onClick={handleLogout}
                                                        className={`${
                                                            active ? 'bg-gray-50 text-gray-900' : 'text-gray-500'
                                                        } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm`}
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
            {(isAdmin || isFinancial || pathname.includes('/agent')) && (
                <div className="border-t border-gray-100 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <nav className="flex -mb-px space-x-6 overflow-x-auto no-scrollbar">
                            
                            {/* Navigation Agent */}
                            {!isAdmin && !isFinancial && (
                                <Link
                                    href="/agent/home"
                                    className={`
                                        whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium transition-colors duration-200 flex items-center gap-2
                                        ${pathname.includes('/agent')
                                            ? 'border-black text-black' 
                                            : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
                                        }
                                    `}
                                >
                                    <Home size={16} className={pathname.includes('/agent') ? "text-black" : "text-gray-400 group-hover:text-gray-600"} />
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
                                            group whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium transition-colors duration-200 flex items-center gap-2
                                            ${active 
                                                ? 'border-black text-black' 
                                                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
                                            }
                                        `}
                                    >
                                        <Icon 
                                            size={16} 
                                            className={`transition-colors duration-200 ${
                                                active ? "text-black" : "text-gray-400 group-hover:text-gray-600"
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
                                            <p className="text-gray-500 text-sm">Aucune nouvelle notification.</p>
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