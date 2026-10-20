import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  HeartHandshake,
  Lightbulb,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

const MISSIONS = [
  {
    title: "La culture pour tous",
    text: "Favoriser l’accès à la culture pour tous, sans distinction, au cœur de Bouaké.",
    Icon: Target,
    tone: "bg-[#f8e9e4] text-[#b43a1a]",
  },
  {
    title: "Soutenir la création",
    text: "Encourager la création et l’expression artistique sous toutes leurs formes.",
    Icon: Sparkles,
    tone: "bg-[#f7efdf] text-[#8b5d22]",
  },
  {
    title: "Transmettre les savoirs",
    text: "Promouvoir la lecture, l’éducation et la formation continue des jeunes et des adultes.",
    Icon: BookOpen,
    tone: "bg-[#e7f0ea] text-[#315b43]",
  },
  {
    title: "Faire vivre le dialogue",
    text: "Offrir un cadre d’échanges et contribuer au renforcement du lien social.",
    Icon: Users,
    tone: "bg-[#f0eaf1] text-[#725077]",
  },
];

export default function HistoriquePage() {
  return (
    <main className="min-h-screen bg-transparent pt-[72px] text-[#211b19]">
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-9 md:px-8 md:pb-16 md:pt-14 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:gap-16">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.17em] text-[#b43a1a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b43a1a]" /> Héritage
            culturel · Bouaké
          </p>
          <h1 className="font-serif text-4xl leading-[1.05] tracking-tight md:text-6xl">
            Une histoire au service de la culture
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#746b67] md:text-base">
            Depuis son inauguration en 1974, le Centre Culturel Jacques Aka est
            un lieu de vie, de création et de transmission au cœur de Bouaké.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded bg-[#f2ecea] px-3 py-2 text-[10px] font-semibold text-[#514640]">
              <Building2 size={14} className="text-[#b43a1a]" /> Inauguré le 16
              février 1974
            </span>
            <Link
              href="/web/espaces"
              className="inline-flex items-center gap-2 rounded bg-[#b43a1a] px-4 py-3 text-xs font-bold text-white hover:bg-[#922c13]"
            >
              Découvrir le centre <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-lg bg-[#211b19] shadow-lg">
          <Image
            src="/images/jaka.jpeg"
            alt="Portrait de Jacques Aka Kacou"
            width={600}
            height={800}
            priority
            className="max-h-[500px] w-full object-cover object-top grayscale-[20%]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-5 pb-5 pt-16 text-white">
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/70">
              Une mémoire qui nous rassemble
            </p>
            <p className="mt-1 font-serif text-2xl">Jacques Aka Kacou</p>
            <p className="mt-1 text-[10px] text-white/75">1910 — 1963</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#eee5e2] bg-white/55 py-12 backdrop-blur-sm md:py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#52715f]">
              Repères historiques
            </p>
            <h2 className="mt-1 font-serif text-3xl md:text-4xl">
              Des origines à aujourd’hui
            </h2>
            <p className="mt-2 text-xs leading-5 text-[#786e69]">
              Un lieu culturel né de la volonté de faire une place durable aux
              arts, à la culture et au savoir à Bouaké.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="relative rounded-lg border border-[#eee5e2] bg-[#fbf8f7] p-5 md:p-6">
              <span className="text-[9px] font-bold uppercase tracking-wide text-[#b43a1a]">
                1910 — 1963
              </span>
              <h3 className="mt-2 font-serif text-2xl">Jacques Aka Kacou</h3>
              <p className="mt-2 text-xs leading-5 text-[#786e69]">
                Né le 22 juillet 1910 à Tiébissou, il fut une figure de la Côte
                d’Ivoire pré-indépendante et un compagnon de lutte de Félix
                Houphouët-Boigny.
              </p>
            </article>
            <article className="relative rounded-lg border border-[#eee5e2] bg-[#fbf8f7] p-5 md:p-6">
              <span className="text-[9px] font-bold uppercase tracking-wide text-[#b43a1a]">
                16 février 1974
              </span>
              <h3 className="mt-2 font-serif text-2xl">L’inauguration</h3>
              <p className="mt-2 text-xs leading-5 text-[#786e69]">
                Le Centre Culturel ivoiro-français de Bouaké est inauguré et
                prend le nom de Centre Culturel Jacques Aka, en hommage à sa
                mémoire.
              </p>
            </article>
            <article className="relative rounded-lg border border-[#eee5e2] bg-[#fbf8f7] p-5 md:p-6">
              <span className="text-[9px] font-bold uppercase tracking-wide text-[#b43a1a]">
                Aujourd’hui
              </span>
              <h3 className="mt-2 font-serif text-2xl">Un lieu vivant</h3>
              <p className="mt-2 text-xs leading-5 text-[#786e69]">
                Le centre poursuit sa vocation de lieu de création, de rencontre
                et de transmission pour les habitants de Bouaké et de la région
                du Gbêkê.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div className="relative min-h-[300px] overflow-hidden rounded-lg bg-[#211b19] shadow-md md:min-h-[400px]">
          <Image
            src="/images/ccjabpic1.png"
            alt="Bâtiment du Centre Culturel Jacques Aka à Bouaké"
            fill
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          <p className="absolute bottom-4 left-4 font-serif text-2xl text-white">
            Au cœur de Bouaké
          </p>
        </div>
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#b43a1a]">
            À propos de Jacques Aka
          </p>
          <h2 className="mt-1 font-serif text-3xl md:text-4xl">
            Un héritage tourné vers la culture
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-[#746b67]">
            <p>
              Jacques Aka Kacou fut commissaire-priseur de formation et
              négociant dans le café et le cacao. Il s’est également engagé dans
              la vie politique de la Côte d’Ivoire avant l’indépendance.
            </p>
            <p>
              La création du Centre Culturel à Bouaké prolonge l’idée qu’un
              développement durable s’appuie aussi sur la culture, la
              transmission et la vie artistique.
            </p>
            <p>
              À l’initiative du maire Djibo Sounkalo et de l’ambassadeur Jacques
              Raphaël Leygues, le centre est baptisé en son honneur lors de son
              inauguration en 1974.
            </p>
          </div>
          <div className="mt-6 border-l-2 border-[#b43a1a] bg-[#f2ecea] px-4 py-3">
            <p className="font-serif text-base italic leading-6 text-[#514640]">
              « La nation risquait de perdre son âme si elle délaissait le
              culturel. »
            </p>
            <p className="mt-1 text-[8px] font-semibold uppercase tracking-wide text-[#8b7b74]">
              Pensée attribuée à Jacques Aka Kacou
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#eee5e2] bg-white/55 py-12 backdrop-blur-sm md:py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-7 max-w-2xl">
            <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#52715f]">
              Notre engagement
            </p>
            <h2 className="mt-1 font-serif text-3xl md:text-4xl">
              Les missions du CCJAB
            </h2>
            <p className="mt-2 text-xs leading-5 text-[#786e69]">
              Fidèle à sa vocation, le centre œuvre pour une culture accessible
              et porteuse de rencontres.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MISSIONS.map(({ title, text, Icon, tone }) => (
              <article
                key={title}
                className="rounded-lg border border-[#eee5e2] bg-[#fbf8f7] p-5"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded ${tone}`}
                >
                  <Icon size={18} />
                </span>
                <h3 className="mt-4 font-serif text-xl">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#786e69]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-lg bg-[#315b43] text-white lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 md:p-10">
            <p className="inline-flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.17em] text-white/70">
              <Lightbulb size={13} /> Perspectives
            </p>
            <h2 className="mt-2 font-serif text-3xl leading-tight md:text-4xl">
              Un héritage qui continue d’évoluer
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/80">
              Soucieux de répondre aux besoins des populations, le Centre
              s’inscrit dans une dynamique de modernisation et d’extension. Le
              projet du nouveau Centre Culturel Jacques Aka prévoit des
              infrastructures et des équipements adaptés aux usages
              contemporains.
            </p>
            <Link
              href="/web/actualites"
              className="mt-6 inline-flex items-center gap-2 rounded bg-white px-4 py-3 text-xs font-bold text-[#315b43] hover:bg-[#f2ecea]"
            >
              Suivre les actualités du centre <ArrowRight size={14} />
            </Link>
          </div>
          <div className="relative min-h-[230px] lg:min-h-full">
            <Image
              src="/images/ccjabpic1.png"
              alt="Le bâtiment du CCJAB, lieu de transmission et de création"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#315b43] via-[#315b43]/20 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-[#315b43]/30" />
          </div>
        </div>
      </section>
      <section className="px-5 pb-14 md:px-8 md:pb-20">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 rounded-lg border border-[#eee5e2] bg-white p-6 md:flex-row md:items-center md:px-8">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#f8e9e4] text-[#b43a1a]">
              <HeartHandshake size={17} />
            </span>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#b43a1a]">
                Le CCJAB aujourd’hui
              </p>
              <h2 className="mt-1 font-serif text-2xl">
                Venez découvrir le centre
              </h2>
              <p className="mt-1 text-xs text-[#786e69]">
                Retrouvez les espaces, les activités et les informations
                pratiques.
              </p>
            </div>
          </div>
          <Link
            href="/web/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded bg-[#b43a1a] px-4 py-3 text-xs font-bold text-white hover:bg-[#922c13]"
          >
            Contact &amp; accès <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  );
}
