'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Brain, Heart, Puzzle, Smile, Sparkles, Users } from 'lucide-react';

const BENEFITS = [
  { title: 'Réfléchir & apprendre', text: 'Les jeux invitent à exercer la mémoire, la logique et la concentration en s’amusant.', Icon: Brain, tone: 'bg-[#f7efdf] text-[#8b5d22]' },
  { title: 'Imaginer & créer', text: 'Puzzles, constructions et jeux symboliques ouvrent un terrain d’exploration et d’invention.', Icon: Puzzle, tone: 'bg-[#f8e9e4] text-[#b43a1a]' },
  { title: 'Jouer ensemble', text: 'Le jeu encourage l’écoute, le partage et les rencontres entre générations.', Icon: Users, tone: 'bg-[#e7f0ea] text-[#315b43]' },
];

const GAME_TYPES = ['Jeux de société', 'Jeux de construction', 'Puzzles & casse-têtes', 'Jeux symboliques'];

export default function LudothequePage() {
  return (
    <main className="min-h-screen bg-transparent pt-[72px] text-[#211b19]">
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-9 md:px-8 md:pb-16 md:pt-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-14">
        <div className="relative order-2 min-h-[300px] overflow-hidden rounded-lg bg-[#211b19] shadow-lg lg:order-1 md:min-h-[430px]">
          <Image src="/images/ludo.jpeg" alt="Espace de jeux de la ludothèque du CCJAB" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 text-white"><p className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/75">Jeu · Partage · Éveil</p><p className="mt-1 font-serif text-2xl md:text-3xl">Grandir en jouant.</p></div>
        </div>
        <div className="order-1 lg:order-2">
          <p className="mb-3 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.17em] text-[#b43a1a]"><span className="h-1.5 w-1.5 rounded-full bg-[#b43a1a]" /> Éveil &amp; divertissement · Bouaké</p>
          <h1 className="font-serif text-4xl leading-[1.08] tracking-tight md:text-6xl">La Ludothèque</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#746b67] md:text-base">Un espace pour jouer, apprendre et partager. La ludothèque du CCJAB invite enfants, jeunes et adultes à découvrir des jeux éducatifs et récréatifs dans un cadre convivial.</p>
          <div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full bg-[#f8e9e4] px-3 py-2 text-[9px] font-semibold text-[#9d351c]">Enfants</span><span className="rounded-full bg-[#e7f0ea] px-3 py-2 text-[9px] font-semibold text-[#315b43]">Jeunes</span><span className="rounded-full bg-[#f7efdf] px-3 py-2 text-[9px] font-semibold text-[#805b2d]">Adultes &amp; familles</span></div>
          <Link href="/web/contact" className="mt-7 inline-flex items-center gap-2 rounded bg-[#b43a1a] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#922c13]">Informations &amp; accès <ArrowRight size={15} /></Link>
        </div>
      </section>

      <section className="border-y border-[#eee5e2] bg-white/55 py-12 backdrop-blur-sm md:py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8"><div className="mb-7 max-w-2xl"><p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#52715f]">Le jeu comme expérience</p><h2 className="mt-1 font-serif text-3xl md:text-4xl">Bien plus qu’un moment de détente</h2><p className="mt-2 text-xs leading-5 text-[#786e69]">Jouer permet d’explorer, de créer et de partager. La ludothèque encourage ces expériences au fil des parties et des rencontres.</p></div>
          <div className="grid gap-4 md:grid-cols-3">{BENEFITS.map(({ title, text, Icon, tone }) => <article key={title} className="rounded-lg border border-[#eee5e2] bg-[#fbf8f7] p-5 md:p-6"><span className={`flex h-10 w-10 items-center justify-center rounded ${tone}`}><Icon size={18} /></span><h3 className="mt-4 font-serif text-xl">{title}</h3><p className="mt-2 text-xs leading-5 text-[#786e69]">{text}</p></article>)}</div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div><p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#b43a1a]">À découvrir</p><h2 className="mt-1 font-serif text-3xl md:text-4xl">Des jeux pour tous les imaginaires</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#746b67]">La collection rassemble différents types de jeux pour varier les expériences, résoudre des énigmes, construire et inventer des histoires.</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{GAME_TYPES.map((type) => <div key={type} className="flex items-center gap-2 rounded bg-white px-3 py-3 text-xs font-medium text-[#554a45]"><span className="h-1.5 w-1.5 rounded-full bg-[#b43a1a]" />{type}</div>)}</div></div>
        <div className="relative min-h-[280px] overflow-hidden rounded-lg bg-[#211b19] md:min-h-[350px]"><Image src="/images/ludoth.jpeg" alt="Activités et jeux à la ludothèque" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" /><div className="absolute bottom-4 left-4 flex items-center gap-2 rounded bg-white/95 px-3 py-2 text-[10px] font-semibold text-[#403631]"><Sparkles size={14} className="text-[#b43a1a]" />Un espace d’éveil et de partage</div></div>
      </section>

      <section className="px-5 pb-14 md:px-8 md:pb-20"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 rounded-lg bg-[#315b43] p-6 text-white md:flex-row md:items-center md:px-9 md:py-8"><div className="flex items-start gap-4"><span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white/10"><Heart size={18} /></span><div><p className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/70">Ludothèque du CCJAB</p><h2 className="mt-1 font-serif text-2xl md:text-3xl">Un espace ouvert à tous</h2><p className="mt-2 max-w-2xl text-xs leading-5 text-white/75">Contactez l’accueil pour connaître les informations pratiques et préparer votre visite.</p></div></div><Link href="/web/contact" className="inline-flex shrink-0 items-center gap-2 rounded bg-white px-4 py-3 text-xs font-bold text-[#315b43] hover:bg-[#f2ecea]"><Smile size={14} /> Nous contacter <ArrowRight size={14} /></Link></div></section>
    </main>
  );
}
