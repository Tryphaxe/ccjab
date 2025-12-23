'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, ArrowRight, Music, Mic2, Users, Ticket, Menu, X, Instagram, Facebook, Twitter, Loader, UserCog } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { fetchEvents } from '@/utils/evenWebUtils';
import { formatEventDate } from '@/lib/evenHelper';
const DEFAULT_IMAGE = "/images/default-salle.png";


export default function CulturalCenterHome() {
  const [events, setEvents] = useState([])
  const [isloading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEvents(setEvents, setIsLoading)
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-[85vh] flex items-center">

        {/* Image de fond avec Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Centre_Culturel_Jacques_Aka_de_Bouak%C3%A9_06.jpg/1200px-Centre_Culturel_Jacques_Aka_de_Bouak%C3%A9_06.jpg"
            alt="Centre Culturel Jacques Aka"
            className="w-full h-full object-cover"
          />
          {/* Overlay Gradient : Noir transparent pour lisibilité du texte + Touche verte en bas */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-emerald-900/80"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight drop-shadow-lg">
              L'Art au cœur <br /> de <span className="text-emerald-400 relative inline-block">
                votre vie
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-emerald-500 -z-10 opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>
            <p className="text-xl text-gray-100 mb-10 leading-relaxed drop-shadow-md">
              Découvrez le <strong>Centre Culturel Jacques Aka</strong>, un espace unique dédié à la création, à la performance et à l'échange.
              Concerts, théâtres, expositions : vivez la culture autrement.
            </p>
            <div className="flex justify-center">
              <button className="px-8 py-4 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/20 border border-transparent">
                Voir la programmation <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= AGENDA / ÉVÈNEMENTS ================= */}
      <section id="agenda" className="py-20 bg-emerald-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm">À l'affiche</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Évènements à venir</h2>
            </div>
            <a href="/web/agenda" className="hidden md:flex items-center text-emerald-700 font-semibold hover:underline">
              Tout voir <ArrowRight size={16} className="ml-1" />
            </a>
          </div>



          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {isloading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader className='animate-spin w-6 h-6 mb-3 text-green-600' />
                <span className="font-medium">Chargement des évènements...</span>
              </div>
            ) : events.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-20'>
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <UserCog className='w-8 h-8 text-gray-400' />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Aucun évènement !</h3>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-100 hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={event.image ? event.image : DEFAULT_IMAGE}
                      alt={event.type}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm">
                      <span className="text-emerald-700 font-bold text-sm">{event.type}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                      <Calendar size={16} className="text-emerald-600" />
                      <span dangerouslySetInnerHTML={{ __html: formatEventDate(event.date_debut, event.date_fin) }}/>
                      <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
                      <MapPin size={16} className="text-emerald-600" />
                      <span className="truncate">{event.salle.nom_salle}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                      {event.categorie}
                    </h3>

                    <div className="flex justify-between items-center">
                      <span className="text-sm italic text-gray-600">{event.description}</span>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50">
                      <span className="text-sm italic text-gray-600">Appelez-nous pour plus d'informations !</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 text-center md:hidden">
            <button className="text-emerald-700 font-bold border border-emerald-200 px-6 py-3 rounded-full w-full">
              Voir tous les évènements
            </button>
          </div>
        </div>
      </section>

      {/* ================= STATS / BANNER ================= */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">500+</div>
              <div className="text-gray-400">Évènements par an</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">50k</div>
              <div className="text-gray-400">Visiteurs</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">3</div>
              <div className="text-gray-400">Salles équipées</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">100%</div>
              <div className="text-gray-400">Culture</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section id="espaces" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Un lieu aux multiples facettes</h2>
            <p className="text-gray-600">Que vous soyez artiste, entreprise ou spectateur, nous avons l'espace qu'il vous faut.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl hover:bg-emerald-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-emerald-600">
                <Mic2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Salles de Spectacle</h3>
              <p className="text-gray-600 mb-4">Une acoustique parfaite pour vos concerts, pièces de théâtre et conférences. Capacité modulable.</p>
              <a href="/web/espaces" className="text-emerald-700 font-semibold text-sm hover:underline">En savoir plus</a>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl hover:bg-emerald-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-emerald-600">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Séminaires & Ateliers</h3>
              <p className="text-gray-600 mb-4">Des espaces lumineux et équipés pour vos réunions d'entreprise, formations et workshops.</p>
              <a href="/web/espaces" className="text-emerald-700 font-semibold text-sm hover:underline">En savoir plus</a>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl hover:bg-emerald-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-emerald-600">
                <Ticket size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Espace Détente</h3>
              <p className="text-gray-600 mb-4">Un café culturel et des espaces de coworking pour rencontrer d'autres passionnés.</p>
              <a href="/web/espaces" className="text-emerald-700 font-semibold text-sm hover:underline">En savoir plus</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}