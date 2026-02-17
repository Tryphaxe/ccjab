'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, MapPin, ArrowRight, Mic2, Users, Ticket, Megaphone, UserCog, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { fetchEvents } from '@/utils/evenWebUtils';
import { formatEventDate } from '@/lib/evenHelper';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';

const DEFAULT_IMAGE = "/images/default-salle.png";

// Fonction utilitaire pour détecter si c'est une vidéo
const isVideo = (url) => {
  return url && url.match(/\.(mp4|webm|ogg|mov)($|\?)/i);
};

export default function CulturalCenterHome() {
  const router = useRouter();
  const [events, setEvents] = useState([])
  const [posts, setPosts] = useState([]);
  const [isloading, setIsLoading] = useState(true)
  const [promotedPosts, setPromotedPosts] = useState([]);

  const now = new Date();
  const futureEvents = events.filter(event => {
    // Sécurité pour éviter les erreurs si la date est manquante
    if (!event.date_fin) return false; 
    
    const endDate = new Date(event.date_fin);
    return event.visible && endDate > now;
});

  // --- CONFIG CARROUSEL ÉVÈNEMENTS ---
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const carouselEvents = futureEvents.slice(0, 5);

  // --- CONFIG CARROUSEL PUBLICITÉS ---
  const [adsRef, adsApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1
  });

  const scrollAdsPrev = useCallback(() => {
    if (adsApi) adsApi.scrollPrev();
  }, [adsApi]);

  const scrollAdsNext = useCallback(() => {
    if (adsApi) adsApi.scrollNext();
  }, [adsApi]);

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    fetchEvents(setEvents, setIsLoading);

    // Récupérer les pubs
    fetch('/api/web/post?type=PUB&promoted=true')
      .then(res => res.json())
      .then(data => setPromotedPosts(data))
      .catch(err => console.error(err));

    // Récupérer les actus
    fetch('/api/web/post?type=ACTU')
      .then(res => res.json())
      .then(data => setPosts(data))
      .finally(() => setIsLoading(false));
  }, []);

  const redirect = () => {
    router.push('/web/espaces');
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Centre_Culturel_Jacques_Aka_de_Bouak%C3%A9_06.jpg/1200px-Centre_Culturel_Jacques_Aka_de_Bouak%C3%A9_06.jpg"
            alt="Centre Culturel Jacques Aka"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-emerald-900/80"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight drop-shadow-lg">
              L'Art de rassembler, <br /> la <span className="text-emerald-400 relative inline-block">
                culture de partager
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-emerald-500 -z-10 opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>
            <p className="text-xl text-gray-100 mb-10 leading-relaxed drop-shadow-md">
              Le <strong>Centre Culturel Jacques Aka</strong>, lieu d'innovation et de diversité culturelles.
            </p>
            <div className="flex justify-center">
              <button onClick={redirect} className="px-8 py-4 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-xl border border-transparent">
                Voir la programmation <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION PUBLICITÉS (Image ou Vidéo) ================= */}
      {promotedPosts.length > 0 && (
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Megaphone className="text-emerald-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">À la une</h2>
              </div>
              {promotedPosts.length > 1 && (
                <div className="flex gap-2">
                  <button onClick={scrollAdsPrev} className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"><ChevronLeft size={20} /></button>
                  <button onClick={scrollAdsNext} className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"><ChevronRight size={20} /></button>
                </div>
              )}
            </div>

            <div className="relative group">
              <div className="overflow-hidden" ref={adsRef}>
                <div className="flex -ml-6">
                  {promotedPosts.map((pub) => (
                    <div key={pub.id} className="flex-[0_0_100%] md:flex-[0_0_50%] pl-6 min-w-0">
                      <div className="relative rounded-2xl overflow-hidden shadow-lg group h-64 md:h-80 w-full bg-black">
                        {/* GESTION VIDÉO / IMAGE POUR LES PUBS */}
                        {pub.mediaUrl ? (
                          isVideo(pub.mediaUrl) ? (
                            <video
                              src={pub.mediaUrl}
                              className="w-full h-full object-cover"
                              autoPlay
                              muted
                              loop
                              playsInline
                            />
                          ) : (
                            <img src={pub.mediaUrl} alt={pub.titre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          )
                        ) : (
                          <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">Pas d'image</div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 pointer-events-none">
                          <h3 className="text-white text-xl font-bold mb-1">{pub.titre}</h3>
                          {pub.contenu && <p className="text-gray-200 text-sm line-clamp-2">{pub.contenu}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= AGENDA / ÉVÈNEMENTS ================= */}
      <section id="agenda" className="py-20 bg-emerald-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm">À l'affiche</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Évènements à venir</h2>
            </div>
            <div className="hidden md:flex gap-2">
              <button onClick={scrollPrev} className="p-2 rounded-full border border-emerald-200 hover:bg-emerald-100 text-emerald-700 transition-colors"><ChevronLeft size={24} /></button>
              <button onClick={scrollNext} className="p-2 rounded-full border border-emerald-200 hover:bg-emerald-100 text-emerald-700 transition-colors"><ChevronRight size={24} /></button>
            </div>
          </div>

          {isloading ? (
            <div className="flex gap-6 overflow-hidden">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex-none w-[300px] md:w-[350px] flex flex-col space-y-3">
                  <Skeleton className="h-[250px] w-full rounded-xl bg-gray-200" />
                  <div className="space-y-2"><Skeleton className="h-4 w-full bg-gray-200" /><Skeleton className="h-4 w-3/4 bg-gray-200" /></div>
                </div>
              ))}
            </div>
          ) : carouselEvents.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-20'>
              <div className="bg-gray-50 p-4 rounded-full mb-4"><UserCog className='w-8 h-8 text-gray-400' /></div>
              <h3 className="text-lg font-semibold text-gray-300">Aucun évènement !</h3>
            </div>
          ) : (
            <div className="relative group">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex -ml-6 py-4">
                  {carouselEvents.map((event) => (
                    <div key={event.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-6 min-w-0">
                      <div className="group/card bg-white h-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-100 hover:-translate-y-1 transition-all duration-300">
                        <div className="relative h-64 overflow-hidden">
                          <img src={event.image ? event.image : DEFAULT_IMAGE} alt={event.type} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm">
                            <span className="text-emerald-700 font-bold text-sm">{event.type}</span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                            <Calendar size={16} className="text-emerald-600" />
                            <span dangerouslySetInnerHTML={{ __html: formatEventDate(event.date_debut, event.date_fin) }} />
                            <MapPin size={16} className="text-emerald-600 ml-2" />
                            <span className="truncate max-w-[100px]">{event.salle.nom_salle}</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover/card:text-emerald-700 transition-colors line-clamp-1">{event.categorie}</h3>
                          <p className="text-sm italic text-gray-600 line-clamp-2 mb-4">{event.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="mt-8 text-center">
            <a href="/web/agenda" className="inline-flex items-center text-white font-semibold bg-emerald-500 px-4 py-2 rounded-full hover:bg-emerald-800 transition-all">Tout voir <ArrowRight size={16} className="ml-1" /></a>
          </div>
        </div>
      </section>

      {/* ================= ACTUALITÉS (Image ou Vidéo) ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Actualités</h1>
          <p className="text-gray-600">Les dernières nouvelles du Centre Culturel Jacques Aka.</p>
        </div>

        {isloading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-red-500">Aucune actualité pour le moment !</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-12">
            {posts.map(post => (
              <article key={post.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                {post.mediaUrl && (
                  <div className="h-48 overflow-hidden bg-gray-100 relative group/media">
                    {/* GESTION VIDÉO / IMAGE POUR LES ACTUS */}
                    {isVideo(post.mediaUrl) ? (
                      <video
                        src={post.mediaUrl}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={post.mediaUrl}
                        alt={post.titre}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center text-xs text-gray-400 mb-3 gap-3">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString()}</span>
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">News</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{post.titre}</h2>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.contenu}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ================= STATS & SERVICES (inchangé) ================= */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4"><div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">500+</div><div className="text-gray-400">Évènements</div></div>
            <div className="p-4"><div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">50k</div><div className="text-gray-400">Visiteurs</div></div>
            <div className="p-4"><div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">3</div><div className="text-gray-400">Salles</div></div>
            <div className="p-4"><div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">100%</div><div className="text-gray-400">Culture</div></div>
          </div>
        </div>
      </section>

      <section id="espaces" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Un lieu aux multiples facettes</h2>
            <p className="text-gray-600">Que vous soyez artiste, entreprise ou spectateur, nous avons l'espace qu'il vous faut.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl hover:bg-emerald-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-emerald-600"><Mic2 size={24} /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Salles de Spectacle</h3>
              <p className="text-gray-600 mb-4">Une acoustique parfaite pour vos concerts, pièces de théâtre et conférences.</p>
              <a href="/web/espaces" className="text-emerald-700 font-semibold text-sm hover:underline">En savoir plus</a>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl hover:bg-emerald-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-emerald-600"><Users size={24} /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Séminaires & Ateliers</h3>
              <p className="text-gray-600 mb-4">Des espaces lumineux et équipés pour vos réunions d'entreprise et formations.</p>
              <a href="/web/espaces" className="text-emerald-700 font-semibold text-sm hover:underline">En savoir plus</a>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl hover:bg-emerald-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-emerald-600"><Ticket size={24} /></div>
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