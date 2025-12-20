'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, MapPin, Search, Filter, Music, Mic2, Ticket, 
  Menu, X, ChevronRight, Clock, Info, Facebook, Instagram, Twitter 
} from 'lucide-react';
// import { createClient } from '@/utils/supabase/client'; // Assurez-vous que ce chemin est correct

// --- DONNÉES DE DÉMONSTRATION (Pour l'UI avant le fetch réel) ---
const MOCK_EVENTS = [
  {
    id: 1,
    title: "Festival des Griots Modernes",
    category: "Concert",
    date_debut: "2024-11-15T18:00:00",
    image: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=2000&auto=format&fit=crop",
    price: 5000,
    location: "Grand Théâtre",
    description: "Une soirée inoubliable mêlant kora traditionnelle et rythmes électroniques."
  },
  {
    id: 2,
    title: "Exposition : Racines & Futur",
    category: "Exposition",
    date_debut: "2024-11-20T09:00:00",
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2000&auto=format&fit=crop",
    price: 0,
    location: "Hall Principal",
    description: "L'art contemporain ivoirien s'expose. Entrée libre pour tous."
  },
  {
    id: 3,
    title: "Le Malade Imaginaire",
    category: "Théâtre",
    date_debut: "2024-11-22T20:00:00",
    image: "https://images.unsplash.com/photo-1507676184212-d037095485aa?q=80&w=2000&auto=format&fit=crop",
    price: 10000,
    location: "Salle 2",
    description: "La troupe du Soleil revisite le classique de Molière avec une touche locale."
  },
  {
    id: 4,
    title: "Atelier d'Écriture Slam",
    category: "Atelier",
    date_debut: "2024-11-25T14:00:00",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=2000&auto=format&fit=crop",
    price: 2000,
    location: "Bibliothèque",
    description: "Apprenez à poser vos mots et votre voix avec le slameur K-Plume."
  },
];

export default function AgendaPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [events, setEvents] = useState(MOCK_EVENTS); // Remplacez MOCK_EVENTS par [] pour le vrai fetch
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('Tout');
  const [searchTerm, setSearchTerm] = useState('');

  // --- LOGIQUE SUPABASE (Décommentez pour utiliser la vraie DB) ---
  /*
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const { data, error } = await supabase
        .from('Even')
        .select(`
          id,
          description,
          montant,
          date_debut,
          type,
          salle:salle_id (nom_salle)
        `)
        .gte('date_debut', new Date().toISOString()) // Seulement les événements futurs
        .order('date_debut', { ascending: true });

      if (error) console.error(error);
      else {
        // Transformation des données pour l'affichage
        const formattedEvents = data.map(ev => ({
          id: ev.id,
          title: ev.description || "Évènement Culturel", // Si pas de titre dédié, on utilise la desc ou un type
          category: ev.type || "Divers",
          date_debut: ev.date_debut,
          image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30", // Placeholder ou image de la DB
          price: ev.montant || 0,
          location: ev.salle?.nom_salle || "Centre Culturel",
          description: ev.description
        }));
        setEvents(formattedEvents);
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);
  */

  // --- FILTRAGE ---
  const categories = ['Tout', 'Concert', 'Théâtre', 'Exposition', 'Atelier', 'Cinéma'];

  const filteredEvents = events.filter(event => {
    const matchesCategory = filter === 'Tout' || event.category === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
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
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    filter === cat 
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
              <button onClick={() => {setFilter('Tout'); setSearchTerm('')}} className="mt-4 text-emerald-600 font-bold hover:underline">
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
                        alt={event.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {/* Badge Catégorie */}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-emerald-700 shadow-sm uppercase tracking-wide">
                        {event.category}
                      </div>
                      {/* Badge Prix */}
                      <div className="absolute bottom-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                        {event.price === 0 ? 'GRATUIT' : `${event.price.toLocaleString()} FCFA`}
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
                             {event.location}
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
                          <button className="bg-gray-900 hover:bg-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-gray-900/10">
                            Réserver
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
          {filteredEvents.length > 0 && (
            <div className="mt-12 flex justify-center">
              <button className="px-6 py-3 border border-gray-200 rounded-full text-gray-600 font-semibold hover:bg-white hover:shadow-md transition-all">
                Charger plus d'évènements
              </button>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}