'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, Megaphone, Search } from 'lucide-react';

const PAGE_SIZE = 6;
const DEFAULT_IMAGE = '/images/default-salle.png';
const isVideo = (url = '') => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
const formatDate = (date) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date));
const readingTime = (content = '') => Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 220));
const excerpt = (content = '') => content.replace(/\s+/g, ' ').trim();

function Media({ post, className = '' }) {
  if (post.mediaUrl && isVideo(post.mediaUrl)) {
    return <video src={post.mediaUrl} className={className} muted playsInline preload="metadata" />;
  }
  return <img src={post.mediaUrl || DEFAULT_IMAGE} alt={post.titre || 'Actualité du CCJAB'} className={className} />;
}

export default function ActualitePage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch('/api/web/post?type=ACTU')
      .then((response) => {
        if (!response.ok) throw new Error('Chargement impossible');
        return response.json();
      })
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch((err) => { console.error('Erreur chargement actualités:', err); setError(true); })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredPosts = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase('fr');
    return posts.filter((post) => {
      const matchesSearch = !term || `${post.titre || ''} ${post.contenu || ''}`.toLocaleLowerCase('fr').includes(term);
      return matchesSearch && (!featuredOnly || post.isPromoted);
    });
  }, [posts, searchTerm, featuredOnly]);
  const featuredPost = filteredPosts.find((post) => post.isPromoted) || filteredPosts[0];
  const archivePosts = filteredPosts.filter((post) => post.id !== featuredPost?.id);
  const pageCount = Math.ceil(archivePosts.length / PAGE_SIZE);
  const visiblePosts = archivePosts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const updateSearch = (value) => { setSearchTerm(value); setPage(0); };
  const updateFeatured = (value) => { setFeaturedOnly(value); setPage(0); };

  return (
    <main className="min-h-screen bg-[#fbf8f7] pt-[72px] text-[#211b19]">
      <section className="border-b border-[#eee5e2] bg-[#fbf8f7]">
        <div className="mx-auto max-w-7xl px-5 pb-8 pt-10 md:px-8 md:pb-10 md:pt-14">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b43a1a]">Chroniques &amp; vie culturelle · Bouaké</p>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl leading-tight tracking-tight md:text-6xl">Le Magazine du CCJAB</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#746b67] md:text-base">Rencontres, coulisses et récits de la vie culturelle au Centre Culturel Jacques Aka et dans la région du Gbêkê.</p>
            </div>
            <p className="shrink-0 text-xs text-[#746b67]">{posts.length} publication{posts.length > 1 ? 's' : ''}</p>
          </div>
          <div className="mt-7 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2" aria-label="Filtrer les actualités">
              <button onClick={() => updateFeatured(false)} className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-wide transition ${!featuredOnly ? 'bg-[#b43a1a] text-white' : 'bg-[#f0eae8] text-[#756c68] hover:bg-[#e8ddda]'}`}>Toutes ({posts.length})</button>
              <button onClick={() => updateFeatured(true)} className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-wide transition ${featuredOnly ? 'bg-[#b43a1a] text-white' : 'bg-[#f0eae8] text-[#756c68] hover:bg-[#e8ddda]'}`}>À la une</button>
            </div>
            <label className="relative block w-full md:max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8f8580]" />
              <input value={searchTerm} onChange={(event) => updateSearch(event.target.value)} placeholder="Chercher un article, un mot-clé…" className="w-full rounded-lg border border-[#eee5e2] bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#a19894] focus:border-[#b43a1a]" />
            </label>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        {isLoading ? (
          <div className="animate-pulse space-y-8"><div className="h-[360px] rounded-xl bg-[#eee8e5]" /><div className="grid gap-5 md:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-80 rounded-xl bg-[#eee8e5]" />)}</div></div>
        ) : error ? (
          <div className="rounded-xl border border-[#eadbd6] bg-white p-10 text-center text-sm text-[#746b67]">Les actualités ne sont pas disponibles pour le moment. Réessayez dans quelques instants.</div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#d9cbc6] bg-white px-6 py-16 text-center">
            <Megaphone className="mx-auto mb-4 text-[#b43a1a]" />
            <h2 className="font-serif text-2xl">Aucune publication trouvée</h2>
            <p className="mt-2 text-sm text-[#746b67]">Modifiez votre recherche ou affichez toutes les publications.</p>
          </div>
        ) : (
          <>
            {featuredPost && (
              <Link href={`/web/actualites/${featuredPost.id}`} className="group mb-12 grid overflow-hidden rounded-xl bg-white shadow-[0_3px_12px_rgba(40,24,18,0.08)] ring-1 ring-black/[0.04] md:grid-cols-[1.25fr_0.85fr]">
                <div className="relative min-h-[260px] overflow-hidden bg-[#211b19] md:min-h-[430px]">
                  <Media post={featuredPost} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                  <div className="absolute left-4 top-4 rounded bg-[#b43a1a] px-3 py-1 text-[9px] font-bold uppercase tracking-wide text-white">À la une · CCJAB</div>
                </div>
                <div className="flex flex-col justify-center p-6 md:p-9 lg:p-12">
                  <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold uppercase tracking-wide text-[#8b7770]"><span>{formatDate(featuredPost.createdAt)}</span><span className="flex items-center gap-1"><Clock3 size={12} /> {readingTime(featuredPost.contenu)} min de lecture</span></div>
                  <h2 className="font-serif text-3xl leading-tight tracking-tight md:text-4xl lg:text-[2.7rem]">{featuredPost.titre}</h2>
                  <p className="mt-4 line-clamp-4 text-sm leading-6 text-[#766d69]">{excerpt(featuredPost.contenu)}</p>
                  <div className="mt-7 flex items-center justify-between gap-3 border-t border-[#eee5e2] pt-5">
                    <span className="text-xs text-[#746b67]">{featuredPost.author?.name || 'Rédaction du CCJAB'}</span>
                    <span className="inline-flex items-center gap-2 rounded bg-[#b43a1a] px-4 py-3 text-xs font-bold text-white transition group-hover:bg-[#922c13]">Lire l’article <ArrowRight size={15} /></span>
                  </div>
                </div>
              </Link>
            )}

            <section aria-labelledby="recent-publications">
              <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#52715f]">Archives récentes &amp; dépêches</p><h2 id="recent-publications" className="mt-1 font-serif text-3xl">Les dernières publications</h2></div>
                <p className="text-xs text-[#8a807c]">{archivePosts.length} article{archivePosts.length > 1 ? 's' : ''}</p>
              </div>
              {visiblePosts.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visiblePosts.map((post) => (
                  <Link key={post.id} href={`/web/actualites/${post.id}`} className="group flex min-w-0 flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/[0.045] transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="relative h-52 overflow-hidden bg-[#211b19]"><Media post={post} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded bg-[#315b43] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white">Actualité</span>{post.contenu && <span className="absolute bottom-2 right-2 rounded bg-white/95 px-2 py-1 text-[9px] text-[#554a46]">{readingTime(post.contenu)} min</span>}</div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-[#8a7770]">{formatDate(post.createdAt)}{post.author?.name ? ` · ${post.author.name}` : ''}</p>
                      <h3 className="mt-2 line-clamp-2 font-serif text-xl leading-snug group-hover:text-[#b43a1a]">{post.titre}</h3>
                      <p className="mt-2 line-clamp-3 flex-1 text-xs leading-5 text-[#766d69]">{excerpt(post.contenu)}</p>
                      <span className="mt-5 inline-flex items-center gap-1 border-t border-[#f0eae8] pt-3 text-xs font-semibold text-[#b43a1a]">Lire la suite <ArrowRight size={14} /></span>
                    </div>
                  </Link>
                ))}
              </div> : <p className="rounded-lg bg-white p-6 text-sm text-[#746b67]">Aucune autre publication à afficher.</p>}
              {pageCount > 1 && <div className="mt-8 flex items-center justify-between border-t border-[#eee5e2] pt-5 text-xs text-[#746b67]">
                <span>Page {page + 1} sur {pageCount}</span><div className="flex gap-2"><button aria-label="Page précédente" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))} className="rounded border border-[#e8ddda] bg-white p-2 disabled:opacity-40"><ChevronLeft size={16} /></button><button aria-label="Page suivante" disabled={page + 1 >= pageCount} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))} className="rounded border border-[#e8ddda] bg-white p-2 disabled:opacity-40"><ChevronRight size={16} /></button></div>
              </div>}
            </section>
          </>
        )}
      </div>

      <section className="px-5 pb-14 md:px-8 md:pb-20"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 rounded-xl bg-[#315b43] px-6 py-8 text-white shadow-md md:flex-row md:items-center md:px-10 md:py-10"><div className="max-w-2xl"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">La vie culturelle à Bouaké</p><h2 className="mt-2 font-serif text-3xl leading-tight md:text-4xl">Suivez les actualités du CCJAB</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/75">Retrouvez les annonces, rencontres et récits qui font vivre le Centre Culturel Jacques Aka.</p></div><Link href="/web/contact" className="inline-flex shrink-0 items-center justify-center gap-2 rounded bg-white px-5 py-3 text-xs font-bold text-[#315b43] transition hover:bg-[#f3ebe8]">Contacter le CCJAB <ArrowRight size={15} /></Link></div></section>
    </main>
  );
}
