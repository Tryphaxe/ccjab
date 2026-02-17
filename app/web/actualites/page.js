'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Search,
    User,
    Clock,
    Mail,
    ArrowRight,
    Facebook,
    Instagram,
    Twitter,
    Loader2,
    Megaphone
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

// --- CONFIGURATION ---
const DEFAULT_IMAGE = "/images/default-salle.png"; // Image par défaut si pas de média

// Fonction utilitaire pour détecter les vidéos
const isVideo = (url) => {
    return url && url.match(/\.(mp4|webm|ogg|mov)($|\?)/i);
};

export default function ActualitePage() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    // --- CHARGEMENT DES DONNÉES RÉELLES ---
    useEffect(() => {
        fetch('/api/web/post?type=ACTU')
            .then(res => res.json())
            .then(data => {
                // On s'assure que data est un tableau
                if (Array.isArray(data)) {
                    setPosts(data);
                } else {
                    setPosts([]);
                }
            })
            .catch(err => console.error("Erreur chargement actualités:", err))
            .finally(() => setIsLoading(false));
    }, []);

    // --- LOGIQUE DE FILTRAGE ---
    const filteredPosts = posts.filter(post => {
        const searchLower = searchTerm.toLowerCase();
        const titleMatch = post.titre.toLowerCase().includes(searchLower);
        const contentMatch = post.contenu && post.contenu.toLowerCase().includes(searchLower);
        return titleMatch || contentMatch;
    });

    // --- LOGIQUE "À LA UNE" (FEATURED) ---
    // On prend le premier article marqué "isPromoted", sinon le tout premier de la liste
    const featuredPost = filteredPosts.find(p => p.isPromoted) || filteredPosts[0];

    // La liste principale exclut l'article à la une pour ne pas le montrer deux fois
    const listPosts = featuredPost
        ? filteredPosts.filter(p => p.id !== featuredPost.id)
        : [];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

            {/* ================= EN-TÊTE (HERO) ================= */}
            <section className="bg-emerald-900 text-white pt-32 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-800 opacity-20 pattern-grid-lg"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Le Journal du Centre</h1>
                    <p className="text-emerald-200 text-lg max-w-2xl mx-auto">
                        L'actualité culturelle de Bouaké en temps réel. Découvrez nos reportages, interviews et annonces exclusives.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* ================= COLONNE PRINCIPALE ================= */}
                    <div className="lg:w-2/3">

                        {/* Barre de recherche mobile */}
                        <div className="lg:hidden mb-8 relative">
                            <input
                                type="text"
                                placeholder="Rechercher un article..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        </div>

                        {/* CHARGEMENT */}
                        {isLoading && (
                            <div className="space-y-8">
                                <Skeleton className="h-96 w-full rounded-2xl" />
                                <div className="grid md:grid-cols-2 gap-8">
                                    <Skeleton className="h-80 w-full rounded-2xl" />
                                    <Skeleton className="h-80 w-full rounded-2xl" />
                                </div>
                            </div>
                        )}

                        {/* VIDE */}
                        {!isLoading && filteredPosts.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900">Aucune actualité trouvée</h3>
                                <p className="text-gray-500">Essayez un autre mot-clé.</p>
                            </div>
                        )}

                        {/* CONTENU RÉEL */}
                        {!isLoading && filteredPosts.length > 0 && (
                            <>
                                {/* --- ARTICLE À LA UNE --- */}
                                {featuredPost && (
                                    <div
                                        className="mb-12 group cursor-pointer relative"
                                        onClick={() => router.push(`/web/actualites/${featuredPost.id}`)}
                                    >
                                        <div className="relative h-80 md:h-[450px] rounded-2xl overflow-hidden shadow-lg bg-gray-900">
                                            {featuredPost.mediaUrl ? (
                                                isVideo(featuredPost.mediaUrl) ? (
                                                    <video src={featuredPost.mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                                ) : (
                                                    <img src={featuredPost.mediaUrl} alt={featuredPost.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" />
                                                )
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-emerald-800 text-emerald-200">
                                                    <Megaphone size={64} opacity={0.5} />
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                                            <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white w-full">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <span className="bg-emerald-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3 inline-block">
                                                            À la une
                                                        </span>
                                                        <h2 className="text-2xl md:text-4xl font-bold mb-3 leading-tight group-hover:text-emerald-400 transition-colors line-clamp-2">
                                                            {featuredPost.titre}
                                                        </h2>
                                                        <div className="flex items-center gap-4 text-sm text-gray-300">
                                                            <span className="flex items-center gap-1"><User size={14} /> Administration</span>
                                                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(featuredPost.createdAt).toLocaleDateString('fr-FR')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- LISTE DES ARTICLES STANDARDS --- */}
                                <div className="grid md:grid-cols-2 gap-8">
                                    {listPosts.map((post) => (
                                        <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">

                                            {/* Media */}
                                            <div className="h-48 overflow-hidden relative bg-gray-100">
                                                {post.mediaUrl ? (
                                                    isVideo(post.mediaUrl) ? (
                                                        <video src={post.mediaUrl} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <img src={post.mediaUrl} alt={post.titre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    )
                                                ) : (
                                                    <img src={DEFAULT_IMAGE} alt="Défaut" className="w-full h-full object-cover opacity-50" />
                                                )}
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-emerald-800 text-xs font-bold px-3 py-1 rounded-md shadow-sm">
                                                    Actualité
                                                </div>
                                            </div>

                                            {/* Contenu Textuel */}
                                            <div className="p-6 flex flex-col flex-grow">
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                                    <Calendar size={12} className="text-emerald-600" /> {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                                                    {post.contenu && (
                                                        <>
                                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                            <Clock size={12} className="text-emerald-600" />
                                                            {Math.max(1, Math.round(post.contenu.length / 500))} min
                                                        </>
                                                    )}
                                                </div>

                                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2">
                                                    {post.titre}
                                                </h3>

                                                <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                                                    {post.contenu || "Aucun contenu disponible pour cet article."}
                                                </p>

                                                {/* Note: Pour l'instant le lien est inactif car nous n'avons pas de page détail */}
                                                <div className="mt-auto pt-4 border-t border-gray-50">
                                                    <button
                                                        onClick={() => router.push(`/web/actualites/${post.id}`)}
                                                        className="inline-flex items-center text-emerald-600 font-semibold text-sm cursor-pointer hover:underline bg-transparent border-none p-0"
                                                    >
                                                        Lire l'article <ArrowRight size={16} className="ml-1" />
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </>
                        )}

                    </div>

                    {/* ================= SIDEBAR (Barre Latérale) ================= */}
                    <aside className="lg:w-1/3 space-y-8">

                        {/* Widget Recherche (Desktop) */}
                        <div className="hidden lg:block bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Rechercher</h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Mots-clés..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            </div>
                        </div>

                        {/* Widget Catégories (Statique pour l'instant) */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-emerald-500 pl-3">Rubriques</h3>
                            <ul className="space-y-2">
                                <li className="text-sm flex justify-between items-center p-2 rounded-lg bg-emerald-50 text-emerald-700 font-medium">
                                    <span>Actualités</span>
                                    <span className="bg-emerald-200 text-emerald-800 text-xs py-0.5 px-2 rounded-full">{posts.length}</span>
                                </li>
                                <li className="text-sm flex justify-between items-center p-2 rounded-lg text-gray-500 cursor-not-allowed opacity-50">
                                    <span>Concerts (Bientôt)</span>
                                </li>
                                <li className="text-sm flex justify-between items-center p-2 rounded-lg text-gray-500 cursor-not-allowed opacity-50">
                                    <span>Théâtre (Bientôt)</span>
                                </li>
                            </ul>
                        </div>

                        {/* Widget Réseaux Sociaux */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Suivez-nous</h3>
                            <div className="flex justify-center gap-4">
                                <a href="#" className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all"><Facebook size={20} /></a>
                                <a href="#" className="p-3 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-600 hover:text-white transition-all"><Instagram size={20} /></a>
                                <a href="#" className="p-3 bg-sky-50 text-sky-500 rounded-full hover:bg-sky-500 hover:text-white transition-all"><Twitter size={20} /></a>
                            </div>
                        </div>

                    </aside>
                </div>
            </div>
        </div>
    );
}