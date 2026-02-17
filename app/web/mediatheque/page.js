'use client';

import React from 'react';
import { BookOpen, Search, Monitor, Library, Coffee, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function MediathequePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-20 bg-emerald-950 text-white overflow-hidden">
        {/* Motif de fond subtil */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/90 to-black/60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/50 border border-emerald-700 text-emerald-300 text-sm font-medium mb-6 backdrop-blur-sm">
            <Library size={16} />
            <span>Savoir & Culture</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            La Médiathèque
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Un espace privilégié dédié à la lecture, à la recherche et à l'apprentissage autonome au cœur de Bouaké.
          </p>
        </div>
      </section>

      {/* ================= PRÉSENTATION & FONDS DOCUMENTAIRE ================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-12 h-1 bg-emerald-500 rounded-full block"></span>
                Un fonds documentaire varié
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                La médiathèque met à la disposition du public une collection riche et diversifiée. Que vous soyez étudiant, chercheur ou simplement passionné de lecture, vous y trouverez votre bonheur.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-emerald-100 p-1 rounded-full text-emerald-600"><CheckCircle2 size={16} /></div>
                  <span className="text-gray-700"><strong>Ouvrages variés :</strong> Romans, essais, documentaires et littérature jeunesse.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-emerald-100 p-1 rounded-full text-emerald-600"><CheckCircle2 size={16} /></div>
                  <span className="text-gray-700"><strong>Ressources éducatives :</strong> Manuels scolaires et parascolaires pour accompagner les élèves.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-emerald-100 p-1 rounded-full text-emerald-600"><CheckCircle2 size={16} /></div>
                  <span className="text-gray-700"><strong>Culture générale :</strong> Revues, journaux et magazines d'actualité.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <button className="bg-gray-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2">
                Consulter le catalogue <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Image Illustration */}
          <div className="relative h-[450px] rounded-3xl overflow-hidden shadow-2xl group">
             <img 
              src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1000&auto=format&fit=crop" 
              alt="Intérieur de la médiathèque" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
                <p className="font-bold text-lg">Un cadre propice à l'étude</p>
            </div>
          </div>

        </div>
      </section>

      {/* ================= RESSOURCES NUMÉRIQUES ================= */}
      <section className="py-20 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm">Innovation</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">Bibliothèque Numérique 2.0</h2>
            <p className="text-gray-600">
              Le Centre Culturel Jacques Aka s'adapte à l'ère du numérique en offrant l'accès à des plateformes de recherche de renommée internationale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Carte Youscribe */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5"><Monitor size={100} /></div>
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">YouScribe</h3>
              <p className="text-gray-600 mb-6">
                Accédez à des milliers d'ebooks, livres audio, documents de presse et partitions musicales en illimité. Une bibliothèque géante dans votre poche.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Lecture streaming</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Presse</span>
              </div>
            </div>

            {/* Carte Cairn.info */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5"><Search size={100} /></div>
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Cairn.info</h3>
              <p className="text-gray-600 mb-6">
                La référence pour les sciences humaines et sociales. Consultez des revues académiques, des ouvrages de recherche et des articles encyclopédiques de pointe.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Recherche</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Universitaire</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ESPACE DE TRAVAIL ================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 rounded-3xl overflow-hidden text-white relative">
          <div className="absolute inset-0 bg-emerald-900/30"></div>
          
          <div className="grid md:grid-cols-2">
            <div className="p-10 md:p-16 flex flex-col justify-center relative z-10">
              <h2 className="text-3xl font-bold mb-6">Un espace d'apprentissage autonome</h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Au-delà des ressources, la médiathèque offre un cadre calme et studieux, idéal pour la concentration. C'est l'endroit parfait pour préparer un examen, rédiger un mémoire ou simplement s'évader à travers les pages d'un roman.
              </p>
              <div className="flex gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800 rounded-lg text-emerald-400"><Coffee size={20} /></div>
                  <span className="font-medium">Cadre Confortable</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-gray-800 rounded-lg text-emerald-400"><Monitor size={20} /></div>
                  <span className="font-medium">Accès Internet</span>
                </div>
              </div>
            </div>
            
            <div className="h-full min-h-[300px] bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center relative">
              <div className="absolute inset-0 bg-gradient-to-l from-gray-900 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}