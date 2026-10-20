'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, CalendarDays, Clock3, MapPin, Search, SlidersHorizontal,
  LayoutGrid, CalendarRange, List, Ticket, ChevronDown, Music2
} from 'lucide-react';
import { fetchEvents } from '@/utils/evenWebUtils';

const COVER_FALLBACK = '/images/default-salle.png';
const asDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
const dateLabel = (value, options = { day: 'numeric', month: 'long', year: 'numeric' }) => {
  const date = asDate(value);
  return date ? new Intl.DateTimeFormat('fr-FR', options).format(date) : 'Date à confirmer';
};
const monthKey = (value) => {
  const date = asDate(value);
  return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '';
};
const monthLabel = (key) => {
  if (!key) return '';
  const [year, month] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1));
};
const eventTitle = (event) => event.nom_evenement || event.description || 'Rendez-vous culturel';
const eventType = (event) => event.type || event.categorie || 'Culture';
const eventImage = (event) => event.image || COVER_FALLBACK;
const venueLabel = (event) => event.salles?.map((salle) => salle.nom_salle).filter(Boolean).join(' · ') || 'Centre Culturel Jacques Aka';

const categoryTone = (type) => {
  const value = (type || '').toLowerCase();
  if (value.includes('concert') || value.includes('musique')) return 'bg-[#315b43]';
  if (value.includes('danse')) return 'bg-[#a13e28]';
  if (value.includes('théâtre') || value.includes('theatre')) return 'bg-[#604d69]';
  if (value.includes('expo')) return 'bg-[#9a6b24]';
  return 'bg-[#4b5b6b]';
};

export default function AgendaPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Tout');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [view, setView] = useState('grid');

  useEffect(() => {
    fetchEvents(setEvents, setIsLoading);
  }, []);

  const upcomingEvents = useMemo(() => events
    .filter((event) => event.visible && asDate(event.date_fin) && asDate(event.date_fin) >= new Date())
    .sort((a, b) => asDate(a.date_debut) - asDate(b.date_debut)), [events]);

  const types = useMemo(() => [...new Set(upcomingEvents.map(eventType).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr')), [upcomingEvents]);
  const months = useMemo(() => [...new Set(upcomingEvents.map((event) => monthKey(event.date_debut)).filter(Boolean))].sort(), [upcomingEvents]);
  const venues = useMemo(() => [...new Set(upcomingEvents.flatMap((event) => event.salles?.map((salle) => salle.nom_salle) || []).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr')), [upcomingEvents]);

  const filteredEvents = useMemo(() => upcomingEvents.filter((event) => {
    const text = `${eventTitle(event)} ${event.description || ''} ${eventType(event)} ${venueLabel(event)}`.toLocaleLowerCase('fr');
    const matchesQuery = !query.trim() || text.includes(query.trim().toLocaleLowerCase('fr'));
    const matchesType = selectedType === 'Tout' || eventType(event) === selectedType;
    const matchesMonth = !selectedMonth || monthKey(event.date_debut) === selectedMonth;
    const matchesVenue = !selectedVenue || event.salles?.some((salle) => salle.nom_salle === selectedVenue);
    return matchesQuery && matchesType && matchesMonth && matchesVenue;
  }), [upcomingEvents, query, selectedType, selectedMonth, selectedVenue]);

  const featuredEvent = upcomingEvents[0];
  const eventCountLabel = upcomingEvents.length;

  return (
    <div className="min-h-screen bg-transparent text-[#211b19]">
      {/* Page introduction */}
      <section className="mt-[72px] border-b border-[#eee5e1] bg-[#fcf9f8]">
        <div className="mx-auto max-w-7xl px-5 pb-7 pt-8 sm:px-8 sm:pb-9 sm:pt-10 lg:px-12">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.22em] text-[#b33a1a]"><span className="h-2 w-2 rounded-full bg-[#ba3515]" /> Saison artistique · Le cœur battant du Gbêkê</p>
              <h1 className="font-serif text-4xl leading-none tracking-[-.035em] sm:text-5xl">L’Agenda Culturel</h1>
              <p className="mt-3 max-w-xl text-xs leading-6 text-[#796b65] sm:text-sm">
                Explorez la programmation vivante du Centre Culturel Jacques Aka. Spectacles, moments de partage, résidences d’artistes et rencontres pour tous les publics.
              </p>
            </div>
            <div className="flex w-fit gap-5 rounded-sm border border-[#eee5e1] bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-wider text-[#8d7d76]">Événements à venir</p>
                <p className="mt-1 font-serif text-2xl leading-none text-[#b33a1a]">{isLoading ? '…' : eventCountLabel}</p>
              </div>
              <div className="w-px bg-[#eee5e1]" />
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-wider text-[#8d7d76]">Lieu de rencontre</p>
                <p className="mt-1 font-serif text-lg leading-none text-[#315b43]">Bouaké</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 pb-16 pt-7 sm:px-8 lg:px-12">
        {/* Featured event */}
        {featuredEvent && (
          <section aria-label="Événement à la une" className="relative isolate overflow-hidden rounded-sm bg-[#1e1714] shadow-lg">
            <img src={eventImage(featuredEvent)} alt={eventTitle(featuredEvent)} className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/55 to-black/10" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
            <div className="flex min-h-[330px] flex-col justify-end p-5 sm:min-h-[390px] sm:p-8 lg:min-h-[420px] lg:p-10">
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-sm bg-[#b93313] px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-white">Coup de cœur du mois</span>
                <span className="rounded-sm bg-white/15 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur">Prochain rendez-vous</span>
              </div>
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[.18em] text-white/70">{eventType(featuredEvent)} <span className="mx-1.5">·</span> {dateLabel(featuredEvent.date_debut, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <Link href={`/web/agenda/${featuredEvent.id}`} className="group/title block max-w-2xl font-serif text-3xl leading-[1.04] tracking-[-.025em] text-white hover:text-[#ffe5d8] sm:text-4xl lg:text-5xl">{eventTitle(featuredEvent)}</Link>
              <p className="mt-3 line-clamp-2 max-w-2xl text-xs leading-5 text-white/80 sm:text-sm">{featuredEvent.description || 'Une rencontre artistique à vivre au Centre Culturel Jacques Aka.'}</p>
              <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-white/80">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} />{dateLabel(featuredEvent.date_debut, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{asDate(featuredEvent.date_debut)?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin size={13} />{venueLabel(featuredEvent)}</span>
                </div>
                <Link href="/web/contact" className="inline-flex items-center gap-2 rounded-sm bg-[#b93313] px-4 py-3 text-[10px] font-bold text-white shadow-lg transition hover:bg-[#96270e]">Réserver ma place <ArrowRight size={13} /></Link>
              </div>
            </div>
          </section>
        )}

        {/* Search, categories and filters */}
        <section className="mt-5 rounded-sm border border-[#eee5e1] bg-[#f5f0ee] p-3 sm:p-4" aria-label="Filtres de programmation">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96857d]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un spectacle, un artiste, une date, un genre…" className="h-10 w-full rounded-sm border border-[#eee5e1] bg-white pl-9 pr-3 text-[11px] text-[#40332e] outline-none placeholder:text-[#a3938d] focus:border-[#bd5638]" />
            </label>
            <div className="flex shrink-0 rounded-sm border border-[#e8ded9] bg-white p-1">
              <ViewButton selected={view === 'grid'} onClick={() => setView('grid')} icon={LayoutGrid} label="Grille" />
              <ViewButton selected={view === 'calendar'} onClick={() => setView('calendar')} icon={CalendarRange} label="Calendrier" />
              <ViewButton selected={view === 'timeline'} onClick={() => setView('timeline')} icon={List} label="Chronologie" />
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <CategoryChip selected={selectedType === 'Tout'} onClick={() => setSelectedType('Tout')}>Tous ({upcomingEvents.length})</CategoryChip>
            {types.map((type) => (
              <CategoryChip key={type} selected={selectedType === type} onClick={() => setSelectedType(type)}>{type} ({upcomingEvents.filter((event) => eventType(event) === type).length})</CategoryChip>
            ))}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <FilterSelect icon={CalendarDays} label="Période" value={selectedMonth} onChange={setSelectedMonth} defaultLabel="Toutes les périodes">
              {months.map((month) => <option key={month} value={month}>{monthLabel(month)}</option>)}
            </FilterSelect>
            <FilterSelect icon={MapPin} label="Scène / lieu" value={selectedVenue} onChange={setSelectedVenue} defaultLabel="Tous les lieux">
              {venues.map((venue) => <option key={venue} value={venue}>{venue}</option>)}
            </FilterSelect>
            <div className="flex h-11 items-center gap-2 rounded-sm border border-[#e8ded9] bg-white px-3 text-[10px] text-[#74655f]">
              <Ticket size={13} className="text-[#aa3a1c]" />
              <span className="flex-1"><b className="font-semibold text-[#4d403a]">Informations pratiques</b><span className="hidden sm:inline"> · Tarifs selon les spectacles</span></span>
              <Link href="/web/contact" className="whitespace-nowrap font-semibold text-[#a83113] hover:underline">Nous contacter</Link>
            </div>
          </div>
        </section>

        {/* Event cards */}
        <section className="pt-12" aria-live="polite">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[.2em] text-[#b33a1a]">À ne pas manquer</p>
              <h2 className="font-serif text-3xl leading-tight">Les rendez-vous à venir</h2>
              <p className="mt-1 text-[10px] text-[#8b7c75]">{filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} dans la programmation</p>
            </div>
            <p className="flex items-center gap-2 text-[10px] text-[#887971]">Trier par <span className="font-semibold text-[#4c3d37]">Chronologie</span></p>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-[370px] animate-pulse rounded-sm bg-[#eee5e1]" />)}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="border border-dashed border-[#ddcfca] bg-white px-5 py-14 text-center">
              <SlidersHorizontal size={24} className="mx-auto mb-3 text-[#b33a1a]" />
              <h3 className="font-serif text-2xl">Aucun événement ne correspond à ces filtres.</h3>
              <button onClick={() => { setQuery(''); setSelectedType('Tout'); setSelectedMonth(''); setSelectedVenue(''); }} className="mt-4 text-xs font-semibold text-[#a83113] hover:underline">Réinitialiser les filtres</button>
            </div>
          ) : view === 'timeline' ? (
            <div className="space-y-3">
              {filteredEvents.map((event) => <TimelineEvent key={event.id} event={event} />)}
            </div>
          ) : view === 'calendar' ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => <CalendarEvent key={event.id} event={event} />)}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.slice(0, 7).map((event) => <EventCard key={event.id} event={event} />)}
              {filteredEvents.length > 7 && (
                <div className="flex min-h-[370px] flex-col items-center justify-center rounded-sm bg-[#eee8e5] p-8 text-center">
                  <CalendarDays className="mb-3 text-[#ad3819]" size={28} />
                  <p className="font-serif text-2xl">Toute la saison, à votre rythme.</p>
                  <p className="mt-2 text-xs leading-5 text-[#796b65]">{filteredEvents.length - 7} autres rendez-vous sont au programme.</p>
                  <button onClick={() => setView('timeline')} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#a83113]">Tout afficher <ArrowRight size={13} /></button>
                </div>
              )}
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#e9dfdb] pt-4 text-[10px] text-[#8b7c75]">
            <span>Affichage de {Math.min(filteredEvents.length, view === 'grid' ? 7 : filteredEvents.length)} événements sur {upcomingEvents.length} au programme</span>
            {view === 'grid' && filteredEvents.length > 7 && <button onClick={() => setView('timeline')} className="inline-flex items-center gap-2 rounded-sm bg-[#f0eae7] px-3 py-2 font-semibold text-[#574a44] hover:bg-[#e8ded9]">Charger la suite <ChevronDown size={12} /></button>}
          </div>
        </section>
      </main>

      {/* Visitor information */}
      <section className="border-y border-[#eee5e1] bg-[#f1ecea] py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[.2em] text-[#b33a1a]">Services publics & accueil</p>
          <h2 className="font-serif text-3xl">Informations billetterie & accès</h2>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-[#796b65]">Tout ce qu’il faut savoir pour préparer votre venue et profiter pleinement des spectacles.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <InfoCard icon={Ticket} title="Guichet physique du CCJAB" text="Renseignez-vous à l’accueil du centre sur les disponibilités et les modalités de réservation." tone="red" />
            <InfoCard icon={CalendarDays} title="Préparez votre visite" text="Consultez la date, l’horaire et le lieu indiqués sur chaque rendez-vous de la programmation." tone="green" />
            <InfoCard icon={Music2} title="Jeunesse & scolaires" text="Des activités et rencontres culturelles sont proposées à tous les publics." tone="gold" />
          </div>
          <div className="mt-4 flex flex-col justify-between gap-3 rounded-sm border border-[#e7ddda] bg-white px-4 py-3 sm:flex-row sm:items-center">
            <p className="text-xs text-[#574a44]"><b className="mr-2 text-[#a83113]">Comment vous rendre au CCJAB ?</b>Bouaké, quartier Commerce, avenue de la Paix.</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/web/contact" className="rounded-sm bg-[#f2ece9] px-3 py-2 text-[10px] font-semibold text-[#574a44] hover:bg-[#e9dfdb]">Voir le plan d’accès</Link>
              <Link href="/web/contact" className="rounded-sm bg-[#315b43] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#244734]">Contacter l’accueil</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ViewButton({ selected, onClick, icon: Icon, label }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-2 text-[9px] font-medium transition sm:px-3 ${selected ? 'bg-[#b93313] text-white' : 'text-[#786a64] hover:bg-[#f4eeeb]'}`}>
      <Icon size={12} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function CategoryChip({ selected, onClick, children }) {
  return <button type="button" onClick={onClick} aria-pressed={selected} className={`shrink-0 rounded-full border px-3 py-1.5 text-[9px] transition ${selected ? 'border-[#b93313] bg-[#b93313] text-white' : 'border-[#e5d9d4] bg-white text-[#766963] hover:border-[#c98c78]'}`}>{children}</button>;
}

function FilterSelect({ icon: Icon, label, value, onChange, defaultLabel, children }) {
  return (
    <label className="flex h-11 items-center gap-2 rounded-sm border border-[#e8ded9] bg-white px-3">
      <Icon size={13} className="shrink-0 text-[#a93a1c]" />
      <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider text-[#9a8982]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 cursor-pointer bg-transparent text-[10px] text-[#4c3d37] outline-none" aria-label={label}>
        <option value="">{defaultLabel}</option>
        {children}
      </select>
    </label>
  );
}

function EventCard({ event }) {
  const date = asDate(event.date_debut);
  return (
    <article className="group overflow-hidden rounded-sm border border-[#e9dfdb] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-52 overflow-hidden bg-[#e7dcd7]">
        <Link href={`/web/agenda/${event.id}`} aria-label={`Voir ${eventTitle(event)}`} className="block h-full w-full"><img src={eventImage(event)} alt={eventTitle(event)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute left-3 top-3 flex h-11 w-10 flex-col items-center justify-center rounded-sm bg-white text-[#30231e] shadow-md">
          <span className="font-serif text-lg font-bold leading-none">{date?.getDate() || '—'}</span>
          <span className="mt-1 text-[7px] font-bold uppercase tracking-widest text-[#a83113]">{date ? new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(date).replace('.', '') : 'À venir'}</span>
        </div>
        <span className={`absolute right-3 top-3 rounded-sm px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-white ${categoryTone(eventType(event))}`}>{eventType(event)}</span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-[9px] text-[#82746e]"><MapPin size={11} className="text-[#a83113]" />{venueLabel(event)} <span className="mx-1">·</span><Clock3 size={11} className="text-[#a83113]" />{date?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
        <h3 className="mt-2 font-serif text-xl leading-snug"><Link href={`/web/agenda/${event.id}`} className="transition hover:text-[#a83113]">{eventTitle(event)}</Link></h3>
        <p className="mt-2 line-clamp-2 min-h-10 text-[10px] leading-5 text-[#81736e]">{event.description || 'Retrouvez-nous pour un nouveau rendez-vous culturel au CCJAB.'}</p>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#f0e9e6] pt-3">
          <div><p className="text-[7px] font-bold uppercase tracking-wider text-[#9a8982]">Informations</p><p className="mt-1 text-[10px] font-semibold text-[#41342e]">Tarif sur place</p></div>
          <Link href="/web/contact" className="inline-flex items-center gap-1 rounded-sm bg-[#b93313] px-3 py-2 text-[9px] font-bold text-white transition hover:bg-[#96270e]">Réserver <ArrowRight size={11} /></Link>
        </div>
      </div>
    </article>
  );
}

function CalendarEvent({ event }) {
  const date = asDate(event.date_debut);
  return (
    <article className="flex overflow-hidden rounded-sm border border-[#e9dfdb] bg-white shadow-sm">
      <div className="flex w-[72px] shrink-0 flex-col items-center justify-center bg-[#f3ebe7] px-2 text-center">
        <span className="text-[8px] font-bold uppercase tracking-wider text-[#a83113]">{date ? new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(date) : 'Date'}</span>
        <span className="font-serif text-3xl leading-none">{date?.getDate() || '—'}</span>
        <span className="mt-1 text-[8px] text-[#81736e]">{date?.getFullYear()}</span>
      </div>
      <div className="min-w-0 flex-1 p-4">
        <p className="text-[8px] font-bold uppercase tracking-wider text-[#a83113]">{eventType(event)} · {date?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
        <h3 className="mt-1 font-serif text-lg leading-snug"><Link href={`/web/agenda/${event.id}`} className="hover:text-[#a83113]">{eventTitle(event)}</Link></h3>
        <p className="mt-2 flex items-center gap-1 text-[9px] text-[#81736e]"><MapPin size={11} />{venueLabel(event)}</p>
      </div>
    </article>
  );
}

function TimelineEvent({ event }) {
  const date = asDate(event.date_debut);
  return (
    <article className="group grid overflow-hidden rounded-sm border border-[#e9dfdb] bg-white shadow-sm transition hover:shadow-md sm:grid-cols-[190px_1fr]">
      <div className="relative h-40 overflow-hidden sm:h-full">
        <Link href={`/web/agenda/${event.id}`} className="block h-full w-full"><img src={eventImage(event)} alt={eventTitle(event)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></Link>
      </div>
      <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#a83113]">{dateLabel(event.date_debut, { weekday: 'long', day: 'numeric', month: 'long' })} · {eventType(event)}</p>
          <h3 className="mt-2 font-serif text-2xl"><Link href={`/web/agenda/${event.id}`} className="hover:text-[#a83113]">{eventTitle(event)}</Link></h3>
          <p className="mt-2 line-clamp-2 max-w-2xl text-[10px] leading-5 text-[#81736e]">{event.description}</p>
          <p className="mt-3 flex items-center gap-1 text-[9px] text-[#81736e]"><MapPin size={11} className="text-[#a83113]" />{venueLabel(event)} <span className="mx-1">·</span><Clock3 size={11} className="text-[#a83113]" />{date?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <Link href="/web/contact" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-[#b93313] px-4 py-3 text-[9px] font-bold text-white hover:bg-[#96270e]">Réserver <ArrowRight size={12} /></Link>
      </div>
    </article>
  );
}

function InfoCard({ icon: Icon, title, text, tone }) {
  const tones = {
    red: 'bg-[#fbe9e3] text-[#b33a1a]',
    green: 'bg-[#e0f1e8] text-[#315b43]',
    gold: 'bg-[#fff0d8] text-[#9a6b24]',
  };
  return (
    <article className="rounded-sm border border-[#ece3df] bg-white p-4 shadow-sm sm:p-5">
      <span className={`mb-4 inline-flex h-9 w-9 items-center justify-center rounded-sm ${tones[tone]}`}><Icon size={16} /></span>
      <h3 className="font-serif text-lg">{title}</h3>
      <p className="mt-2 text-[10px] leading-5 text-[#81736e]">{text}</p>
    </article>
  );
}
