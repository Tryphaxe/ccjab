'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap, Library, Monitor, Newspaper, Search, Users } from 'lucide-react';

const COLLECTIONS = [
  { title: 'Romans & littérature', text: 'Des œuvres pour découvrir des voix, des histoires et des horizons nouveaux.', Icon: BookOpen, tone: 'bg-[#f8e9e4] text-[#b43a1a]' },
  { title: 'Ressources éducatives', text: 'Des ouvrages et supports pour accompagner les apprentissages et les recherches.', Icon: GraduationCap, tone: 'bg-[#e7f0ea] text-[#315b43]' },
  { title: 'Presse & culture générale', text: 'Revues, journaux et magazines pour suivre les idées et l’actualité.', Icon: Newspaper, tone: 'bg-[#f7efdf] text-[#8b5d22]' },
];

export default function MediathequePage() {
  return (
    <main className="min-h-screen bg-transparent pt-[72px] text-[#211b19]">
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-9 md:px-8 md:pb-16 md:pt-14 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-14">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.17em] text-[#b43a1a]"><span className="h-1.5 w-1.5 rounded-full bg-[#b43a1a]" /> Lecture · Recherche · Découverte</p>
          <h1 className="font-serif text-4xl leading-[1.08] tracking-tight md:text-6xl">La Médiathèque</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#746b67] md:text-base">Un espace dédié à la lecture, à la recherche et à l’apprentissage au cœur de Bouaké. Prenez le temps de lire, d’étudier et de découvrir de nouvelles idées.</p>
          <div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full bg-[#e7f0ea] px-3 py-2 text-[9px] font-semibold text-[#315b43]">Un lieu de lecture</span><span className="rounded-full bg-[#f2ecea] px-3 py-2 text-[9px] font-semibold text-[#655852]">Pour tous les publics</span><span className="rounded-full bg-[#f7efdf] px-3 py-2 text-[9px] font-semibold text-[#805b2d]">Au CCJAB · Bouaké</span></div>
          <Link href="/web/contact" className="mt-7 inline-flex items-center gap-2 rounded bg-[#b43a1a] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#922c13]">Préparer votre visite <ArrowRight size={15} /></Link>
        </div>
        <div className="relative min-h-[300px] overflow-hidden rounded-lg bg-[#211b19] shadow-lg md:min-h-[420px]">
          <Image src="/images/mediath.jpeg" alt="Espace de lecture de la médiathèque du CCJAB" fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 text-white"><p className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/75">Un cadre propice à l’étude</p><p className="mt-1 font-serif text-2xl md:text-3xl">Lire, apprendre, s’inspirer.</p></div>
        </div>
      </section>

      <section className="border-y border-[#eee5e2] bg-white/55 py-12 backdrop-blur-sm md:py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-7 max-w-2xl"><p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#52715f]">Un fonds documentaire varié</p><h2 className="mt-1 font-serif text-3xl md:text-4xl">Des ressources pour chaque curiosité</h2><p className="mt-2 text-xs leading-5 text-[#786e69]">La médiathèque accueille les lecteurs, les élèves, les étudiants et toute personne désireuse de consulter des ressources dans un cadre calme.</p></div>
          <div className="grid gap-4 md:grid-cols-3">{COLLECTIONS.map(({ title, text, Icon, tone }) => <article key={title} className="rounded-lg border border-[#eee5e2] bg-[#fbf8f7] p-5 md:p-6"><span className={`flex h-10 w-10 items-center justify-center rounded ${tone}`}><Icon size={18} /></span><h3 className="mt-4 font-serif text-xl">{title}</h3><p className="mt-2 text-xs leading-5 text-[#786e69]">{text}</p></article>)}</div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="relative min-h-[280px] overflow-hidden rounded-lg bg-[#211b19] md:min-h-[350px]"><Image src="/images/mediath2.jpeg" alt="Espace de travail et de consultation à la médiathèque" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" /></div>
        <div><p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#b43a1a]">Lire &amp; travailler</p><h2 className="mt-1 font-serif text-3xl md:text-4xl">Un espace pour apprendre à votre rythme</h2><p className="mt-3 text-sm leading-6 text-[#746b67]">Installez-vous pour avancer dans vos lectures, préparer un travail ou consulter des documents. La médiathèque offre un environnement dédié à la concentration et à la découverte.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="flex gap-3 rounded bg-white p-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#e7f0ea] text-[#315b43]"><Monitor size={15} /></span><div><h3 className="text-xs font-semibold">Recherche &amp; consultation</h3><p className="mt-1 text-[10px] leading-4 text-[#786e69]">Un espace pour étudier et consulter des ressources.</p></div></div><div className="flex gap-3 rounded bg-white p-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#f7efdf] text-[#8b5d22]"><Users size={15} /></span><div><h3 className="text-xs font-semibold">Un lieu ouvert</h3><p className="mt-1 text-[10px] leading-4 text-[#786e69]">Lecteurs, apprenants et curieux y sont les bienvenus.</p></div></div></div></div>
      </section>

      <section className="px-5 pb-14 md:px-8 md:pb-20"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 rounded-lg bg-[#315b43] p-6 text-white md:flex-row md:items-center md:px-9 md:py-8"><div><p className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/70">Médiathèque du CCJAB</p><h2 className="mt-1 font-serif text-2xl md:text-3xl">Envie de découvrir le lieu ?</h2><p className="mt-2 max-w-2xl text-xs leading-5 text-white/75">Contactez l’accueil pour obtenir les informations pratiques avant votre venue.</p></div><Link href="/web/contact" className="inline-flex shrink-0 items-center gap-2 rounded bg-white px-4 py-3 text-xs font-bold text-[#315b43] hover:bg-[#f2ecea]">Informations &amp; accès <ArrowRight size={14} /></Link></div></section>
    </main>
  );
}
