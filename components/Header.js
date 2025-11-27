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
    User,
    CheckCheck,
    X
} from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react';
import { useAuth } from '@/lib/AuthContext';
import { useNotifications } from './useNotifications';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Navigation Configuration
const navigation = [
    { name: 'Dashboard', href: '/dashboard/home', icon: Home },
    { name: 'Salles', href: '/dashboard/salle', icon: Warehouse },
    { name: 'Évènements', href: '/dashboard/evenements', icon: PartyPopper },
    { name: 'Statistiques', href: '/dashboard/accounting', icon: Newspaper },
    { name: 'Utilisateurs', href: '/dashboard/users', icon: ShieldUser },
];

const finance = [
    { name: 'Dashboard', href: '/financial/home', icon: Home },
    { name: 'Évènements', href: '/financial/evenements', icon: PartyPopper },
    { name: 'Statistiques', href: '/financial/accounting', icon: Newspaper },
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

    return (
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex-shrink-0">
                            <Image
                                alt="Logo CCJAB"
                                src="/images/favicon.png"
                                width={40}
                                height={40}
                                className="h-10 w-auto object-contain"
                                priority
                            />
                        </Link>
                        <div className="hidden md:flex flex-col">
                            <span className="text-sm font-bold text-gray-900 leading-none">CCJAB</span>
                            <span className="text-[10px] text-gray-500 font-medium">Gestion Administrative</span>
                        </div>
                        
                        {/* Rôle Badge */}
                        {!loading && user && (
                            <Badge variant="secondary" className="ml-2 hidden sm:flex bg-gray-100 text-gray-600 border-gray-200 capitalize">
                                {user.role?.toLowerCase()}
                            </Badge>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        
                        {/* Notifications Bell */}
                        {!loading && !isAdmin && !isFinancial && (
                            <button
                                onClick={() => setOpenDrawer(true)}
                                className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none"
                            >
                                <Bell className="w-5 h-5" />
                                {nonluCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                    </span>
                                )}
                            </button>
                        )}

                        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />

                        {/* User Menu */}
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse hidden sm:block" />
                            </div>
                        ) : (
                            <Menu as="div" className="relative ml-1">
                                <MenuButton className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200 p-1 hover:bg-gray-50 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden sm:flex flex-col items-start pr-2">
                                        <span className="text-sm font-medium text-gray-700 leading-none">{user?.name?.split(' ')[0]}</span>
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
                                    <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>
                                        <div className="p-1">
                                            {/* <MenuItem>
                                                {({ active }) => (
                                                    <Link
                                                        href="/dashboard/profile"
                                                        className={`${
                                                            active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                                                        } group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm`}
                                                    >
                                                        <User className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                                        Mon Profil
                                                    </Link>
                                                )}
                                            </MenuItem> */}
                                            <MenuItem>
                                                {({ active }) => (
                                                    <button
                                                        onClick={handleLogout}
                                                        className={`${
                                                            active ? 'bg-red-50 text-red-700' : 'text-gray-700'
                                                        } group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm mt-1`}
                                                    >
                                                        <LogOut className={`w-4 h-4 ${active ? 'text-red-500' : 'text-gray-400'}`} />
                                                        Déconnexion
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

                {/* Navigation Bar (Desktop & Scrollable Mobile) */}
                <div className="w-full overflow-x-auto no-scrollbar pb-0">
                    <nav className="flex space-x-1 sm:space-x-4 h-12 items-center">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="h-8 w-24 bg-gray-100 rounded-md animate-pulse" />
                            ))
                        ) : isAdmin ? (
                            navigation.map((item) => {
                                const active = isActive(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`
                                            flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap
                                            ${active 
                                                ? 'bg-green-700 text-white shadow-md' 
                                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                            }
                                        `}
                                    >
                                        <Icon size={16} className={active ? "text-gray-300" : "text-gray-400"} />
                                        {item.name}
                                    </Link>
                                );
                            })
                        ) : isFinancial ? (
                            finance.map((item) => {
                                const active = isActive(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`
                                            flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap
                                            ${active 
                                                ? 'bg-green-700 text-white shadow-md' 
                                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                            }
                                        `}
                                    >
                                        <Icon size={16} className={active ? "text-gray-300" : "text-gray-400"} />
                                        {item.name}
                                    </Link>
                                );
                            })
                        ) : (
                            <Link
                                href="/agent/home"
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                                    pathname.includes('/agent') ? 'bg-green-700 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                <Home size={16} />
                                Accueil Agent
                            </Link>
                        )}
                    </nav>
                </div>
            </div>

            {/* Notification Drawer */}
            <Dialog open={openDrawer} onClose={setOpenDrawer} className="relative z-50">
                <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity" aria-hidden="true" />

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <DialogPanel className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out bg-white shadow-2xl flex flex-col h-full">
                                
                                {/* Drawer Header */}
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                    <div>
                                        <DialogTitle className="text-lg font-semibold text-gray-900">Notifications</DialogTitle>
                                        <p className="text-sm text-gray-500">
                                            Vous avez <span className="font-medium text-indigo-600">{nonluCount}</span> message(s) non lu(s)
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setOpenDrawer(false)}
                                        className="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Actions */}
                                {notifs.length > 0 && (
                                    <div className="px-6 py-3 bg-white border-b border-gray-100 flex justify-end">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={markAllAsRead} 
                                            className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8"
                                        >
                                            <CheckCheck className="w-3 h-3 mr-1.5" />
                                            Tout marquer comme lu
                                        </Button>
                                    </div>
                                )}

                                {/* List */}
                                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/30">
                                    {notifs.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                                            <div className="bg-gray-100 p-4 rounded-full">
                                                <Bell className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 font-medium">Aucune notification pour le moment</p>
                                        </div>
                                    ) : (
                                        <ul className="space-y-3">
                                            {notifs.map((notif) => (
                                                <li 
                                                    key={notif.id} 
                                                    className={`
                                                        relative group rounded-xl p-4 border transition-all duration-200
                                                        ${notif.isRead 
                                                            ? 'bg-white border-gray-200 text-gray-600' 
                                                            : 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-50'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div className="flex items-center gap-2">
                                                            {!notif.isRead && (
                                                                <span className="h-2 w-2 rounded-full bg-indigo-500 block" />
                                                            )}
                                                            <span className={`text-xs font-medium ${notif.isRead ? 'text-gray-400' : 'text-indigo-600'}`}>
                                                                Système
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-gray-400">
                                                            {new Date(notif.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                    </div>
                                                    
                                                    <p className={`text-sm leading-snug ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                                        {notif.message}
                                                    </p>

                                                    {!notif.isRead && (
                                                        <button
                                                            onClick={() => markAsRead(notif.id)}
                                                            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-indigo-600"
                                                            title="Marquer comme lu"
                                                        >
                                                            <CheckCheck className="w-4 h-4" />
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
        </header>
    );
}