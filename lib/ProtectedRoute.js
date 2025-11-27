'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Loader, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/auth/login');
      else if (adminOnly && !isAdmin) router.replace('/dashboard/home');
    }
  }, [user, isAdmin, loading, router, adminOnly]);

  // Tant que user n'est pas chargé, on peut afficher un loader ou rien
  if (loading || (!user && !loading) || (adminOnly && !isAdmin)) return (
    <div className='flex items-center justify-center w-full h-[70vh]'>
      <DotLottieReact
        src="https://lottie.host/87d49e9a-b620-4950-bb21-4073579fc7d8/IIztQ7H0bp.lottie"
        loop
        autoplay
        className='w-120'
      />
    </div>
  );

  return children;
}