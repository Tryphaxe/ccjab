"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  Mail,
  MapPin,
  Music2,
  Newspaper,
  Phone,
  Ticket,
  Users,
  Building2,
  ExternalLink,
} from "lucide-react";

const phone = "+225 01 50 985 220";
const email = "jacquesaka1974@gmail.com";
const FAQS = [
  {
    question: "Comment réserver un spectacle sans carte bancaire ?",
    answer:
      "Les billets peuvent être achetés directement à l’accueil du Centre Culturel Jacques Aka. Pour connaître les modalités et les disponibilités d’un spectacle, appelez-nous ou écrivez-nous avant votre déplacement.",
  },
  {
    question: "Puis-je visiter les salles avant une demande de location ?",
    answer:
      "Oui. Contactez l’équipe du CCJAB pour convenir d’un moment de visite et découvrir les espaces disponibles.",
  },
  {
    question: "Les enfants ont-ils accès aux spectacles ?",
    answer:
      "Les conditions d’accès peuvent varier selon le spectacle. Consultez la fiche de l’événement dans l’agenda ou contactez l’accueil pour vous renseigner.",
  },
  {
    question: "Comment proposer un projet ou une résidence artistique ?",
    answer:
      "Présentez votre projet par courriel à jacquesaka1974@gmail.com. Pensez à joindre une présentation, vos coordonnées et les périodes souhaitées.",
  },
];

const SERVICES = [
  {
    eyebrow: "Pôle public",
    title: "Accueil & billetterie",
    description:
      "Réservations, informations sur les spectacles et accueil des visiteurs.",
    Icon: Ticket,
    tone: "text-[#b43a1a] bg-[#f8e9e4]",
    href: `tel:${phone.replaceAll(" ", "")}`,
    detail: phone,
    sub: email,
    action: "Appeler l’accueil",
  },
  {
    eyebrow: "Événements pro",
    title: "Privatisation & salles",
    description:
      "Informations sur les espaces, équipements et possibilités de location.",
    Icon: Building2,
    tone: "text-[#315b43] bg-[#e7f0ea]",
    href: "/web/espaces",
    detail: "Découvrir nos espaces",
    sub: "Visites et renseignements",
    action: "Voir les espaces",
  },
  {
    eyebrow: "Création vivante",
    title: "Projets artistiques",
    description:
      "Résidences, propositions artistiques et projets de médiation.",
    Icon: Music2,
    tone: "text-[#8b5d22] bg-[#f7efdf]",
    href: `mailto:${email}?subject=Projet%20artistique%20-%20CCJAB`,
    detail: email,
    sub: "Présentez votre projet",
    action: "Écrire au CCJAB",
  },
  {
    eyebrow: "Rayonnement",
    title: "Presse & partenariats",
    description:
      "Relations presse, demandes d’entretien et partenariats culturels.",
    Icon: Newspaper,
    tone: "text-[#725077] bg-[#f0eaf1]",
    href: `mailto:${email}?subject=Presse%20et%20partenariat%20-%20CCJAB`,
    detail: email,
    sub: "Presse et partenariats",
    action: "Nous écrire",
  },
];

export default function ContactPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <main className="min-h-screen bg-[#fbf8f7] pt-[72px] text-[#211b19]">
      <section className="relative overflow-hidden border-b border-[#eee5e2] bg-[#f4eeec]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#eadad4] blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-10 md:px-8 md:pb-16 md:pt-14">
          <p className="mb-3 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.17em] text-[#b43a1a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b43a1a]" /> Échanger
            avec nos équipes · Ville de Bouaké
          </p>
          <h1 className="font-serif text-4xl leading-tight tracking-tight md:text-6xl">
            Contact &amp; informations pratiques
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#746b67] md:text-base">
            Que vous souhaitiez assister à un spectacle, découvrir nos espaces
            ou proposer un projet artistique, nos équipes vous accueillent au
            cœur de Bouaké.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-medium text-[#594f4b]">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
              <Clock3 size={13} className="text-[#315b43]" /> Lun–ven ·
              07h30–16h30
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
              <Clock3 size={13} className="text-[#315b43]" /> Sam · 08h–13h
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-5 max-w-7xl px-5 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(
            ({
              eyebrow,
              title,
              description,
              Icon,
              tone,
              href,
              detail,
              sub,
              action,
            }) => (
              <article
                key={title}
                className="flex min-h-[218px] flex-col rounded-lg border border-[#eee5e2] bg-white p-5 shadow-[0_3px_12px_rgba(40,24,18,0.06)]"
              >
                <span
                  className={`mb-4 flex h-9 w-9 items-center justify-center rounded ${tone}`}
                >
                  <Icon size={17} />
                </span>
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#927e76]">
                  {eyebrow}
                </p>
                <h2 className="mt-1 font-serif text-xl">{title}</h2>
                <p className="mt-1 text-[11px] leading-4 text-[#786e69]">
                  {description}
                </p>
                <div className="mt-auto border-t border-[#f0eae8] pt-3">
                  <p className="truncate text-[10px] font-semibold text-[#403631]">
                    {detail}
                  </p>
                  <p className="mt-0.5 truncate text-[9px] text-[#897d78]">
                    {sub}
                  </p>
                  <Link
                    href={href}
                    className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#b43a1a] hover:underline"
                  >
                    {action} <ArrowRight size={12} />
                  </Link>
                </div>
              </article>
            ),
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-lg border border-[#eee5e2] bg-white shadow-sm">
          <div className="relative h-56 bg-[#211b19] md:h-72">
            <iframe
              title="Localisation du Centre Culturel Jacques Aka à Bouaké"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.985168501694!2d-5.025735399999999!3d7.684739499999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfc7ff24708a29b7%3A0x9679ccbe0556bcff!2sCentre%20Culturel%20Jacques%20Aka!5e0!3m2!1sfr!2sci!4v1791490089471!5m2!1sfr!2sci"
              width="100%"
              height="100%"
              loading="lazy"
              className="absolute inset-0 h-full w-full border-0 grayscale transition hover:grayscale-0"
              allowFullScreen=""
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <a
              href="https://www.google.com/maps/search/?api=1&query=Centre+Culturel+Jacques+Aka+Bouaké"
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded bg-white px-3 py-2 text-[10px] font-semibold text-[#3e342f] shadow"
            >
              Itinéraire <ExternalLink size={12} />
            </a>
          </div>
          <div className="p-5 md:p-6">
            <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#b43a1a]">
              Nous trouver
            </p>
            <h2 className="mt-1 font-serif text-2xl">
              Centre Culturel Jacques Aka
            </h2>
            <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-[#756b66]">
              <MapPin size={15} className="mt-0.5 shrink-0 text-[#b43a1a]" />
              Bouaké, quartier Commerce, avenue de la Paix, Côte d’Ivoire.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`tel:${phone.replaceAll(" ", "")}`}
                className="inline-flex items-center gap-2 rounded bg-[#b43a1a] px-4 py-2.5 text-[10px] font-bold text-white hover:bg-[#922c13]"
              >
                <Phone size={13} /> Appeler le standard
              </a>
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 rounded bg-[#f2ecea] px-4 py-2.5 text-[10px] font-bold text-[#493d37] hover:bg-[#e9dfdc]"
              >
                <Mail size={13} /> Envoyer un courriel
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <article className="rounded-lg border border-[#eee5e2] bg-white p-5 shadow-sm md:p-6">
            <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#52715f]">
              Venir au centre
            </p>
            <h2 className="mt-1 font-serif text-2xl">Repères &amp; accès</h2>
            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#e7f0ea] text-[#315b43]">
                  <MapPin size={15} />
                </span>
                <div>
                  <h3 className="text-xs font-semibold">Au cœur de Bouaké</h3>
                  <p className="mt-1 text-[10px] leading-4 text-[#786e69]">
                    Quartier Commerce, avenue de la Paix. Recherchez « Centre
                    Culturel Jacques Aka » dans votre application de navigation.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#f8e9e4] text-[#b43a1a]">
                  <Users size={15} />
                </span>
                <div>
                  <h3 className="text-xs font-semibold">
                    Accueil des visiteurs
                  </h3>
                  <p className="mt-1 text-[10px] leading-4 text-[#786e69]">
                    L’accueil peut vous renseigner sur les spectacles, les
                    visites et les services du centre.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#f7efdf] text-[#8b5d22]">
                  <CalendarDays size={15} />
                </span>
                <div>
                  <h3 className="text-xs font-semibold">Avant votre visite</h3>
                  <p className="mt-1 text-[10px] leading-4 text-[#786e69]">
                    Consultez l’agenda pour vérifier les dates, horaires et
                    informations propres à chaque événement.
                  </p>
                  <Link
                    href="/web/agenda"
                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#b43a1a]"
                  >
                    Voir l’agenda <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          </article>
          <div className="relative min-h-44 overflow-hidden rounded-lg bg-[#211b19]">
            <Image
              src="/images/ccjabpic1.png"
              alt="Le Centre Culturel Jacques Aka à Bouaké"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/75">
                  Patrimoine culturel · Bouaké
                </p>
                <p className="mt-1 font-serif text-xl">
                  Un lieu de rencontres et de création
                </p>
              </div>
              <ArrowDownRight size={20} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 md:px-8 md:pb-16">
        <div className="flex flex-col items-start justify-between gap-4 rounded-lg bg-[#eee8e6] p-6 md:flex-row md:items-center md:px-8 md:py-7">
          <div className="border-l-2 border-[#b43a1a] pl-4">
            <p className="max-w-3xl font-serif text-lg italic leading-relaxed md:text-xl">
              Un lieu ouvert à la pensée, au dialogue et à l’émotion scénique.
            </p>
            <p className="mt-2 text-[8px] font-semibold uppercase tracking-wide text-[#786e69]">
              Centre Culturel Jacques Aka
            </p>
          </div>
          <a
            href={`tel:${phone.replaceAll(" ", "")}`}
            className="inline-flex shrink-0 items-center gap-2 rounded bg-[#b43a1a] px-4 py-3 text-[10px] font-bold text-white hover:bg-[#922c13]"
          >
            <Phone size={13} /> Appeler le standard
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-16 md:px-8 md:pb-20">
        <div className="mb-7 text-center">
          <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#b43a1a]">
            Réponses immédiates
          </p>
          <h2 className="mt-1 font-serif text-3xl md:text-4xl">
            Foire aux questions pratiques
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-[#786e69]">
            Quelques repères pour préparer votre venue, vos réservations et vos
            démarches au CCJAB.
          </p>
        </div>
        <div className="space-y-2">
          {FAQS.map((faq, index) => (
            <article
              key={faq.question}
              className="overflow-hidden rounded-md border border-[#f0eae8] bg-white"
            >
              <button
                type="button"
                aria-expanded={openFaqIndex === index}
                onClick={() =>
                  setOpenFaqIndex(openFaqIndex === index ? null : index)
                }
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-xs font-medium text-[#302723] md:px-5"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={15}
                  className={`shrink-0 text-[#b43a1a] transition-transform ${openFaqIndex === index ? "rotate-180" : ""}`}
                />
              </button>
              {openFaqIndex === index && (
                <p className="border-t border-[#f0eae8] px-4 py-4 text-xs leading-5 text-[#746b67] md:px-5">
                  {faq.answer}
                </p>
              )}
            </article>
          ))}
        </div>
        <div className="mt-5 rounded bg-[#f0eae8] px-4 py-4 text-center text-[10px] text-[#766b66]">
          Vous n’avez pas trouvé réponse à votre question ?{" "}
          <a
            className="font-semibold text-[#b43a1a] hover:underline"
            href={`tel:${phone.replaceAll(" ", "")}`}
          >
            Appelez directement notre standard au {phone}.
          </a>
        </div>
      </section>
    </main>
  );
}
