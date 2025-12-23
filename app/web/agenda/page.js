'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar, MapPin, Search, Filter, Music, Mic2, Ticket,
  Menu, X, ChevronRight, Clock, Info, Facebook, Instagram, Twitter
} from 'lucide-react';
import { fetchEvents } from '@/utils/evenWebUtils';

export default function AgendaPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('Tout');
  const [searchTerm, setSearchTerm] = useState('');
  const [isloading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEvents(setEvents, setIsLoading)
  }, []);


  // --- FILTRAGE ---
  const types = ['Tout', 'Concert', 'Théâtre', 'Exposition', 'Atelier', 'Cinéma'];

  const filteredEvents = events.filter(event => {
    const matchesTypes = filter === 'Tout' || event.type === filter;
    const matchesSearch = event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTypes && matchesSearch;
  });

  // Fonction pour formater la date joliment (ex: "25 NOV")
  const formatDateCard = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('fr-FR', { month: 'short' }).toUpperCase().replace('.', ''),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* ================= HEADER AGENDA ================= */}
      <div className="relative bg-emerald-900 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {/* Motif de fond abstrait */}
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="#10b981" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Programmation Culturelle</h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            Retrouvez tous les concerts, spectacles, expositions et ateliers du Centre Jacques Aka.
          </p>
        </div>
      </div>

      {/* ================= BARRE DE FILTRES ================= */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">

            {/* Recherche */}
            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un évènement..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Catégories (Scroll horizontal sur mobile) */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
              {types.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === cat
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= LISTE DES ÉVÈNEMENTS ================= */}
      <section className="py-12 bg-gray-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-500">Chargement de l'agenda...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Aucun évènement trouvé</h3>
              <p className="text-gray-500 mt-2">Essayez de modifier vos filtres de recherche.</p>
              <button onClick={() => { setFilter('Tout'); setSearchTerm('') }} className="mt-4 text-emerald-600 font-bold hover:underline">
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => {
                const dateData = formatDateCard(event.date_debut);
                return (
                  <div key={event.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-300 hover:-translate-y-1">

                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.type}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {/* Badge Catégorie */}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-emerald-700 shadow-sm uppercase tracking-wide">
                        {event.type}
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="flex flex-1 p-6 relative">

                      {/* Date Block */}
                      <div className="flex flex-col items-center justify-center bg-emerald-50 text-emerald-800 rounded-xl w-16 h-16 shrink-0 mr-4 border border-emerald-100">
                        <span className="text-xs font-bold uppercase">{dateData.month}</span>
                        <span className="text-xl font-black leading-none">{dateData.day}</span>
                      </div>

                      <div className="flex flex-col flex-1 justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">
                            {event.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Clock size={14} className="mr-1.5 text-emerald-600" />
                            {dateData.time}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <MapPin size={14} className="mr-1.5 text-emerald-600" />
                            {event.salle.nom_salle}
                          </div>
                          {event.description && (
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                              {event.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between">
                          <button className="text-sm font-semibold text-gray-900 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Détails <ChevronRight size={16} className="text-emerald-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination (Visuelle) */}
          {/* {filteredEvents.length > 0 && (
            <div className="mt-12 flex justify-center">
              <button className="px-6 py-3 border border-gray-200 rounded-full text-gray-600 font-semibold hover:bg-white hover:shadow-md transition-all">
                Charger plus d'évènements
              </button>
            </div>
          )} */}

        </div>
      </section>
    </div>
  );
}