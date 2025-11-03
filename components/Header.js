'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Home, Bell, ShieldUser, Warehouse, HatGlasses, PartyPopper, BellIcon, CheckCircleIcon } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/AuthContext';
import { useNotifications } from './useNotifications';

const navigation = [
	{ name: 'Dashboard', href: '/dashboard/home', icon: Home },
	{ name: 'Salle', href: '/dashboard/salle', icon: Warehouse },
	{ name: 'Agent', href: '/dashboard/agent', icon: HatGlasses },
	{ name: 'Evènements', href: '/dashboard/evenements', icon: PartyPopper },
	{ name: 'Admin', href: '/dashboard/admin', icon: ShieldUser },
];

function classNames(...classes) {
	return classes.filter(Boolean).join(' ');
}

export default function Header() {
	const { user, logout, isAdmin } = useAuth();
	const pathname = usePathname();
	const [loading, setLoading] = useState(true);
	const [openDra, setOpenDra] = useState(false);
	const { notifs, nonluCount, markAllAsRead, markAsRead } = useNotifications();

	const isActive = (href) => pathname.startsWith(href);

	const handleLogout = async () => {
		const toastId = toast.loading('Déconnexion en cours...');
		try {
			await logout();
			toast.success('Déconnecté avec succès ✅', { id: toastId });
		} catch (error) {
			toast.error('Erreur lors de la déconnexion ❌', { id: toastId });
			console.error(error);
		}
	};

	useEffect(() => {
		if (user !== undefined) setLoading(false);
	}, [user]);

	return (
		<div className="bg-white sticky top-0 z-40 border-b border-gray-200">
			{/* Top bar */}
			<div className="w-full px-5">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center gap-4">
						<Image
							alt="ccjab logo"
							src="/images/favicon.png"
							width={100}
							height={100}
							className="h-12 w-auto"
						/>
						<div className="flex items-center gap-3 pl-4 border-l border-gray-200">
							<p className="text-sm font-medium text-gray-900">CCJAB</p>
							<div className="bg-green-100 px-3 py-1 rounded-full flex items-center justify-center">
								<p className="text-sm text-black capitalize">{user?.role}</p>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-2">
						{/* Bouton notifications pour agents seulement */}
						{loading ? (
							<div className="h-10 w-10 bg-gray-300 rounded-full animate-pulse" />
						) : !isAdmin ? (
							<button
								onClick={() => setOpenDra(true)}
								className="px-2 py-2 cursor-pointer relative border border-gray-200 rounded-full transition-all bg-white text-black hover:bg-gray-100"
							>
								<Bell className="w-5 h-5" />
								{nonluCount > 0 && (
									<span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
										{nonluCount}
									</span>
								)}
							</button>
						) : (
							<span className="block text-md font-semibold text-green-700">{user?.name}</span>
						)}

						{/* Profile dropdown */}
						<div className="flex items-center pl-2 border-l border-gray-200">
							{/* Profile dropdown */}
							<Menu as="div" className="relative">
								<MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800">
									<span className="absolute -inset-1.5" />
									<span className="sr-only">OpenDra user menu</span>
									<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
										<span className="text-sm font-medium text-green-700">
											{
												(`${user?.name}`).split(' ').map(n => n[0]).join('')
											}
										</span>
									</div>
								</MenuButton>

								<MenuItems
									transition
									className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
								>
									<MenuItem>
										<span className="block px-4 py-2 text-sm text-green-700 data-focus:bg-gray-100 data-focus:outline-hidden">
											{user ? user.name : ""}
										</span>
									</MenuItem>
									<MenuItem>
										<span className="block px-4 py-2 text-sm text-green-800 data-focus:bg-gray-100 data-focus:outline-hidden">
											{user ? user.email : "----------------------"}
										</span>
									</MenuItem>
									<MenuItem>
										<button
											type='button'
											onClick={handleLogout}
											className="block w-full px-4 py-2 text-md font-bold cursor-pointer bg-red-100 text-red-700 data-focus:bg-gray-100 data-focus:outline-hidden"
										>
											Déconnexion
										</button>
									</MenuItem>
								</MenuItems>
							</Menu>
						</div>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<div className="w-full px-5">
				<div className="flex items-center overflow-hidden h-full">
					<div className="flex items-center h-full space-x-4 overflow-x-auto whitespace-nowrap scrollable">
						{loading ? (
							Array(5).fill(0).map((_, i) => (
								<div key={i} className="flex flex-col items-center justify-center gap-2 mt-4">
									<div className="h-5 w-20 bg-gray-300 rounded animate-pulse mb-2" />
								</div>
							))
						) : isAdmin ? (
							navigation.map((item) => {
								const Icon = item.icon;
								return (
									<div key={item.name} className="flex flex-col items-center justify-center transition-all duration-150">
										<Link
											href={item.href}
											aria-current={isActive(item.href) ? 'page' : undefined}
											className="flex items-center mb-1 rounded-lg gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
										>
											<Icon size={16} />
											{item.name}
										</Link>
										<span
											className={classNames(
												isActive(item.href) ? 'border-green-600 text-green-800 font-semibold' : 'border-none',
												'border w-full transition-all duration-150'
											)}
										/>
									</div>
								);
							})
						) : (
							<div className="flex flex-col items-center justify-center transition-all duration-150">
								<Link
									href="/agent/home"
									className="flex items-center mb-1 rounded-lg gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
								>
									<Home size={16} />
									Accueil
								</Link>
								<span className="border-green-600 text-green-800 font-semibold border w-full transition-all duration-150" />
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Drawer notifications */}
			<div className="z-50">
				<Dialog open={openDra} onClose={setOpenDra} className="relative z-50">
					<DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity duration-300" />

					<div className="fixed inset-0 overflow-hidden">
						<div className="absolute inset-0 overflow-hidden">
							<div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
								<DialogPanel className="pointer-events-auto relative w-screen max-w-md transform transition-all duration-500 ease-in-out bg-white shadow-xl">
									<TransitionChild>
										<div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2">
											<button
												type="button"
												onClick={() => setOpenDra(false)}
												className="relative rounded-md text-gray-300 hover:text-gray-600 focus:outline-hidden"
											>
												<span className="sr-only">Fermer</span>
												<XMarkIcon aria-hidden="true" className="size-6" />
											</button>
										</div>
									</TransitionChild>

									{/* Contenu du drawer */}
									<div className="flex h-full flex-col overflow-y-auto py-6">
										<div className="px-4 sm:px-6 flex items-center justify-between">
											<DialogTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
												<BellIcon className="w-5 h-5 text-indigo-500" />
												<span className="text-2xl">Notifications</span>
											</DialogTitle>
											{nonluCount > 0 && (
												<span className="text-sm bg-indigo-100 text-indigo-700 font-medium px-2 py-1 rounded-full">
													{nonluCount} non lue{nonluCount > 1 && "s"}
												</span>
											)}
										</div>

										<div className="relative mt-6 flex-1 px-4 sm:px-6">
											{/* Bouton tout marquer comme lu */}
											<div className="flex mb-3">
												<button
													onClick={markAllAsRead}
													className="text-md p-2 rounded-md w-full bg-green-50 border border-green-300 text-green-600 hover:bg-green-100 hover:text-green-700 transition-colors duration-500"
												>
													Tout marquer comme lu
												</button>
											</div>

											{/* Liste des notifications */}
											<div className="flex flex-col space-y-2">
												{notifs.length === 0 ? (
													<p className="text-sm text-gray-500">Aucune notification</p>
												) : (
													notifs.map((notif) => (
														<div
															key={notif.id}
															className={`flex items-start justify-between p-3 border rounded-md ${notif.isRead
																? "bg-gray-50 border-gray-200"
																: "bg-indigo-50 border-indigo-200"
																}`}
														>
															<div>
																<p
																	className={`text-sm ${notif.isRead ? "text-gray-600" : "text-indigo-700 font-medium"
																		}`}
																>
																	{notif.message}
																</p>
																<p className="text-xs text-gray-400 mt-1">
																	{new Date(notif.created_at).toLocaleString("fr-FR", {
																		dateStyle: "short",
																		timeStyle: "short",
																	})}
																</p>
															</div>

															{!notif.isRead && (
																<button
																	onClick={() => markAsRead(notif.id)}
																	className="text-gray-400 hover:text-green-600 transition"
																>
																	<CheckCircleIcon className="w-5 h-5" />
																</button>
															)}
														</div>
													))
												)}
											</div>
										</div>
									</div>
								</DialogPanel>
							</div>
						</div>
					</div>
				</Dialog>
			</div>
		</div>
	);
}