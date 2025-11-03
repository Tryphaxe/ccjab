'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Loader2 } from 'lucide-react';

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
    <div className='flex items-center justify-center w-full h-[80vh]'>
      <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
    </div>
  );

  return children;
}