'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, ArrowLeft, Clock, User, Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Fonction utilitaire vidéo
const isVideo = (url) => {
  return url && url.match(/\.(mp4|webm|ogg|mov)($|\?)/i);
};

export default function ArticleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/web/post/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Article introuvable');
          return res.json();
        })
        .then((data) => setPost(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 space-y-8">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-12 w-3/4 mb-8" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oups ! Article introuvable.</h2>
        <p className="text-gray-600 mb-6">Il semble que cet article n'existe plus ou a été déplacé.</p>
        <button onClick={() => router.back()} className="text-emerald-600 font-semibold hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Retour aux actualités
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* --- HEADER DE L'ARTICLE --- */}
      <div className="bg-gray-900 pt-32 pb-12 border-b border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button 
            onClick={() => router.push('/web/actualites')} 
            className="group flex items-center text-gray-500 hover:text-emerald-700 transition-colors mb-8 text-sm font-medium"
          >
            <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow-md mr-3 transition-all border border-gray-100">
                <ArrowLeft size={16} />
            </div>
            Retour aux actualités
          </button>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide">
              {post.type === 'PUB' ? 'Annonce' : 'Actualité'}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-emerald-600"/> 
              {new Date(post.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            {post.author && (
               <span className="flex items-center gap-1.5">
                <User size={14} className="text-emerald-600"/> 
                {post.author.name || 'Administration'}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-6">
            {post.titre}
          </h1>
        </div>
      </div>

      {/* --- CONTENU --- */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        
        {/* MEDIA PRINCIPAL */}
        {post.mediaUrl && (
          <div className="mb-12 rounded-2xl overflow-hidden shadow-xl bg-gray-100 ring-1 ring-gray-900/5">
            {isVideo(post.mediaUrl) ? (
              <video src={post.mediaUrl} controls className="w-full max-h-[600px] object-cover bg-black" />
            ) : (
              <img src={post.mediaUrl} alt={post.titre} className="w-full h-auto object-cover" />
            )}
          </div>
        )}

        {/* TEXTE DE L'ARTICLE */}
        <div className="prose prose-lg prose-emerald max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {post.contenu}
        </div>

        {/* PIED DE PAGE ARTICLE */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center">
          <div className="text-gray-500 text-sm italic">
            Publié le {new Date(post.createdAt).toLocaleDateString()}
          </div>
          <button className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors font-medium">
            <Share2 size={18} />
            <span className="hidden sm:inline">Partager cet article</span>
          </button>
        </div>
      </article>
    </div>
  );
}