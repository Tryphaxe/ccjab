"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Ticket,
  Share2,
  Landmark,
  Info,
  UsersRound,
  Music2,
  ImageIcon,
  X,
  ExternalLink,
} from "lucide-react";
import PublicTicketSales from "@/components/PublicTicketSales";

const FALLBACK_IMAGE = "/images/ccjabpic.jpg";
const asDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
const formatDate = (
  value,
  options = { weekday: "long", day: "numeric", month: "long", year: "numeric" },
) => {
  const date = asDate(value);
  return date
    ? new Intl.DateTimeFormat("fr-FR", options).format(date)
    : "Date à confirmer";
};
const titleOf = (event) =>
  event?.nom_evenement || event?.description || "Rendez-vous culturel";
const venueOf = (event) =>
  event?.salles
    ?.map((salle) => salle.nom_salle)
    .filter(Boolean)
    .join(" · ") || "Centre Culturel Jacques Aka";

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    Promise.all([
      fetch(`/api/web/even/${encodeURIComponent(id)}`).then(
        async (response) => {
          if (!response.ok)
            throw new Error(
              response.status === 404
                ? "Cet événement n’est pas disponible."
                : "Impossible de charger cet événement.",
            );
          return response.json();
        },
      ),
      fetch("/api/web/even")
        .then((response) => (response.ok ? response.json() : []))
        .catch(() => []),
    ])
      .then(([eventData, eventList]) => {
        if (!active) return;
        setEvent(eventData);
        setRelated(
          Array.isArray(eventList)
            ? eventList
                .filter(
                  (item) =>
                    item.id !== eventData.id &&
                    new Date(item.date_fin) >= new Date(),
                )
                .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))
                .slice(0, 3)
            : [],
        );
      })
      .catch((loadError) => {
        if (active)
          setError(loadError.message || "Impossible de charger cet événement.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!posterOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setPosterOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [posterOpen]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-[72px] min-h-[60vh] bg-[#fbf8f7] px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="h-72 animate-pulse bg-[#eee5e1]" />
          <div className="mt-8 h-8 w-1/2 animate-pulse bg-[#eee5e1]" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <main className="mt-[72px] flex min-h-[60vh] items-center justify-center bg-[#fbf8f7] px-5 py-16 text-center">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#b33a1a]">
            Agenda culturel
          </p>
          <h1 className="mt-3 font-serif text-3xl">
            {error || "Événement introuvable."}
          </h1>
          <p className="mt-2 text-sm text-[#796b65]">
            Il a peut-être été retiré de la programmation publique.
          </p>
          <Link
            href="/web/agenda"
            className="mt-6 inline-flex items-center gap-2 rounded-sm bg-[#b93313] px-4 py-3 text-xs font-bold text-white hover:bg-[#96270e]"
          >
            <ArrowLeft size={14} /> Retour à l’agenda
          </Link>
        </div>
      </main>
    );
  }

  const isPast = asDate(event.date_fin) && asDate(event.date_fin) < new Date();
  const eventType = event.type || event.categorie || "Culture";

  return (
    <div className="bg-[#fbf8f7] text-[#211b19]">
      {/* Event masthead */}
      <section className="relative isolate mt-[72px] overflow-hidden bg-[#211915]">
        <img
          src={event.image || FALLBACK_IMAGE}
          alt={titleOf(event)}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#fbf8f7]/95 via-[#fbf8f7]/80 to-[#fbf8f7]/30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#fbf8f7] via-transparent to-white/10" />
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-10 lg:px-12">
          <nav
            aria-label="Fil d’Ariane"
            className="mb-7 flex flex-wrap items-center gap-2 text-[8px] font-semibold uppercase tracking-[.15em] text-[#8b7770]"
          >
            <Link href="/web/home" className="hover:text-[#a83113]">
              Accueil
            </Link>
            <span>/</span>
            <Link href="/web/agenda" className="hover:text-[#a83113]">
              Agenda
            </Link>
            <span>/</span>
            <span className="text-[#b33a1a]">{eventType}</span>
          </nav>
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-sm bg-[#315b43] px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-white">
                {eventType}
              </span>
              {event.categorie && event.categorie !== eventType && (
                <span className="rounded-sm bg-[#f2dfb9] px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-[#634a22]">
                  {event.categorie}
                </span>
              )}
              {isPast && (
                <span className="rounded-sm bg-[#665b56] px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-white">
                  Événement passé
                </span>
              )}
            </div>
            <h1 className="font-serif text-4xl font-semibold leading-[1.02] tracking-[-.04em] text-[#211b19] sm:text-5xl lg:text-6xl">
              {titleOf(event)}
            </h1>
            {event.description && (
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#5e514b] sm:text-base">
                {event.description}
              </p>
            )}

            <div className="mt-6 grid max-w-3xl gap-2 rounded-sm border border-white/70 bg-white/75 p-3 shadow-sm backdrop-blur-sm sm:grid-cols-3 sm:p-4">
              <DetailMeta
                icon={CalendarDays}
                label="Date & horaire"
                value={`${formatDate(event.date_debut, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${asDate(event.date_debut) ? ` · ${asDate(event.date_debut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : ""}`}
              />
              <DetailMeta
                icon={MapPin}
                label="Plateau scénique"
                value={venueOf(event)}
              />
              <DetailMeta
                icon={Clock3}
                label="Format"
                value={
                  event.date_fin
                    ? `Fin à ${asDate(event.date_fin)?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) || "confirmer"}`
                    : "Horaire à confirmer"
                }
              />
            </div>
            {event.image && (
              <button
                type="button"
                onClick={() => setPosterOpen(true)}
                className="mt-3 inline-flex items-center gap-2 rounded-sm border border-[#a83113]/25 bg-white/80 px-3 py-2 text-[10px] font-semibold text-[#a83113] shadow-sm transition hover:bg-white"
              >
                <ImageIcon size={14} /> Voir l’affiche en grand
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main details and booking */}
      <main className="mx-auto grid max-w-7xl gap-8 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 lg:px-12">
        <div>
          <section>
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[.2em] text-[#b33a1a]">
              Le rendez-vous
            </p>
            <h2 className="font-serif text-3xl leading-tight sm:text-4xl">
              Un moment de culture à partager
            </h2>
            <div className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-7 text-[#6e5e57]">
              {event.description ||
                "Le Centre Culturel Jacques Aka vous donne rendez-vous pour découvrir cette proposition artistique et culturelle."}
            </div>
            <div className="mt-6 border-l-2 border-[#b93313] bg-[#f2ece9] px-5 py-4">
              <p className="text-[8px] font-bold uppercase tracking-[.18em] text-[#a83113]">
                L’esprit du CCJAB
              </p>
              <p className="mt-2 font-serif text-lg italic leading-relaxed text-[#51423c]">
                Un lieu de création, de rencontre et de transmission au cœur de
                Bouaké.
              </p>
            </div>
          </section>

          <section className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <FactCard
              icon={CalendarDays}
              label="Date"
              value={formatDate(event.date_debut, {
                day: "numeric",
                month: "short",
              })}
            />
            <FactCard icon={Music2} label="Discipline" value={eventType} />
            <FactCard
              icon={Landmark}
              label="Lieu"
              value={event.salles?.length || 1}
              suffix="espace"
            />
            <FactCard icon={UsersRound} label="Accueil" value="Tous publics" />
          </section>

          <section className="mt-8 rounded-sm border border-[#e9dfdb] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-[#b33a1a]" />
              <h2 className="font-serif text-xl">
                Informations pratiques & accueil public
              </h2>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoItem
                title="Accessibilité"
                text="Pour toute question liée à l’accueil ou à l’accessibilité, contactez l’équipe du CCJAB avant votre venue."
              />
              <InfoItem
                title="Billetterie"
                text="Les informations de tarif et de disponibilité sont communiquées par l’accueil du centre."
              />
              <InfoItem title="Lieu de l’événement" text={venueOf(event)} />
              <InfoItem
                title="Préparer votre venue"
                text={`${formatDate(event.date_debut)}${asDate(event.date_debut) ? ` à ${asDate(event.date_debut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : ""}`}
              />
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-sm border border-[#ece3df] bg-white p-5 shadow-md">
            <p className="text-[8px] font-bold uppercase tracking-[.18em] text-[#b33a1a]">
              Billetterie directe CCJAB
            </p>
            <h2 className="mt-1 font-serif text-2xl">Votre venue</h2>
            <div className="mt-4 border-y border-[#eee5e1] py-4">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#9a8982]">
                {isPast ? "Événement terminé" : "Date du spectacle"}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#3f332e]">
                {formatDate(event.date_debut, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[10px] text-[#81736e]">
                <Clock3 size={12} />
                {asDate(event.date_debut)?.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                }) || "Horaire à confirmer"}
              </p>
            </div>
            <div className="py-4">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#9a8982]">
                Lieu
              </p>
              <p className="mt-1 flex items-start gap-2 text-xs leading-5 text-[#51443e]">
                <MapPin size={14} className="mt-0.5 shrink-0 text-[#b33a1a]" />
                {venueOf(event)}
              </p>
            </div>
            <PublicTicketSales eventId={event.id} isPast={isPast} />
            <p className="border-t border-[#eee5e1] pt-3 text-[10px] leading-5 text-[#81736e]">
              Besoin d’aide pour votre réservation ? Contactez directement l’accueil du CCJAB.
            </p>
            <Link
              href="/web/contact"
              className="mt-4 flex items-center justify-center gap-2 rounded-sm bg-[#b93313] px-4 py-3.5 text-xs font-bold text-white transition hover:bg-[#96270e]"
            >
              Contacter l’accueil{" "}
              <ArrowRight size={14} />
            </Link>
            <button
              type="button"
              onClick={copyLink}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-sm bg-[#f2ece9] px-4 py-3 text-[10px] font-semibold text-[#574a44] transition hover:bg-[#e9dfdb]"
            >
              <Share2 size={13} />
              {copied ? "Lien copié" : "Partager cet événement"}
            </button>
            <p className="mt-4 flex items-center gap-2 text-[9px] text-[#81736e]">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#e0f1e8] text-[#315b43]">
                <Ticket size={12} />
              </span>
              Besoin d’aide ? +225 01 50 985 220
            </p>
          </div>
        </aside>
      </main>

      {/* More from the program */}
      {related.length > 0 && (
        <section className="border-t border-[#eee5e1] bg-[#f2ece9] py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[.2em] text-[#b33a1a]">
                  Prolonger l’expérience
                </p>
                <h2 className="font-serif text-3xl">Vous aimerez aussi</h2>
              </div>
              <Link
                href="/web/agenda"
                className="hidden items-center gap-1 text-[10px] font-semibold text-[#a83113] hover:underline sm:inline-flex"
              >
                Explorer toute la saison <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <RelatedEvent key={item.id} event={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {posterOpen && event.image && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Affiche de ${titleOf(event)}`}
          onClick={() => setPosterOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-6"
        >
          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 px-4 py-3 text-white sm:px-7">
            <p className="truncate text-xs font-medium">
              Affiche · {titleOf(event)}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={event.image}
                target="_blank"
                rel="noreferrer"
                onClick={(click) => click.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-sm bg-white/10 px-3 py-2 text-[10px] font-semibold hover:bg-white/20"
              >
                <ExternalLink size={13} /> Ouvrir l’image
              </a>
              <button
                type="button"
                onClick={() => setPosterOpen(false)}
                aria-label="Fermer l’affiche"
                className="rounded-sm bg-white/10 p-2 hover:bg-white/20"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <img
            src={event.image}
            alt={`Affiche complète de ${titleOf(event)}`}
            onClick={(click) => click.stopPropagation()}
            className="max-h-[88vh] max-w-[96vw] object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

function DetailMeta({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 rounded-sm bg-white/80 p-2.5">
      <span className="mt-0.5 text-[#b33a1a]">
        <Icon size={14} />
      </span>
      <span className="min-w-0">
        <span className="block text-[7px] font-bold uppercase tracking-wider text-[#9a8982]">
          {label}
        </span>
        <span className="mt-1 block text-[9px] font-medium leading-4 text-[#41342e]">
          {value}
        </span>
      </span>
    </div>
  );
}

function FactCard({ icon: Icon, label, value, suffix }) {
  return (
    <div className="rounded-sm border border-[#eee5e1] bg-white px-3 py-3 text-center">
      <Icon size={15} className="mx-auto mb-2 text-[#b33a1a]" />
      <p className="font-serif text-lg text-[#3f332e]">
        {value}
        {suffix ? ` ${suffix}` : ""}
      </p>
      <p className="mt-1 text-[7px] font-bold uppercase tracking-wider text-[#9a8982]">
        {label}
      </p>
    </div>
  );
}

function InfoItem({ title, text }) {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e0f1e8] text-[#315b43]">
        <Info size={12} />
      </span>
      <div>
        <h3 className="text-[10px] font-semibold text-[#41342e]">{title}</h3>
        <p className="mt-1 text-[9px] leading-4 text-[#81736e]">{text}</p>
      </div>
    </div>
  );
}

function RelatedEvent({ event }) {
  return (
    <Link
      href={`/web/agenda/${event.id}`}
      className="group overflow-hidden rounded-sm border border-[#e9dfdb] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={event.image || FALLBACK_IMAGE}
          alt={titleOf(event)}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-sm bg-[#b93313] px-2 py-1 text-[8px] font-bold uppercase text-white">
          {event.type || event.categorie || "Culture"}
        </span>
      </div>
      <div className="p-4">
        <p className="text-[8px] font-bold uppercase tracking-wider text-[#a83113]">
          {formatDate(event.date_debut, {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h3 className="mt-2 font-serif text-xl leading-snug">
          {titleOf(event)}
        </h3>
        <p className="mt-3 flex items-center justify-between text-[9px] text-[#81736e]">
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {venueOf(event)}
          </span>
          <ArrowRight size={13} className="text-[#a83113]" />
        </p>
      </div>
    </Link>
  );
}
