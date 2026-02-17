'use client';

import React from 'react';
import { History, Target, Lightbulb, Users, BookOpen, Sparkles, Building2, ArrowRight } from 'lucide-react';

export default function HistoriquePage() {
    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">

            {/* ================= HERO SECTION ================= */}
            <section className="relative pt-32 pb-20 bg-emerald-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-emerald-900/90"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/50 border border-emerald-700 text-emerald-300 text-sm font-medium mb-6">
                        <History size={16} />
                        <span>Depuis 1974</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                        Notre Histoire & <span className="text-emerald-400">Héritage</span>
                    </h1>
                    <p className="text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed">
                        Plus qu’un simple espace physique, le Centre Culturel Jacques Aka est un lieu de vie, de création, de transmission et d’innovation culturelle.
                    </p>
                </div>
            </section>

            {/* ================= ORIGINES & JACQUES AKA ================= */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-16 items-center">

                    {/* Bloc Texte */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="w-12 h-1 bg-emerald-500 rounded-full block"></span>
                                Les Origines
                            </h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                Inauguré le <strong className="text-emerald-700">16 février 1974</strong>, le Centre Culturel Jacques Aka est né de la volonté des autorités publiques de doter la ville de Bouaké d’un espace structurant dédié à la promotion des arts, de la culture et du savoir.
                            </p>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                Depuis sa création, il s’est imposé comme un acteur majeur du dynamisme socioculturel dans la région du Gbêkê.
                            </p>
                        </div>

                        <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Users size={120} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Qui était Jacques Aka ?</h3>
                            <p className="text-gray-700 relative z-10">
                                Le centre porte son nom en hommage à une personnalité engagée dans la valorisation de la culture et du patrimoine ivoirien. À travers cette dénomination, le Centre perpétue un héritage fondé sur la <strong>transmission, l’excellence et l’ouverture</strong>.
                            </p>
                        </div>
                    </div>

                    {/* Bloc Image (Placeholder) */}
                    <div className="relative h-[500px] bg-gray-200 rounded-3xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500">
                        {/* Remplacez src par une vraie photo d'archive ou du bâtiment */}
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Centre_Culturel_Jacques_Aka_de_Bouak%C3%A9_06.jpg/1200px-Centre_Culturel_Jacques_Aka_de_Bouak%C3%A9_06.jpg"
                            alt="Centre Culturel Jacques Aka Historique"
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                            <p className="text-white font-medium">Le Centre, un pilier culturel à Bouaké.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= NOS MISSIONS ================= */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Missions</h2>
                        <p className="text-gray-600">
                            Fidèle à sa mission originelle, le Centre œuvre chaque jour pour une culture inclusive, accessible et porteuse de développement pour toute la communauté.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Mission 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                                <Target size={28} />
                            </div>
                            <h3 className="font-bold text-lg mb-3">Accès pour tous</h3>
                            <p className="text-gray-600 text-sm">Favoriser l’accès à la culture pour tous, sans distinction, au cœur de Bouaké.</p>
                        </div>

                        {/* Mission 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                                <Sparkles size={28} />
                            </div>
                            <h3 className="font-bold text-lg mb-3">Création Artistique</h3>
                            <p className="text-gray-600 text-sm">Encourager la création et l’expression artistique sous toutes ses formes.</p>
                        </div>

                        {/* Mission 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                                <BookOpen size={28} />
                            </div>
                            <h3 className="font-bold text-lg mb-3">Éducation</h3>
                            <p className="text-gray-600 text-sm">Promouvoir la lecture, l’éducation et la formation continue des jeunes et adultes.</p>
                        </div>

                        {/* Mission 4 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                                <Users size={28} />
                            </div>
                            <h3 className="font-bold text-lg mb-3">Cohésion Sociale</h3>
                            <p className="text-gray-600 text-sm">Servir de cadre d’échanges, de dialogue et de renforcement du lien social.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= VISION & FUTUR ================= */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gray-900 rounded-3xl overflow-hidden relative text-white">
                    {/* Background décoratif */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-900/20 transform skew-x-12 translate-x-20"></div>

                    <div className="grid lg:grid-cols-2 gap-12 p-8 md:p-16 relative z-10 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-sm">
                                <Lightbulb size={18} />
                                <span>Perspective</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold">Une vision tournée vers l’avenir</h2>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                Soucieux de répondre aux besoins croissants des populations, le Centre s’inscrit dans une dynamique de modernisation et d’extension.
                            </p>
                            <p className="text-gray-400 leading-relaxed">
                                Le <strong>nouveau Centre Culturel Jacques Aka</strong> ambitionne de proposer des infrastructures plus modernes et des équipements adaptés aux standards contemporains. Cette évolution permettra de renforcer l’offre culturelle et de positionner le Centre comme un pôle stratégique de rayonnement à Bouaké et au-delà.
                            </p>
                            <div className="pt-4">
                                <a href="/web/contact" className="inline-flex items-center bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-full font-semibold transition-colors">
                                    Nous soutenir <ArrowRight size={18} className="ml-2" />
                                </a>
                            </div>
                        </div>

                        <div className="relative h-80 lg:h-96 bg-gray-800 rounded-2xl border border-gray-700 flex flex-col items-center justify-center overflow-hidden p-8 group">
                            <div className="absolute inset-0 bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                            <img
                                src="/images/favicon.png"
                                alt="Logo Centre Culturel Jacques Aka"
                                className="w-32 h-32 md:w-48 md:h-48 object-contain mb-6 drop-shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500"
                            />
                            <p className="text-gray-400 font-medium text-center relative z-10">Le carrefour ideal de l'expression culturelle à Bouaké !</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}