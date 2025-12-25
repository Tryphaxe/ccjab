'use client';

import React, { useEffect, useState } from 'react';
import {
  Music, Menu, X, MapPin, Users, Maximize, CheckCircle2,
  Wifi, Mic2, Projector, Armchair, Coffee, ArrowRight, Star,
  Facebook, Instagram, Twitter, Mail, Phone,
  UserCog
} from 'lucide-react';
import { fetchSalles } from '@/utils/salleWebUtils';
import { fetchCommodites } from '@/utils/commoditeUtils';
import { Skeleton } from '@/components/ui/skeleton';

export default function EspacesPage() {
  const [salles, setSalles] = useState([])
  const [commodites, setCommodites] = useState([])
  const [isloading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSalles(setSalles, setIsLoading);
    fetchCommodites(setCommodites, setIsLoading);
  }, []);
  const DEFAULT_IMAGE = "/images/default-salle.png";

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
            Des espaces conçus pour <br /> <span className="text-emerald-400">sublimer vos événements</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Du séminaire intimiste au concert grand public, le Centre Culturel Jacques Aka met à votre disposition des infrastructures modernes et modulables.
          </p>
        </div>
      </section>

      {/* ================= LISTE DES ESPACES ================= */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isloading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex flex-col space-y-3">
                  <Skeleton className="h-[250px] w-[360px] rounded-xl bg-gray-200" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[360px] bg-gray-200" />
                    <Skeleton className="h-4 w-[300px] bg-gray-200" />
                  </div>
                </div>
              ))
            ) : salles.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-20 bg-white rounded-lg'>
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <UserCog className='w-8 h-8 text-gray-800' />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">Aucune salle disponible !</h3>
              </div>
            ) : (
              salles.map((space) => (
                <div key={space.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col">

                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={space.image || DEFAULT_IMAGE}
                      alt={space.name || "DEFAULT_IMAGE"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                      <Maximize size={12} />Grand public
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Users size={16} className="mr-1.5 text-emerald-600" />
                        {space.nombre_place}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                      {space.nom_salle}
                    </h3>

                    {/* Équipements */}
                    <div className="mb-6">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Équipements inclus</h4>
                      <div className="flex flex-wrap gap-2">
                        {space.commodites.length > 0 ? (
                          space.commodites?.map((item) => (
                            <span key={item.commodite.id} className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                              <CheckCircle2 size={12} className="mr-1 text-emerald-600" />
                              {item.commodite?.nom}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">Aucun équipement spécifié !</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-5 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <span className="text-sm font-bold text-gray-900">
                        Sur devis
                      </span>
                      <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors">
                        Appelez-nous <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
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
            {commodites.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center text-center group">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <CheckCircle2 size={32} strokeWidth={1.5} />
                </div>
                <span className="font-semibold text-gray-900 text-sm">{item.nom}</span>
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
            <button className="px-8 py-4 bg-emerald-800 text-white border border-emerald-700 rounded-full font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
              <Phone size={18} /> Nous appeler
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}