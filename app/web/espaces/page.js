'use client';

import React, { useState } from 'react';
import { 
  Music, Menu, X, MapPin, Users, Maximize, CheckCircle2, 
  Wifi, Mic2, Projector, Armchair, Coffee, ArrowRight, Star,
  Facebook, Instagram, Twitter, Mail, Phone
} from 'lucide-react';

// --- DONNÉES DES ESPACES ---
const SPACES = [
  {
    id: 1,
    name: "Grand Auditorium Jacques Aka",
    category: "Spectacle",
    capacity: "600 places",
    surface: "450 m²",
    image: "https://images.unsplash.com/photo-1503095392233-1789d2740452?q=80&w=2000&auto=format&fit=crop",
    description: "Le joyau du centre. Une salle majestueuse avec une acoustique étudiée pour les concerts, pièces de théâtre et grandes cérémonies.",
    features: ["Sonorisation Pro", "Régie Lumière", "Loges Artistes", "Climatisation"],
    price: "Sur devis"
  },
  {
    id: 2,
    name: "Salle des Conférences",
    category: "Réunion",
    capacity: "100 places",
    surface: "120 m²",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2000&auto=format&fit=crop",
    description: "Espace professionnel modulable, idéal pour vos séminaires, formations d'entreprise et conseils d'administration.",
    features: ["Vidéoprojecteur HD", "Wifi Haut Débit", "Paperboard", "Sonorisation conférence"],
    price: "150.000 FCFA / jour"
  },
  {
    id: 3,
    name: "L'Esplanade Verte",
    category: "Extérieur",
    capacity: "1000+ personnes",
    surface: "800 m²",
    image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2000&auto=format&fit=crop",
    description: "Un grand espace en plein air pour les festivals, foires gastronomiques et grands rassemblements populaires.",
    features: ["Podium mobile", "Éclairage nocturne", "Accès traiteur", "Parking dédié"],
    price: "Sur devis"
  },
  {
    id: 4,
    name: "Espace Foyer & Cocktail",
    category: "Réception",
    capacity: "200 debout",
    surface: "150 m²",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2000&auto=format&fit=crop",
    description: "Un cadre élégant et lumineux pour vos vernissages, cocktails dînatoires et pauses café.",
    features: ["Bar équipé", "Mange-debout", "Décoration florale", "Vestiaire"],
    price: "100.000 FCFA / demi-journée"
  },
  {
    id: 5,
    name: "Studio de Répétition",
    category: "Spectacle",
    capacity: "20 places",
    surface: "50 m²",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop",
    description: "L'espace de travail des artistes. Parquet au sol, miroirs muraux et insonorisation pour la danse et le théâtre.",
    features: ["Miroirs", "Barres de danse", "Piano", "Système son Bluetooth"],
    price: "10.000 FCFA / heure"
  }
];

const FEATURES_LIST = [
  { icon: Wifi, label: "Wifi Gratuit" },
  { icon: Armchair, label: "Sièges Confort" },
  { icon: Projector, label: "Vidéo Pro" },
  { icon: Mic2, label: "Sonorisation" },
  { icon: Coffee, label: "Espace Traiteur" },
  { icon: CheckCircle2, label: "Sécurité 24/7" },
];

export default function EspacesPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Tout');

  const categories = ['Tout', 'Spectacle', 'Réunion', 'Extérieur', 'Réception'];

  const filteredSpaces = activeCategory === 'Tout' 
    ? SPACES 
    : SPACES.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* ================= HEADER HERO ================= */}
      <section className="relative pt-32 pb-20 bg-gray-900 overflow-hidden">
        {/* Image de fond subtile */}
        <div className="absolute inset-0 opacity-40">
            <img 
                src="https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxDqbSdEdKyDnwVpmVT8y7Q4iNeG_1P88PMC1JJTnTDelI6A6BsZnR4sirINd3fXxGW8GmgmoXyqwrphCtqHPar2swBEqf0fOib-R0dw_kSKbQVnRz-qTX0FnHzlAJzz68BJLgNmb777YUw=s1360-w1360-h1020-rw" 
                alt="Architecture background" 
                className="w-full h-full object-cover grayscale"
            />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-emerald-900/60"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-4">
            Locations & Privatisations
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Des espaces conçus pour <br/> <span className="text-emerald-400">sublimer vos événements</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Du séminaire intimiste au concert grand public, le Centre Culturel Jacques Aka met à votre disposition des infrastructures modernes et modulables.
          </p>
        </div>
      </section>

      {/* ================= FILTRES ================= */}
      <section className="py-10 border-b border-gray-100 sticky top-20 bg-white/95 backdrop-blur z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-3">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            activeCategory === cat
                            ? 'bg-gray-900 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </section>

      {/* ================= LISTE DES ESPACES ================= */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSpaces.map((space) => (
              <div key={space.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col">
                
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                    <img 
                        src={space.image} 
                        alt={space.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                        <Maximize size={12} /> {space.surface}
                    </div>
                </div>

                {/* Contenu */}
                <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                         <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide bg-emerald-50 px-2 py-1 rounded-md">
                            {space.category}
                        </span>
                        <div className="flex items-center text-gray-500 text-sm">
                            <Users size={16} className="mr-1.5 text-emerald-600" />
                            {space.capacity}
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                        {space.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-6 leading-relaxed flex-1">
                        {space.description}
                    </p>

                    {/* Équipements */}
                    <div className="mb-6">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Équipements inclus</h4>
                        <div className="flex flex-wrap gap-2">
                            {space.features.slice(0, 3).map((feature, idx) => (
                                <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                                    <CheckCircle2 size={12} className="mr-1 text-emerald-600" />
                                    {feature}
                                </span>
                            ))}
                            {space.features.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-gray-400 text-xs font-medium">
                                    +{space.features.length - 3}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="pt-5 border-t border-gray-100 flex items-center justify-between mt-auto">
                        <span className="text-sm font-bold text-gray-900">
                            {space.price}
                        </span>
                        <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors">
                            Réserver <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= COMMODITÉS GÉNÉRALES ================= */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">Tout pour votre confort</h2>
                <p className="text-gray-500 mt-2">Nos infrastructures répondent aux standards internationaux.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                {FEATURES_LIST.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center text-center group">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                            <item.icon size={32} strokeWidth={1.5} />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* ================= CTA RÉSERVATION ================= */}
      <section className="py-20 bg-emerald-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <Star className="w-12 h-12 text-yellow-400 mx-auto mb-6 fill-current" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Prêt à organiser votre événement ?</h2>
            <p className="text-emerald-100 text-lg mb-10 leading-relaxed">
                Notre équipe événementielle est à votre écoute pour vous conseiller et établir un devis sur mesure. 
                Disponibilité, configuration de salle, traiteur : nous gérons tout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-white text-emerald-900 rounded-full font-bold hover:bg-gray-100 transition-all shadow-xl">
                    Demander un devis
                </button>
                <button className="px-8 py-4 bg-emerald-800 text-white border border-emerald-700 rounded-full font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                    <Phone size={18} /> Nous appeler
                </button>
            </div>
        </div>
      </section>
    </div>
  );
}