"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowRight, Calendar, CalendarDays, CalendarRange, Clock3, Loader,
    MapPin, PartyPopper, Sparkles, UsersRound,
} from 'lucide-react';
import CalendarView from '@/components/CalendarView';
import DayCalendar from '@/components/DayCalendar';
import WeeksEvents from '@/components/WeeksEvents';
import { fetchEvents } from '@/utils/evenUtils';
import { getEventStatus } from '@/lib/evenHelper';
import { isCejabEvent } from '@/components/EventOrigin';
import { useAuth } from '@/lib/AuthContext';

const views = [
    { id: 'jour', label: 'Jour', icon: Calendar },
    { id: 'semaine', label: 'Semaine', icon: CalendarRange },
    { id: 'mois', label: 'Mois', icon: CalendarDays },
];

function ViewToggle({ activeView, onChange }) {
    return (
        <div role="tablist" aria-label="Choisir l’affichage du calendrier" className="inline-flex items-center gap-1 rounded-xl border border-[#e9e1e4] bg-[#f4f0f2] p-1">
            {views.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    type="button"
                    role="tab"
                    id={`calendar-view-tab-${id}`}
                    aria-controls="calendar-view-panel"
                    aria-selected={activeView === id}
                    tabIndex={activeView === id ? 0 : -1}
                    onClick={() => onChange(id)}
                    onKeyDown={(event) => {
                        const currentIndex = views.findIndex((view) => view.id === activeView);
                        const nextIndex = event.key === 'ArrowRight' ? (currentIndex + 1) % views.length
                            : event.key === 'ArrowLeft' ? (currentIndex - 1 + views.length) % views.length
                                : event.key === 'Home' ? 0
                                    : event.key === 'End' ? views.length - 1 : -1;
                        if (nextIndex >= 0) {
                            event.preventDefault();
                            onChange(views[nextIndex].id);
                        }
                    }}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${activeView === id ? 'bg-white text-[#a93105] shadow-sm' : 'text-[#765f58] hover:bg-white/70'}`}
                >
                    <Icon size={15} />{label}
                </button>
            ))}
        </div>
    );
}

function formatShortDate(value) {
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export default function Page() {
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [activeView, setActiveView] = useState('mois');
    const { user, isAssistant } = useAuth();

    useEffect(() => {
        fetchEvents(setEvents, setIsLoading);
    }, []);

    const formattedEvents = useMemo(() => events.map((event) => ({
        id: event.id,
        nom_evenement: event.nom_evenement,
        nom_client: event.nom_client,
        organise_par_ccjab: event.organise_par_ccjab,
        nom_salle: event.salles?.length ? event.salles.map((room) => room.nom_salle).join(' + ') : 'Aucune salle',
        agent: { nom: event.agent?.name },
        type_evenement: event.type,
        categorie: event.categorie,
        statut: getEventStatus(event.date_debut, event.date_fin),
        date_debut: event.date_debut,
        date_fin: event.date_fin,
        montant: event.montant,
        description: event.description,
        fiche: event.fiche,
    })), [events]);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const inSevenDays = new Date(today);
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    const upcoming = useMemo(() => events
        .filter((event) => new Date(event.date_fin) >= today)
        .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut)), [events, today.toDateString()]);
    const happeningToday = events.filter((event) => new Date(event.date_debut) <= new Date(today.getTime() + 86400000 - 1) && new Date(event.date_fin) >= today).length;
    const nextSevenDays = events.filter((event) => new Date(event.date_debut) >= today && new Date(event.date_debut) < inSevenDays).length;
    const ccjabCount = events.filter(isCejabEvent).length;
    const externalCount = events.length - ccjabCount;
    const outstandingBalance = events.reduce((sum, event) => sum + Math.max(0, (event.montant || 0) - (event.avance || 0)), 0);
    const dateLabel = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);

    const metrics = [
        { label: 'Programmation à venir', value: upcoming.length, note: 'Événements non terminés', icon: PartyPopper, tone: 'rust' },
        { label: "Aujourd'hui", value: happeningToday, note: 'Événements en cours ou prévus', icon: Clock3, tone: 'green' },
        { label: 'Sous 7 jours', value: nextSevenDays, note: 'Débuts de programmation', icon: CalendarRange, tone: 'gold' },
        ...(isAssistant ? [] : [{ label: 'Soldes contractuels', value: `${outstandingBalance.toLocaleString('fr-FR')} FCFA`, note: 'Montants restant à percevoir', icon: UsersRound, tone: 'rose' }]),
    ];

    if (isLoading) {
        return (
            <div className="flex min-h-[65vh] flex-col items-center justify-center bg-[#fcf8fb] text-[#765f58]">
                <Loader className="mb-3 h-7 w-7 animate-spin text-[#a93105]" />
                <span className="text-sm font-medium">Préparation de la console…</span>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#fcf8fb] text-[#1b1b1d]">
            <div className="space-y-8 lg:space-y-10">
                <section className="flex flex-col justify-between gap-6 border-b border-[#e9e1e4] pb-7 xl:flex-row xl:items-end">
                    <div className="max-w-2xl">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#f0edef] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#765f58]">
                            <span className="h-2 w-2 rounded-full bg-[#a93105]" /> Régie générale · Bouaké, Côte d’Ivoire
                        </div>
                        <h1 className="font-[Georgia] text-4xl font-semibold tracking-tight text-[#1b1b1d] sm:text-5xl">
                            Bonjour{user?.name ? `, ${user.name.trim().split(/\s+/)[0]}` : ''}
                            <span className="ml-2 inline-block text-3xl" aria-hidden="true">✦</span>
                        </h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-[#765f58] sm:text-base">
                            Voici la programmation et les repères opérationnels du Centre Culturel Jacques Aka.
                        </p>
                    </div>
                    <div className="flex flex-col items-start gap-3 xl:items-end">
                        <div className="rounded-xl border border-[#e9e1e4] bg-white px-4 py-2 text-sm font-semibold capitalize text-[#59413a] shadow-sm">
                            {dateLabel}
                        </div>
                        <Link href="/dashboard/evenements" className="inline-flex items-center gap-2 rounded-lg bg-[#a93105] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#862300]">
                            Voir les événements <ArrowRight size={16} />
                        </Link>
                    </div>
                </section>

                <section aria-label="Indicateurs de programmation" className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${metrics.length === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
                    {metrics.map(({ label, value, note, icon: Icon, tone }) => {
                        const iconTone = tone === 'rust' ? 'bg-[#fae9e3] text-[#a93105]' : tone === 'green' ? 'bg-[#e2f1e8] text-[#446554]' : tone === 'gold' ? 'bg-[#ffeed1] text-[#7b5500]' : 'bg-[#f8e7e5] text-[#ba3e28]';
                        return (
                            <article key={label} className="rounded-2xl border border-[#eee8eb] bg-white p-5 shadow-[0_2px_12px_rgba(42,24,30,0.035)] transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#765f58]">{label}</p>
                                        <p className="mt-3 font-[Georgia] text-3xl font-semibold tracking-tight text-[#1b1b1d]">{value}</p>
                                    </div>
                                    <span className={`rounded-xl p-3 ${iconTone}`}><Icon size={19} /></span>
                                </div>
                                <p className="mt-4 border-t border-[#f0edef] pt-3 text-xs text-[#8d7169]">{note}</p>
                            </article>
                        );
                    })}
                </section>

                <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
                    <div className="rounded-2xl border border-[#eee8eb] bg-white p-5 shadow-[0_2px_12px_rgba(42,24,30,0.035)] sm:p-7">
                        <div className="flex flex-col justify-between gap-4 border-b border-[#f0edef] pb-5 sm:flex-row sm:items-end">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a93105]">Programmation & régie</p>
                                <h2 className="mt-1 font-[Georgia] text-2xl font-semibold leading-tight text-[#1b1b1d] sm:text-3xl">Événements à venir</h2>
                                <p className="mt-2 max-w-xl text-sm leading-5 text-[#765f58]">Un aperçu des prochains rendez-vous et de leur organisation.</p>
                            </div>
                            <Link href="/dashboard/evenements" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#a93105] hover:text-[#862300]">
                                Toute la programmation <ArrowRight size={15} />
                            </Link>
                        </div>

                        {upcoming.length ? (
                            <div className="divide-y divide-[#f0edef]">
                                {upcoming.slice(0, 5).map((event) => {
                                    const isInternal = isCejabEvent(event);
                                    const roomNames = event.salles?.map((room) => room.nom_salle).join(' · ') || 'Salle à confirmer';
                                    return (
                                        <article key={event.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                                            <div className="h-20 w-full shrink-0 overflow-hidden rounded-xl bg-[#f0edef] sm:h-[76px] sm:w-28">
                                                {event.image ? <img src={event.image} alt="" className="h-full w-full object-cover" loading="lazy" /> : (
                                                    <div className="flex h-full items-center justify-center text-[#a93105]"><PartyPopper size={24} /></div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${isInternal ? 'bg-[#fae9e3] text-[#a93105]' : 'bg-[#e9eff7] text-[#315b8c]'}`}>
                                                        {isInternal ? 'CCJAB' : 'Client externe'}
                                                    </span>
                                                    <span className="rounded-full bg-[#f0edef] px-2.5 py-1 text-[10px] font-semibold text-[#59413a]">{event.categorie || event.type || 'Événement'}</span>
                                                </div>
                                                <h3 className="truncate text-base font-bold text-[#1b1b1d] sm:text-lg">{event.nom_evenement || event.type || 'Événement sans titre'}</h3>
                                                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#765f58]">
                                                    <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} className="text-[#a93105]" />{formatShortDate(event.date_debut)}</span>
                                                    <span className="inline-flex items-center gap-1.5"><MapPin size={13} className="text-[#446554]" />{roomNames}</span>
                                                </div>
                                            </div>
                                            <span className={`self-start rounded-full px-2.5 py-1 text-[11px] font-semibold sm:self-center ${getEventStatus(event.date_debut, event.date_fin) === 'En cours' ? 'bg-[#ffeed1] text-[#7b5500]' : 'bg-[#e2f1e8] text-[#446554]'}`}>
                                                {getEventStatus(event.date_debut, event.date_fin)}
                                            </span>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-12 text-center">
                                <span className="rounded-full bg-[#f6f3f5] p-4 text-[#8d7169]"><CalendarDays size={24} /></span>
                                <p className="mt-3 font-semibold text-[#59413a]">Aucun événement à venir</p>
                                <p className="mt-1 text-sm text-[#8d7169]">Les prochains rendez-vous s’afficheront ici.</p>
                            </div>
                        )}
                    </div>

                    <aside className="space-y-5">
                        <section className="rounded-2xl border border-[#f0e3e4] bg-[#f8edef] p-5 sm:p-6">
                            <div className="flex items-center gap-3">
                                <span className="rounded-xl bg-[#a93105] p-2.5 text-white"><Sparkles size={18} /></span>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#a93105]">Répartition</p>
                                    <h2 className="font-[Georgia] text-xl font-semibold text-[#1b1b1d]">Origine des événements</h2>
                                </div>
                            </div>
                            <div className="mt-5 space-y-4">
                                <div>
                                    <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium text-[#59413a]">Organisés par le CCJAB</span><strong>{ccjabCount}</strong></div>
                                    <div className="h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#a93105]" style={{ width: `${events.length ? ccjabCount / events.length * 100 : 0}%` }} /></div>
                                </div>
                                <div>
                                    <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium text-[#59413a]">Clients externes</span><strong>{externalCount}</strong></div>
                                    <div className="h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#446b88]" style={{ width: `${events.length ? externalCount / events.length * 100 : 0}%` }} /></div>
                                </div>
                            </div>
                            <Link href="/dashboard/evenements" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#a93105] hover:underline">Consulter les événements <ArrowRight size={14} /></Link>
                        </section>

                        <section className="rounded-2xl border border-[#eee8eb] bg-white p-5 shadow-[0_2px_12px_rgba(42,24,30,0.035)] sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#446554]">À surveiller</p>
                                    <h2 className="mt-1 font-[Georgia] text-xl font-semibold text-[#1b1b1d]">Cette semaine</h2>
                                </div>
                                <span className="rounded-xl bg-[#e2f1e8] p-2.5 text-[#446554]"><CalendarRange size={18} /></span>
                            </div>
                            <p className="mt-5 font-[Georgia] text-4xl font-semibold text-[#446554]">{nextSevenDays}<span className="ml-2 font-sans text-sm font-medium text-[#765f58]">événement{nextSevenDays === 1 ? '' : 's'}</span></p>
                            <p className="mt-1 text-sm leading-5 text-[#765f58]">ont une date de début dans les sept prochains jours.</p>
                            {upcoming[0] && (
                                <div className="mt-5 rounded-xl bg-[#f6f3f5] p-3.5">
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#8d7169]">Prochain rendez-vous</p>
                                    <p className="mt-1 truncate text-sm font-bold text-[#1b1b1d]">{upcoming[0].nom_evenement || upcoming[0].type || 'Événement'}</p>
                                    <p className="mt-1 text-xs capitalize text-[#765f58]">{formatShortDate(upcoming[0].date_debut)}</p>
                                </div>
                            )}
                        </section>
                    </aside>
                </section>

                <section className="space-y-4">
                    <div className="flex flex-col justify-between gap-4 border-b border-[#e9e1e4] pb-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a93105]">Régie & planification</p>
                            <h2 className="mt-1 font-[Georgia] text-2xl font-semibold text-[#1b1b1d] sm:text-3xl">Calendrier des événements</h2>
                        </div>
                        <ViewToggle activeView={activeView} onChange={setActiveView} />
                    </div>
                    <div id="calendar-view-panel" role="tabpanel" aria-labelledby={`calendar-view-tab-${activeView}`} className="overflow-hidden rounded-2xl border border-[#eee8eb] bg-white p-3 shadow-[0_2px_12px_rgba(42,24,30,0.035)] sm:p-5">
                        {activeView === 'jour' && <DayCalendar events={events} />}
                        {activeView === 'semaine' && <WeeksEvents />}
                        {activeView === 'mois' && <CalendarView events={formattedEvents} />}
                    </div>
                </section>
            </div>
        </main>
    );
}
