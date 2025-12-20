'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Arrière-plan décoratif (Formes floues) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-red-100/50 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100 relative z-10 text-center">
        
        {/* Icône et Titre */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Accès Refusé
          </h1>
          <p className="text-sm font-bold text-red-500 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">
            Erreur 403
          </p>
        </div>

        {/* Message explicatif */}
        <div className="text-gray-500">
          <p className="mb-4">
            Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
            <Lock className="inline w-3 h-3 mr-1 mb-0.5" /> 
            Cette zone est réservée aux <strong>Administrateurs</strong> et <strong>Agents</strong>.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col gap-3 pt-4">
          
          {/* Bouton Retour Accueil */}
          <Link 
            href="/web/home"
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-all duration-200 shadow-lg shadow-gray-900/10"
          >
            <Home size={18} />
            Retour à l'accueil
          </Link>

          {/* Bouton Connexion (si l'utilisateur n'est pas connecté) */}
          <Link 
            href="/auth/login"
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            <ArrowLeft size={18} />
            Se connecter avec un autre compte
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          Si vous pensez qu'il s'agit d'une erreur, contactez le support informatique.
        </div>
      </div>
    </div>
  );
}