'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Ajout de usePathname
import { useAuth } from '@/lib/AuthContext';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth(); // On suppose que user contient { role: 'ADMIN' } etc.
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // 1. Si pas connecté -> Login
      if (!user) {
        router.replace(`/auth/login?redirect=${pathname}`);
        return;
      }

      // 2. Vérification des rôles
      // Si allowedRoles est vide, ça veut dire "accessible à tous les connectés"
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {

        // Redirection intelligente selon le rôle de l'utilisateur
        switch (user.role) {
          case 'ADMIN':
            router.replace('/dashboard/home');
            break;
          case 'FINANCIER':
            router.replace('/financial/home');
            break;
          case 'AGENT':
            router.replace('/agent/home');
            break;
          default:
            router.replace('/');
        }
      }
    }
  }, [user, loading, router, allowedRoles, pathname]);

  // Condition d'affichage du Loader :
  // - Chargement en cours
  // - Pas d'user (en attente de redirect)
  // - User présent mais mauvais rôle (en attente de redirect)
  const isUnauthorized = user && allowedRoles.length > 0 && !allowedRoles.includes(user.role);

  if (loading || !user || isUnauthorized) {
    return (
      <div className='flex items-center justify-center w-full h-[70vh]'>
        <DotLottieReact
          src="https://lottie.host/87d49e9a-b620-4950-bb21-4073579fc7d8/IIztQ7H0bp.lottie"
          loop
          autoplay
          className='w-80'
        />
      </div>
    );
  }

  return children;
}