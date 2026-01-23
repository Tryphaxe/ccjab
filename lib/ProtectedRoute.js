'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Stabilisation de allowedRoles pour le tableau de dépendances
  const rolesString = JSON.stringify(allowedRoles);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(`/auth/login?redirect=${pathname}`);
      return;
    }

    const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(user.role);

    if (!hasAccess) {
      switch (user.role) {
        case 'ADMIN': router.replace('/dashboard/home'); break;
        case 'FINANCIER': router.replace('/financial/home'); break;
        case 'EDITEUR': router.replace('/editor/home'); break;
        case 'AGENT': router.replace('/agent/home'); break;
        default: router.replace('/unauthorized');
      }
    }
  }, [user, loading, router, pathname, rolesString]);

  const isAuthorized = user && (allowedRoles.length === 0 || allowedRoles.includes(user.role));

  if (loading || !user || !isAuthorized) {
    return (
      <div className='flex items-center justify-center w-full h-[70vh]'>
        <DotLottieReact
          src="https://lottie.host/87d49e9a-b620-4950-bb21-4073579fc7d8/IIztQ7H0bp.lottie"
          loop autoplay className='w-80'
        />
      </div>
    );
  }

  return children;
}