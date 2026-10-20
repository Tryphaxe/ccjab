'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, UsersRound, MapPin, CheckCircle2,
  Phone, CalendarDays, Accessibility, Headset, ClipboardList, Landmark
} from 'lucide-react';
import { fetchSalles } from '@/utils/salleWebUtils';

const imageForRoom = (room) => {
  if (room.image) return room.image;
  const name = room.nom_salle?.toLocaleLowerCase('fr') || '';
  if (name.includes('spectacle') || name.includes('théâtre') || name.includes('theatre')) return '/images/SALLE DE SPECTACLE 1.jpeg';
  if (name.includes('exposition') || name.includes('galerie')) return '/images/mediath.jpeg';
  if (name.includes('média') || name.includes('media') || name.includes('conférence')) return '/images/mediath2.jpeg';
  if (name.includes('ludo') || name.includes('atelier')) return '/images/ludoth.jpeg';
  if (name.includes('esplanade') || name.includes('extérieur')) return '/images/ccjabpic.jpg';
  return '/images/default-salle.png';
};

const roomType = (room, index) => {
  const name = room.nom_salle?.toLocaleLowerCase('fr') || '';
  if (name.includes('spectacle') || name.includes('théâtre') || name.includes('theatre')) return 'Spectacles & galas';
  if (name.includes('exposition') || name.includes('galerie')) return 'Expositions & cocktails';
  if (name.includes('média') || name.includes('media') || name.includes('conférence')) return 'Rencontres & savoir';
  if (name.includes('esplanade') || name.includes('extérieur')) return 'Festivals & foires';
  return ['Spectacles & galas', 'Expositions & cocktails', 'Rencontres & savoir', 'Festivals & foires'][index % 4];
};

export default function EspacesPage() {
  const [salles, setSalles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSalles(setSalles, setIsLoading);
  }, []);

  const amenities = useMemo(() => [...new Map(
    salles.flatMap((room) => room.commodites || [])
      .map((item) => item.commodite)
      .filter((item) => item?.id && item?.nom)
      .map((item) => [item.id, item])
  ).values()], [salles]);

  const totalCapacity = salles.reduce((sum, room) => sum + (Number(room.nombre_place) || 0), 0);
  const roomsWithCapacity = salles.filter((room) => Number(room.nombre_place) > 0).length;

  return (
    <div className="bg-transparent text-[#211b19]">
      {/* Introduction */}
      <section className="mt-[72px] border-b border-[#eee5e1] bg-[#f7f2f0]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-8 sm:px-8 sm:py-12 md:grid-cols-[1.15fr_.85fr] lg:gap-14 lg:px-12">
          <div className="py-2">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.18em] text-[#a83113] shadow-sm"><span className="h-1.5 w-1.5 rounded-full bg-[#b93313]" /> Patrimoine monumental · Bouaké</p>
            <h1 className="max-w-xl font-serif text-4xl leading-[1.02] tracking-[-.04em] sm:text-5xl">Privatisation & location des espaces</h1>
            <p className="mt-4 max-w-xl text-xs leading-6 text-[#796b65] sm:text-sm">Le CCJAB accueille vos spectacles, créations en résidence, conférences institutionnelles et rassemblements culturels au cœur de Bouaké.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/web/contact" className="inline-flex items-center gap-2 rounded-sm bg-[#b93313] px-4 py-3 text-[10px] font-bold text-white shadow-sm transition hover:bg-[#96270e]">Demander les disponibilités <ArrowRight size={13} /></Link>
              <Link href="/web/contact" className="inline-flex items-center gap-2 rounded-sm border border-[#e5d9d4] bg-white px-4 py-3 text-[10px] font-semibold text-[#574a44] transition hover:bg-[#f7f1ee]"><ClipboardList size={13} /> Demander la grille tarifaire</Link>
            </div>
            <div className="mt-8 grid max-w-lg grid-cols-3 divide-x divide-[#e4d9d5] border-t border-[#e4d9d5] pt-4">
              <div className="pr-3"><p className="font-serif text-2xl text-[#b33a1a]">{isLoading ? '…' : salles.length}</p><p className="mt-1 text-[8px] uppercase tracking-wider text-[#8b7c75]">Espaces disponibles</p></div>
              <div className="px-3"><p className="font-serif text-2xl text-[#315b43]">{isLoading ? '…' : roomsWithCapacity ? totalCapacity.toLocaleString('fr-FR') : '—'}</p><p className="mt-1 text-[8px] uppercase tracking-wider text-[#8b7c75]">Places cumulées</p></div>
              <div className="pl-3"><p className="font-serif text-2xl text-[#b33a1a]">Sur devis</p><p className="mt-1 text-[8px] uppercase tracking-wider text-[#8b7c75]">Selon votre projet</p></div>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md md:ml-auto">
            <div className="absolute -bottom-2 -left-2 h-full w-full border border-[#b33a1a]/30" />
            <div className="relative h-[270px] overflow-hidden bg-[#ddd0c9] shadow-lg sm:h-[330px]">
              <img src="/images/ccjabpic1.png" alt="Architecture du Centre Culturel Jacques Aka" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <p className="text-[8px] font-bold uppercase tracking-[.17em] text-white/75">Écrin des arts vivants</p>
                <p className="mt-1 font-serif text-xl">Un lieu singulier au service de la création</p>
              </div>
            </div>
            <div className="absolute -bottom-5 left-4 flex items-center gap-2 rounded-sm bg-white px-3 py-2 text-[9px] text-[#574a44] shadow-lg sm:left-6"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e0f1e8] text-[#315b43]"><MapPin size={13} /></span>Lieu culturel emblématique de Bouaké</div>
          </div>
        </div>
      </section>

      {/* Rooms */}
      <section id="espaces" className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-7 grid gap-4 md:grid-cols-[1fr_.75fr] md:items-end">
            <div><p className="mb-2 text-[8px] font-bold uppercase tracking-[.2em] text-[#b33a1a]">Plateaux scéniques & espaces de rencontre</p><h2 className="font-serif text-3xl sm:text-4xl">Les espaces disponibles</h2></div>
            <p className="max-w-lg text-[10px] leading-5 text-[#81736e] md:justify-self-end">Chaque espace bénéficie d’une configuration adaptée à vos événements : spectacles, expositions, conférences et rencontres culturelles.</p>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">{[0, 1, 2, 3].map((item) => <div key={item} className="h-[400px] animate-pulse rounded-sm bg-[#eee5e1]" />)}</div>
          ) : salles.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {salles.map((room, index) => (
                <article key={room.id} className="group overflow-hidden rounded-sm border border-[#e9dfdb] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-52 overflow-hidden bg-[#e7dcd7] sm:h-60">
                    <img src={imageForRoom(room)} alt={room.nom_salle} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-sm border border-white/70 bg-white/90 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-[#54443d]">{roomType(room, index)}</span>
                    {room.nombre_place > 0 && <span className="absolute bottom-3 right-3 rounded-sm bg-black/60 px-2.5 py-1.5 text-[8px] font-semibold text-white backdrop-blur-sm">{room.nombre_place.toLocaleString('fr-FR')} places</span>}
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div><h3 className="font-serif text-xl leading-snug sm:text-2xl">{room.nom_salle}</h3><p className="mt-1 flex items-center gap-1 text-[9px] text-[#8b7c75]"><MapPin size={11} className="text-[#b33a1a]" />Centre Culturel Jacques Aka · Bouaké</p></div>
                      <span className="shrink-0 rounded-sm bg-[#f7efec] px-2 py-1 text-[8px] font-bold text-[#a83113]">Sur devis</span>
                    </div>
                    <p className="mt-3 text-[10px] leading-5 text-[#81736e]">{room.nombre_place ? `Un espace modulable pouvant accueillir jusqu’à ${room.nombre_place.toLocaleString('fr-FR')} personnes, selon la configuration retenue.` : 'Un espace modulable pour accueillir vos événements culturels et professionnels.'}</p>
                    <div className="mt-4 border-t border-[#f0e9e6] pt-3">
                      <p className="mb-2 text-[7px] font-bold uppercase tracking-[.15em] text-[#9a8982]">Équipements et commodités</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(room.commodites || []).length ? room.commodites.map((item) => item.commodite && <span key={`${room.id}-${item.commoditeId}`} className="inline-flex items-center gap-1 rounded-sm bg-[#f6f2f0] px-2 py-1 text-[8px] text-[#6e5e57]"><CheckCircle2 size={10} className="text-[#315b43]" />{item.commodite.nom}</span>) : <span className="text-[9px] italic text-[#9a8982]">Équipements à confirmer selon le projet.</span>}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[#f0e9e6] pt-3">
                      <span className="text-[10px] font-semibold text-[#51443e]">Tarif personnalisé</span>
                      <Link href="/web/contact" className="inline-flex items-center gap-1 text-[10px] font-bold text-[#a83113] hover:underline">Nous contacter <ArrowRight size={12} /></Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-[#ddcfca] bg-white px-6 py-12 text-center"><Landmark size={25} className="mx-auto mb-3 text-[#b33a1a]" /><h3 className="font-serif text-2xl">Les espaces seront bientôt présentés ici.</h3><p className="mt-2 text-xs text-[#81736e]">Contactez notre équipe pour connaître les disponibilités.</p></div>
          )}
        </div>
      </section>

      {/* Cultural welcome */}
      <section className="border-y border-[#eee5e1] bg-[#f3edeb] py-10">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="text-[8px] font-bold uppercase tracking-[.2em] text-[#b33a1a]">Un lieu ouvert à vos idées</p>
          <blockquote className="mt-3 font-serif text-xl italic leading-relaxed text-[#51443e] sm:text-2xl">« Faites vivre les espaces du CCJAB avec vos projets artistiques, culturels et citoyens. »</blockquote>
          <p className="mt-3 text-[8px] font-semibold uppercase tracking-wider text-[#8b7c75]">Centre Culturel Jacques Aka · Bouaké</p>
        </div>
      </section>

      {/* Contact / availability instead of a public request form */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 md:grid-cols-[.7fr_1.3fr] lg:px-12">
          <div>
            <p className="mb-2 text-[8px] font-bold uppercase tracking-[.2em] text-[#b33a1a]">Réservations & devis</p>
            <h2 className="font-serif text-3xl leading-tight sm:text-4xl">Parlons de votre projet au CCJAB</h2>
            <p className="mt-3 text-xs leading-6 text-[#796b65]">Notre équipe vous renseigne sur les espaces, les disponibilités et les conditions de location.</p>
            <Link href="/web/contact" className="mt-5 inline-flex items-center gap-2 rounded-sm bg-[#b93313] px-4 py-3 text-[10px] font-bold text-white transition hover:bg-[#96270e]">Contacter l’équipe <ArrowRight size={13} /></Link>
            <a href="tel:+2250150985220" className="mt-3 flex w-fit items-center gap-2 text-[10px] font-semibold text-[#51443e] hover:text-[#a83113]"><Phone size={13} className="text-[#b33a1a]" />+225 01 50 985 220</a>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ServiceCard icon={Headset} title="Accompagnement technique" text="Échangez avec l’équipe sur les besoins liés à la configuration et au déroulement de votre événement." tone="red" />
            <ServiceCard icon={Accessibility} title="Accueil & accessibilité" text="Contactez-nous pour préparer l’accueil des participants et signaler tout besoin d’accessibilité." tone="green" />
            <ServiceCard icon={CalendarDays} title="Disponibilités" text="Les dates sont confirmées avec l’équipe en fonction de la programmation et de l’occupation des lieux." tone="gold" />
            <ServiceCard icon={ClipboardList} title="Tarification sur mesure" text="Le tarif dépend de l’espace, de la durée et des besoins de votre projet. Demandez la grille au centre." tone="gray" />
          </div>
        </div>
      </section>

      {/* Commitments */}
      <section className="border-y border-[#eee5e1] bg-[#f3edeb] py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mx-auto mb-7 max-w-2xl text-center"><p className="mb-2 text-[8px] font-bold uppercase tracking-[.2em] text-[#b33a1a]">Charte d’accueil institutionnelle</p><h2 className="font-serif text-3xl">Conditions pratiques & engagements</h2><p className="mt-2 text-[10px] leading-5 text-[#81736e]">Une attention portée à la qualité de l’accueil et au bon déroulement de vos événements.</p></div>
          <div className="grid gap-3 md:grid-cols-3">
            <ServiceCard icon={Headset} title="Accompagnement dédié" text="Un interlocuteur vous aide à préparer votre venue et à étudier les besoins de votre événement." tone="red" />
            <ServiceCard icon={Accessibility} title="Accueil accessible" text="Faites-nous part de vos besoins spécifiques afin de préparer au mieux l’accueil du public." tone="green" />
            <ServiceCard icon={CheckCircle2} title="Cadre adapté" text="Les espaces et équipements sont étudiés avec vous selon le format et la jauge envisagés." tone="gold" />
          </div>
        </div>
      </section>

      {/* Amenities recap */}
      {amenities.length > 0 && (
        <section className="py-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-5 sm:px-8 lg:px-12">
            <span className="mr-2 text-[8px] font-bold uppercase tracking-wider text-[#8b7c75]">Commodités présentes</span>
            {amenities.map((amenity) => <span key={amenity.id} className="rounded-full border border-[#e9dfdb] bg-white px-3 py-1.5 text-[8px] text-[#6e5e57]">{amenity.nom}</span>)}
          </div>
        </section>
      )}
    </div>
  );
}

function ServiceCard({ icon: Icon, title, text, tone }) {
  const tones = {
    red: 'bg-[#fbe9e3] text-[#b33a1a]',
    green: 'bg-[#e0f1e8] text-[#315b43]',
    gold: 'bg-[#fff0d8] text-[#9a6b24]',
    gray: 'bg-[#eee9e6] text-[#665751]',
  };
  return <article className="rounded-sm border border-[#ece3df] bg-white p-4 shadow-sm sm:p-5"><span className={`mb-4 inline-flex h-9 w-9 items-center justify-center rounded-sm ${tones[tone]}`}><Icon size={16} /></span><h3 className="font-serif text-lg">{title}</h3><p className="mt-2 text-[9px] leading-5 text-[#81736e]">{text}</p></article>;
}
