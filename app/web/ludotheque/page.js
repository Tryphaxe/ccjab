'use client';

import React from 'react';
import { Gamepad2, Puzzle, Users, Brain, Smile, Trophy, Star, Heart } from 'lucide-react';

export default function LudothequePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-20 bg-emerald-600 text-white overflow-hidden">
        {/* Motifs ludiques en arrière-plan */}
        <div className="absolute top-10 left-10 text-emerald-500/30 animate-pulse"><Puzzle size={120} /></div>
        <div className="absolute bottom-10 right-10 text-emerald-500/30 animate-bounce delay-700"><Gamepad2 size={100} /></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-sm font-bold mb-6 backdrop-blur-md shadow-lg">
            <Smile size={18} />
            <span>Éveil & Divertissement</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-md">
            La Ludothèque
          </h1>
          <p className="text-xl text-emerald-50 max-w-3xl mx-auto leading-relaxed font-medium">
            Un espace de jeu pour grandir, créer et partager. Découvrez notre collection de jeux éducatifs et récréatifs pour tous les âges.
          </p>
        </div>
      </section>

      {/* ================= PRÉSENTATION ================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-emerald-100 rounded-full blur-2xl opacity-50"></div>
            <img 
              src="https://images.unsplash.com/vector-1738325063780-d211d6d2edde?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Enfants jouant à des jeux de société" 
              className="relative rounded-3xl shadow-2xl rotate-2 hover:rotate-0 transition-all duration-500 border-4 border-white"
            />
            {/* Badge flottant */}
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
              <div className="bg-yellow-100 p-2 rounded-full text-yellow-600"><Trophy size={24} /></div>
              <div>
                <p className="font-bold text-gray-900">Pour tous</p>
                <p className="text-xs text-gray-500">Enfants, Jeunes & Adultes</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Bien plus que du simple jeu
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              La ludothèque propose un cadre d’éveil et de divertissement unique. À travers une large sélection de jeux éducatifs et récréatifs, nous offrons un terrain d'exploration pour l'imaginaire.
            </p>
            <p className="text-gray-600 leading-relaxed">
              C'est un lieu de rencontre intergénérationnel où le plaisir de jouer se mêle à l'apprentissage. Que ce soit pour une partie d'échecs stratégique, un jeu de construction ou un jeu de société en famille, chacun y trouve sa place.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
               <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Jeux de société
               </div>
               <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Jeux de construction
               </div>
               <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Puzzles & Casse-têtes
               </div>
               <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Jeux symboliques
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= OBJECTIFS (Bénéfices) ================= */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Objectifs Pédagogiques</h2>
            <p className="text-gray-600">
              Le jeu est un outil puissant pour le développement personnel et social. Voici ce que nous encourageons au quotidien :
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Carte 1 : Cognitif */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-b-4 border-blue-500">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Brain size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Développement Cognitif</h3>
              <p className="text-gray-600 text-center text-sm">
                Stimuler la mémoire, la logique et la concentration à travers des défis adaptés à chaque âge. Apprendre à résoudre des problèmes en s'amusant.
              </p>
            </div>

            {/* Carte 2 : Créativité */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-b-4 border-purple-500">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Puzzle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Créativité & Imaginaire</h3>
              <p className="text-gray-600 text-center text-sm">
                Offrir un espace de liberté où l'enfant peut inventer des histoires, construire des mondes et exprimer sa personnalité sans contrainte.
              </p>
            </div>

            {/* Carte 3 : Vivre-ensemble */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-b-4 border-emerald-500">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Vivre-ensemble</h3>
              <p className="text-gray-600 text-center text-sm">
                Favoriser la cohésion sociale, le respect des règles et l'écoute de l'autre. Le jeu rassemble les enfants, les jeunes et les adultes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PUBLIC CIBLE & APPEL À L'ACTION ================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-900 rounded-3xl overflow-hidden relative text-white p-12 text-center">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                <div className="flex justify-center mb-4">
                    <Heart className="text-pink-500 fill-pink-500 animate-pulse" size={48} />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">Un espace ouvert à tous</h2>
                <p className="text-emerald-100 text-lg">
                    Que vous soyez un enfant curieux, un jeune en quête de défis ou un adulte souhaitant retrouver son âme d'enfant, la ludothèque du Centre Culturel Jacques Aka vous ouvre ses portes.
                </p>
                {/* <button className="bg-white text-emerald-900 px-8 py-4 rounded-full font-bold hover:bg-emerald-50 transition-colors shadow-lg hover:scale-105 transform duration-200">
                    Venir jouer maintenant
                </button> */}
            </div>
        </div>
      </section>

    </div>
  );
}