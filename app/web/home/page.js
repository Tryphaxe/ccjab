'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, CalendarDays, MapPin, ChevronRight, Megaphone, X
} from 'lucide-react';
import { fetchEvents } from '@/utils/evenWebUtils';
import { fetchSalles } from '@/utils/salleWebUtils';

const DEFAULT_IMAGE = '/images/default-salle.png';
const formatDate = (date, options = { day: 'numeric', month: 'long', year: 'numeric' }) => {
  if (!date) return '';
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? '' : new Intl.DateTimeFormat('fr-FR', options).format(value);
};

const eventImage = (event) => event?.image || '/images/default-salle.png';
const isVideo = (url = '') => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);

export default function CulturalCenterHome() {
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [featuredAds, setFeaturedAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);
  const [salles, setSalles] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetchEvents(setEvents, setEventsLoading);
    fetchSalles(setSalles);
    fetch('/api/web/post?type=ACTU')
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]));
    fetch('/api/web/post?type=PUB')
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setFeaturedAds(Array.isArray(data) ? data : []))
      .catch(() => setFeaturedAds([]));
  }, []);

  useEffect(() => {
    if (!selectedAd) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedAd(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [selectedAd]);

  const upcomingEvents = useMemo(() => events
    .filter((event) => event.visible && event.date_fin && new Date(event.date_fin) >= new Date())
    .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut)), [events]);

  const featuredEvent = upcomingEvents[0];
  const sideEvents = upcomingEvents.slice(1, 3);

  return (
    <div className="bg-[#fbf8f7] text-[#211b19] selection:bg-[#b63313]/20">
      {/* Immersive introduction */}
      <section className="relative isolate flex min-h-[690px] items-end overflow-hidden bg-[#17100d] pt-28 sm:min-h-[740px]">
        <img
          src="/images/ccjabpic1.png"
          alt="Une soirée de spectacle au Centre Culturel Jacques Aka"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/55 to-black/15" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-24 sm:px-8 sm:pb-20 lg:px-12">
          {featuredEvent && (
            <Link href="/web/agenda" className="mb-14 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-[.16em] text-white backdrop-blur-sm transition hover:bg-black/50 sm:mb-20">
              <span className="h-2 w-2 rounded-full bg-[#d84a20]" />
              Prochain événement <span className="text-white/50">·</span>
              {formatDate(featuredEvent.date_debut, { weekday: 'long', day: 'numeric', month: 'long' })}
              <ChevronRight size={13} />
            </Link>
          )}

          <div className="max-w-2xl">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[.28em] text-[#f07b4a]">Un lieu, mille expressions</p>
            <h1 className="font-serif text-5xl font-semibold leading-[.98] tracking-[-.045em] text-white sm:text-6xl md:text-7xl">
              Centre Culturel<br />Jacques Aka
            </h1>
            <p className="mt-5 font-serif text-xl italic text-white/90 sm:text-2xl">La culture prend vie à Bouaké.</p>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
              Un espace de création, de rencontre et de transmission au cœur de la Côte d’Ivoire. La culture nous rassemble et ouvre de nouveaux horizons.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/web/agenda" className="inline-flex items-center gap-2 rounded-sm bg-[#b93313] px-5 py-3 text-xs font-semibold text-white shadow-lg transition hover:bg-[#96270e]">
                <CalendarDays size={15} /> Voir l’agenda
              </Link>
              <Link href="/web/historique" className="inline-flex items-center gap-2 rounded-sm bg-white/10 px-5 py-3 text-xs font-semibold text-white ring-1 ring-white/30 backdrop-blur-sm transition hover:bg-white/20">
                Découvrir le CCJAB <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Season ribbon */}
      <div className="border-b border-[#e8dfdc] bg-[#f1eae7]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-5 py-3 text-[10px] uppercase tracking-[.12em] text-[#766963] sm:px-8 lg:px-12">
          <span><b className="mr-2 text-[#ae3215]">Saison culturelle</b> · Musique · Danse · Théâtre · Expositions · Résidences</span>
          <Link href="/web/contact" className="font-semibold text-[#ae3215] hover:underline">Billetterie ouverte sur place et en ligne <ArrowRight className="ml-1 inline" size={12} /></Link>
        </div>
      </div>

      {/* Publicités mises à la une */}
      {featuredAds.length > 0 && (
        <section className="border-b border-[#eee5e1] bg-white py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.2em] text-[#b33a1a]"><Megaphone size={12} /> Annonces du centre</p>
                <h2 className="font-serif text-3xl leading-tight sm:text-4xl">À la une</h2>
              </div>
              <span className="hidden text-[10px] text-[#81736e] sm:block">Les informations mises en avant par le CCJAB</span>
            </div>
            <div className={`grid gap-4 ${featuredAds.length > 1 ? 'md:grid-cols-2' : ''} ${featuredAds.length > 2 ? 'lg:grid-cols-3' : ''}`}>
              {featuredAds.slice(0, 3).map((ad) => (
                <button key={ad.id} type="button" onClick={() => setSelectedAd(ad)} aria-label={`Afficher la publicité : ${ad.titre}`} className="group relative flex min-h-[220px] w-full overflow-hidden rounded-sm border border-[#e9dfdb] bg-[#211b19] text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  {ad.mediaUrl && isVideo(ad.mediaUrl) ? (
                    <video src={ad.mediaUrl} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <img src={ad.mediaUrl || '/images/ccjabpic.jpg'} alt={ad.titre} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 bg-[#b93313] px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-wider text-white"><Megaphone size={11} /> À la une</span>
                  <div className="relative mt-auto w-full p-5 text-white">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-white/70">{formatDate(ad.createdAt)}</p>
                    <h3 className="mt-1 font-serif text-xl leading-snug sm:text-2xl">{ad.titre}</h3>
                    {ad.contenu && <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-white/75">{ad.contenu}</p>}
                    <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-white">En savoir plus <ArrowRight size={12} /></span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured program */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[.24em] text-[#b33a1a]">Programmation artistique</p>
              <h2 className="font-serif text-3xl leading-tight sm:text-4xl">Temps forts & prochains rendez-vous</h2>
            </div>
            <Link href="/web/agenda" className="hidden items-center gap-1 pb-1 text-xs font-medium text-[#a83113] hover:underline sm:inline-flex">Voir tout l’agenda <ArrowRight size={14} /></Link>
          </div>

          {eventsLoading ? (
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <div className="h-[390px] animate-pulse rounded bg-[#eee5e1]" />
              <div className="h-[390px] animate-pulse rounded bg-[#eee5e1]" />
            </div>
          ) : featuredEvent ? (
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <article className="group overflow-hidden rounded-sm border border-[#e9dfdb] bg-white shadow-sm">
                <div className="relative h-64 overflow-hidden sm:h-[330px]">
                  <img src={eventImage(featuredEvent)} alt={featuredEvent.nom_evenement || featuredEvent.type || 'Événement culturel'} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                  <div className="absolute left-4 top-4 flex gap-2">
                    <span className="bg-[#b93313] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white">À venir</span>
                    {featuredEvent.type && <span className="bg-black/55 px-3 py-1.5 text-[9px] text-white backdrop-blur-sm">{featuredEvent.type}</span>}
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 text-white sm:bottom-6 sm:left-7">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-white/75">{featuredEvent.categorie}</p>
                  <Link href={`/web/agenda/${featuredEvent.id}`} className="block font-serif text-2xl leading-tight transition hover:text-[#ffe5d8] sm:text-3xl">{featuredEvent.nom_evenement || featuredEvent.description || 'Rendez-vous culturel'}</Link>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:px-7">
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[#736762]">
                    <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} className="text-[#b33a1a]" />{formatDate(featuredEvent.date_debut)}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin size={13} className="text-[#b33a1a]" />{featuredEvent.salles?.map((salle) => salle.nom_salle).join(' · ') || 'Centre Culturel Jacques Aka'}</span>
                  <Link href={`/web/agenda/${featuredEvent.id}`} className="inline-flex items-center gap-1 font-semibold text-[#a83113] hover:underline">Détails de l’événement <ArrowRight size={12} /></Link>
                  </div>
                  <Link href="/web/contact" className="inline-flex items-center gap-2 rounded-sm bg-[#b93313] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-[#96270e]">Réserver ma place <ArrowRight size={13} /></Link>
                </div>
              </article>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {sideEvents.map((event) => (
                  <article key={event.id} className="group flex min-h-[180px] overflow-hidden rounded-sm border border-[#e9dfdb] bg-white shadow-sm">
                    <div className="relative min-h-full w-[38%] shrink-0 overflow-hidden sm:w-[42%] lg:w-[40%]">
                      <img src={eventImage(event)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                      <div>
                        <div className="flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-wider text-[#b33a1a]">
                          <span>{event.categorie || event.type || 'Rendez-vous'}</span>
                          <span>{formatDate(event.date_debut, { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <h3 className="mt-3 font-serif text-lg leading-snug"><Link href={`/web/agenda/${event.id}`} className="transition hover:text-[#a83113]">{event.nom_evenement || event.description || 'Événement culturel'}</Link></h3>
                        <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#81736e]">{event.description || 'Un moment de partage et de découverte au Centre Culturel Jacques Aka.'}</p>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-[10px] text-[#8c7e79]"><MapPin size={12} />{event.salles?.map((salle) => salle.nom_salle).join(' · ') || 'Bouaké'}</div>
                    </div>
                  </article>
                ))}
                {sideEvents.length === 0 && (
                  <div className="flex min-h-[180px] flex-col justify-center border border-dashed border-[#d9ccc7] bg-white p-6">
                    <p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#b33a1a]">La programmation</p>
                    <h3 className="mt-3 font-serif text-xl">D’autres rendez-vous arrivent bientôt.</h3>
                    <Link href="/web/agenda" className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold text-[#a83113]">Consulter l’agenda <ArrowRight size={12} /></Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-[#d9ccc7] bg-white px-6 py-12 text-center">
              <CalendarDays className="mx-auto mb-3 text-[#b33a1a]" size={28} />
              <h3 className="font-serif text-2xl">La prochaine saison se prépare</h3>
              <p className="mt-2 text-sm text-[#766963]">Retrouvez bientôt ici les prochains rendez-vous du centre.</p>
              <Link href="/web/agenda" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#a83113]">Explorer l’agenda <ArrowRight size={13} /></Link>
            </div>
          )}
          <Link href="/web/agenda" className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-[#a83113] hover:underline sm:hidden">Voir tout l’agenda <ArrowRight size={14} /></Link>
        </div>
      </section>

      {/* Heritage */}
      <section className="border-y border-[#eee5e1] bg-[#f4eeeb] py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 md:grid-cols-2 lg:gap-16 lg:px-12">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[.24em] text-[#b33a1a]">Héritage & rayonnement</p>
            <h2 className="max-w-xl font-serif text-3xl leading-tight sm:text-4xl">Un phare culturel au centre de la Côte d’Ivoire</h2>
            <blockquote className="my-6 border-l-2 border-[#b93313] pl-4 font-serif text-lg italic leading-relaxed text-[#5e4d46]">
              « Un carrefour où les traditions vivantes rencontrent la création contemporaine africaine. »
            </blockquote>
            <p className="max-w-xl text-sm leading-7 text-[#766963]">
              Inauguré en 1974, le Centre Culturel Jacques Aka fait vivre les arts, les patrimoines et les idées. Il accueille artistes, publics et associations dans un lieu ouvert à toutes les générations.
            </p>
            <Link href="/web/historique" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#a83113] hover:underline">En savoir plus sur le CCJAB <ArrowRight size={14} /></Link>
            <div className="mt-8 grid grid-cols-3 gap-3">
              <Stat value="1974" label="Année de création" />
              <Stat value={salles.length || '—'} label="Espaces culturels" />
              <Stat value={posts.length || '—'} label="Actualités en ligne" />
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -bottom-3 -left-3 h-full w-full border border-[#bd3c1a]/30" />
            <img src="/images/unnamed.jpg" alt="Le Centre Culturel Jacques Aka à Bouaké" className="relative h-[310px] w-full object-cover shadow-lg sm:h-[390px]" />
            <div className="absolute bottom-4 left-4 bg-[#a83113] px-4 py-3 text-white shadow-lg sm:bottom-6 sm:left-6">
              <p className="font-serif text-lg">Un lieu de partage</p>
              <p className="mt-1 text-[9px] uppercase tracking-[.17em] text-white/75">Bouaké · Côte d’Ivoire</p>
            </div>
          </div>
        </div>
      </section>

      {/* Spaces */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[.24em] text-[#b33a1a]">Infrastructures polyvalentes</p>
              <h2 className="font-serif text-3xl sm:text-4xl">Nos espaces de création & location</h2>
              <p className="mt-2 max-w-xl text-xs leading-5 text-[#80716b]">Des lieux équipés pour vos spectacles, conférences, expositions, ateliers et événements.</p>
            </div>
            <Link href="/web/contact" className="inline-flex w-fit items-center gap-2 rounded-sm bg-[#b93313] px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-[#96270e]">Demander une réservation <ArrowRight size={13} /></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(salles.length ? salles.slice(0, 4) : [{ id: 'main', nom_salle: 'Le Centre Culturel Jacques Aka', image: DEFAULT_IMAGE, nombre_place: null }]).map((salle, index) => (
              <article key={salle.id} className="group overflow-hidden border border-[#e9dfdb] bg-white transition hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-40 overflow-hidden bg-[#e9dfdb]">
                  <img src={salle.image || (index === 0 ? '/images/SALLE DE SPECTACLE 1.jpeg' : DEFAULT_IMAGE)} alt={salle.nom_salle} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  {salle.nombre_place && <span className="absolute right-2 top-2 bg-white/90 px-2 py-1 text-[9px] font-semibold text-[#51413a]">{salle.nombre_place} places</span>}
                </div>
                <div className="p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[.15em] text-[#b33a1a]">{index === 0 ? 'Spectacle & événement' : 'Espace polyvalent'}</p>
                  <h3 className="mt-2 font-serif text-lg leading-snug">{salle.nom_salle}</h3>
                  <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#81736e]">{salle.commodites?.map((item) => item.commodite?.nom).filter(Boolean).join(' · ') || 'Un cadre accueillant pour vos rencontres et événements.'}</p>
                  <Link href="/web/espaces" className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold text-[#a83113]">Découvrir cet espace <ArrowRight size={12} /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section className="border-y border-[#eee5e1] bg-[#f4eeeb] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[.24em] text-[#b33a1a]">Chroniques de la vie du centre</p>
              <h2 className="font-serif text-3xl sm:text-4xl">Magazine culturel & actualités</h2>
            </div>
            <Link href="/web/actualites" className="hidden items-center gap-1 pb-1 text-xs font-medium text-[#a83113] hover:underline sm:inline-flex">Toutes les publications <ArrowRight size={14} /></Link>
          </div>
          {posts.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {posts.slice(0, 3).map((post, index) => (
                <Link key={post.id} href={`/web/actualites/${post.id}`} className="group overflow-hidden rounded-sm border border-[#e9dfdb] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-48 overflow-hidden bg-[#dfd3cd]">
                    <img src={post.mediaUrl || ['/images/ccjabpic.jpg', '/images/mediath.jpeg', '/images/ludoth.jpeg'][index]} alt={post.titre} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute bottom-3 left-3 bg-[#b93313] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">{index === 0 ? 'À la une' : 'Vie du centre'}</span>
                  </div>
                  <div className="p-4">
                    <p className="text-[9px] uppercase tracking-wider text-[#9a8982]">{formatDate(post.createdAt)}</p>
                    <h3 className="mt-2 font-serif text-xl leading-snug transition group-hover:text-[#a83113]">{post.titre}</h3>
                    {post.contenu && <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#81736e]">{post.contenu}</p>}
                    <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold text-[#a83113]">Lire la suite <ArrowRight size={12} /></span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-[#e9dfdb] bg-white p-8 text-center font-serif text-xl">Les prochaines actualités arrivent bientôt.</div>
          )}
          <Link href="/web/actualites" className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-[#a83113] hover:underline sm:hidden">Toutes les publications <ArrowRight size={14} /></Link>
        </div>
      </section>

      {/* Newsletter / contact callout */}
      <section className="px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 rounded-sm bg-gradient-to-r from-[#a92e11] to-[#c64a22] px-6 py-9 text-white shadow-lg sm:px-10 md:flex-row md:items-center">
          <div className="max-w-xl">
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[.15em]">Restons en contact</span>
            <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">Restez au cœur de la vie culturelle de Bouaké</h2>
            <p className="mt-3 text-xs leading-6 text-white/80">Recevez les nouvelles du centre, nos prochains rendez-vous et les temps forts de la saison.</p>
          </div>
          <div className="shrink-0 md:min-w-[270px]">
            <p className="mb-3 text-xs text-white/85">Une question ou une réservation ? Écrivez-nous.</p>
            <Link href="/web/contact" className="inline-flex items-center gap-2 rounded-sm bg-white px-5 py-3 text-xs font-bold text-[#a83113] transition hover:bg-[#f7e8e1]">Nous contacter <ArrowRight size={14} /></Link>
            <p className="mt-4 text-[10px] text-white/75">+225 01 50 985 220 <span className="mx-2">·</span> Bouaké, Côte d’Ivoire</p>
          </div>
        </div>
      </section>

      {selectedAd && (
        <div role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelectedAd(null); }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6">
          <section role="dialog" aria-modal="true" aria-labelledby="featured-ad-title" className="relative grid max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-lg bg-[#fbf8f7] shadow-2xl md:grid-cols-[1.2fr_0.8fr]">
            <button type="button" autoFocus onClick={() => setSelectedAd(null)} aria-label="Fermer la publicité" className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#33241f] shadow transition hover:bg-[#f8e9e4] hover:text-[#b43a1a]"><X size={18} /></button>
            <div className="flex min-h-[35vh] items-center justify-center overflow-hidden bg-[#17110e] md:min-h-[70vh]">
              {selectedAd.mediaUrl && isVideo(selectedAd.mediaUrl) ? (
                <video src={selectedAd.mediaUrl} controls autoPlay playsInline className="max-h-[92vh] w-full object-contain" />
              ) : (
                <img src={selectedAd.mediaUrl || '/images/ccjabpic.jpg'} alt={selectedAd.titre} className="max-h-[92vh] w-full object-contain" />
              )}
            </div>
            <div className="overflow-y-auto p-5 sm:p-8 md:p-10">
              <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.18em] text-[#b33a1a]"><Megaphone size={12} /> Publicité à la une</p>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-wide text-[#8b7b74]">{formatDate(selectedAd.createdAt)}</p>
              <h2 id="featured-ad-title" className="mt-2 pr-7 font-serif text-3xl leading-tight sm:text-4xl">{selectedAd.titre}</h2>
              {selectedAd.contenu ? <div className="mt-5 whitespace-pre-line text-sm leading-7 text-[#655a55]">{selectedAd.contenu}</div> : <p className="mt-5 text-sm leading-6 text-[#786e69]">Retrouvez cette annonce du Centre Culturel Jacques Aka.</p>}
              <div className="mt-8 border-t border-[#e9dfdc] pt-5 text-[10px] font-medium text-[#8b7b74]">Centre Culturel Jacques Aka · Bouaké</div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-sm border border-white bg-white/80 px-3 py-4 text-center shadow-sm">
      <p className="font-serif text-2xl font-semibold text-[#a83113]">{value}</p>
      <p className="mt-1 text-[9px] leading-4 text-[#81736e]">{label}</p>
    </div>
  );
}
