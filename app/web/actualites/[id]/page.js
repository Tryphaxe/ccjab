"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Share2,
} from "lucide-react";

const isVideo = (url = "") => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
const formatDate = (date, options = {}) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  }).format(new Date(date));
const readingTime = (content = "") =>
  Math.max(
    1,
    Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 220),
  );
const getParagraphs = (content = "") =>
  content
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    Promise.all([
      fetch(`/api/web/post/${id}`).then((response) => {
        if (!response.ok) throw new Error("Article introuvable");
        return response.json();
      }),
      fetch("/api/web/post?type=ACTU").then((response) =>
        response.ok ? response.json() : [],
      ),
    ])
      .then(([article, posts]) => {
        if (!active) return;
        setPost(article);
        setRelatedPosts(
          Array.isArray(posts)
            ? posts.filter((item) => item.id !== article.id).slice(0, 3)
            : [],
        );
      })
      .catch((error) => {
        if (active)
          console.error("Erreur chargement de la publication:", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const handleShare = async () => {
    // On récupère l'URL exacte de la page actuelle
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.titre,
          text: post.titre + " " + ":" + " ",
          url: shareUrl,
        });
      } catch (error) {
        console.log("Partage annulé ou échoué", error);
      }
    } else {
      // Fallback pour les PC : on copie le lien dans le presse-papier
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          alert("Le lien de l'article a été copié dans votre presse-papier !");
        })
        .catch((err) => {
          console.error("Erreur lors de la copie", err);
        });
    }
  };

  if (loading)
    return (
      <main className="min-h-screen animate-pulse bg-[#fbf8f7] px-5 pb-16 pt-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 h-3 w-48 rounded bg-[#e9e0dd]" />
          <div className="h-14 max-w-3xl rounded bg-[#e9e0dd]" />
          <div className="mt-8 h-[420px] rounded-xl bg-[#e9e0dd]" />
          <div className="mt-10 h-64 max-w-3xl rounded bg-[#e9e0dd]" />
        </div>
      </main>
    );

  if (!post)
    return (
      <main className="flex min-h-[65vh] flex-col items-center justify-center bg-[#fbf8f7] px-5 pt-20 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b43a1a]">
          Publication indisponible
        </p>
        <h1 className="mt-3 font-serif text-3xl">
          Cette actualité est introuvable
        </h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#746b67]">
          Elle a peut-être été retirée ou son lien n’est plus valide.
        </p>
        <Link
          href="/web/actualites"
          className="mt-6 inline-flex items-center gap-2 rounded bg-[#b43a1a] px-4 py-3 text-sm font-semibold text-white"
        >
          <ArrowLeft size={16} /> Retour au magazine
        </Link>
      </main>
    );

  const paragraphs = getParagraphs(post.contenu || "");
  const authorName = post.author?.name || "Rédaction du CCJAB";

  return (
    <main className="min-h-screen bg-[#fbf8f7] pt-[72px] text-[#211b19]">
      <div className="mx-auto max-w-7xl px-5 pt-6 md:px-8 md:pt-9">
        <nav
          aria-label="Fil d’Ariane"
          className="mb-7 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-[#8d817c]"
        >
          <Link href="/web" className="hover:text-[#b43a1a]">
            Accueil
          </Link>
          <span>/</span>
          <Link href="/web/actualites" className="hover:text-[#b43a1a]">
            Actualités
          </Link>
          <span>/</span>
          <span className="text-[#b43a1a]">
            {post.type === "PUB" ? "Annonce" : "Chronique CCJAB"}
          </span>
        </nav>
        <div className="max-w-4xl">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#b43a1a]">
            {post.type === "PUB"
              ? "Annonce du CCJAB"
              : "Chroniques & vie culturelle · Bouaké"}
          </p>
          <h1 className="font-serif text-4xl leading-[1.08] tracking-tight md:text-6xl">
            {post.titre}
          </h1>
          {post.contenu && (
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#716763]">
              {paragraphs[0]?.replace(/\s+/g, " ").slice(0, 260)}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-[#e9dfdc] pb-5 text-xs text-[#746b67]">
            <span className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#315b43] text-[10px] font-bold text-white">
                {authorName.slice(0, 1).toUpperCase()}
              </span>
              <span>
                <strong className="block font-semibold text-[#302723]">
                  {authorName}
                </strong>
                <span className="text-[10px]">Rédaction culturelle</span>
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} className="text-[#b43a1a]" /> Publié le{" "}
              {formatDate(post.createdAt, {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 size={14} className="text-[#b43a1a]" />{" "}
              {readingTime(post.contenu)} min de lecture
            </span>
            <button
              onClick={handleShare}
              className="ml-auto inline-flex items-center gap-1.5 rounded border border-[#e9dfdc] bg-white px-3 py-2 text-xs font-semibold text-[#514640] transition hover:border-[#b43a1a] hover:text-[#b43a1a]"
            >
              <Share2 size={14} /> {copied ? "Lien copié" : "Partager"}
              {copied && <Check size={13} />}
            </button>
          </div>
        </div>

        {post.mediaUrl && (
          <figure className="mt-7 overflow-hidden rounded-xl bg-[#211b19] shadow-[0_5px_20px_rgba(40,24,18,0.14)]">
            {isVideo(post.mediaUrl) ? (
              <video
                src={post.mediaUrl}
                controls
                className="mx-auto max-h-[680px] w-full object-contain"
              />
            ) : (
              <img
                src={post.mediaUrl}
                alt={post.titre}
                className="mx-auto max-h-[680px] w-full object-contain"
              />
            )}
            <figcaption className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[9px] uppercase tracking-wide text-white/65">
              <span>
                {post.type === "PUB"
                  ? "Annonce · CCJAB"
                  : "Publication · CCJAB"}
              </span>
              <span>Centre Culturel Jacques Aka · Bouaké</span>
            </figcaption>
          </figure>
        )}

        <div className="mx-auto grid max-w-6xl gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_270px] lg:gap-14 lg:py-14">
          <article className="min-w-0">
            {paragraphs.length ? (
              <div className="space-y-5 font-serif text-[17px] leading-[1.9] text-[#433934] md:text-lg">
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={`${index}-${paragraph.slice(0, 20)}`}
                    className={
                      index === 0
                        ? "first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-serif first-letter:text-5xl first-letter:leading-none first-letter:text-[#b43a1a]"
                        : ""
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-[#827772]">
                Le contenu de cette publication n’est pas disponible.
              </p>
            )}
            <div className="mt-10 border-l-2 border-[#b43a1a] bg-[#f2ecea] px-5 py-4 text-sm leading-6 text-[#6d625d]">
              <span className="font-semibold text-[#3e342f]">
                À découvrir au CCJAB
              </span>
              <p className="mt-1">
                Retrouvez les actualités, les rencontres et les événements du
                Centre Culturel Jacques Aka.
              </p>
              <Link
                href="/web/agenda"
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#b43a1a]"
              >
                Voir l’agenda <ArrowRight size={13} />
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-between gap-4 border-y border-[#e9dfdc] py-4 text-xs">
              <Link
                href="/web/actualites"
                className="inline-flex items-center gap-2 font-semibold text-[#635852] hover:text-[#b43a1a]"
              >
                <ArrowLeft size={15} /> Toutes les actualités
              </Link>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 font-semibold text-[#635852] hover:text-[#b43a1a]"
              >
                <Share2 size={15} /> Partager
              </button>
            </div>
          </article>

          <aside className="space-y-4">
            <section className="rounded-lg border border-[#eee5e2] bg-white p-5 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#b43a1a]">
                Informations de lecture
              </p>
              <h2 className="mt-2 font-serif text-xl">Cette publication</h2>
              <dl className="mt-4 space-y-3 text-xs text-[#716763]">
                <div className="flex justify-between gap-3 border-b border-[#f0eae8] pb-2">
                  <dt>Rubrique</dt>
                  <dd className="font-medium text-[#3c332e]">
                    {post.type === "PUB" ? "Annonce" : "Actualité"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-[#f0eae8] pb-2">
                  <dt>Date</dt>
                  <dd className="text-right font-medium text-[#3c332e]">
                    {formatDate(post.createdAt)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Lecture</dt>
                  <dd className="font-medium text-[#3c332e]">
                    {readingTime(post.contenu)} min
                  </dd>
                </div>
              </dl>
              <button
                onClick={handleShare}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded bg-[#315b43] px-4 py-3 text-xs font-semibold text-white hover:bg-[#254a35]"
              >
                <Share2 size={14} /> Partager cette actualité
              </button>
            </section>
            <section className="rounded-lg bg-[#f0eae8] p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#52715f]">
                Le CCJAB à Bouaké
              </p>
              <h2 className="mt-2 font-serif text-xl">La culture se vit ici</h2>
              <p className="mt-2 text-xs leading-5 text-[#746b67]">
                Une programmation ouverte aux artistes, aux publics et à toutes
                les générations.
              </p>
              <Link
                href="/web/contact"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#b43a1a]"
              >
                Nous contacter <ArrowRight size={13} />
              </Link>
            </section>
          </aside>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <section className="border-t border-[#eee5e2] bg-[#f4efed] py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#52715f]">
                  Actualités &amp; récits
                </p>
                <h2 className="mt-1 font-serif text-3xl">
                  Poursuivre la lecture
                </h2>
              </div>
              <Link
                href="/web/actualites"
                className="hidden items-center gap-1 text-xs font-semibold text-[#b43a1a] sm:inline-flex"
              >
                Toutes les actualités <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedPosts.map((item) => (
                <Link
                  key={item.id}
                  href={`/web/actualites/${item.id}`}
                  className="group overflow-hidden rounded-lg bg-white shadow-sm"
                >
                  <div className="h-44 overflow-hidden bg-[#211b19]">
                    <img
                      src={item.mediaUrl || "/images/default-salle.png"}
                      alt={item.titre}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[9px] uppercase tracking-wide text-[#8a7770]">
                      {formatDate(item.createdAt)}
                    </p>
                    <h3 className="mt-2 line-clamp-2 font-serif text-xl leading-snug group-hover:text-[#b43a1a]">
                      {item.titre}
                    </h3>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#b43a1a]">
                      Lire la suite <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
