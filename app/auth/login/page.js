'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Connexion réussie 🎉');
    } catch (error) {
      toast.error(error.message || 'Email ou mot de passe incorrect');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4efed] px-4 py-6 text-[#211b19] sm:px-8 sm:py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-[0_18px_60px_rgba(55,30,20,.12)] lg:min-h-[610px] lg:grid-cols-[1fr_0.9fr]">
        <section className="relative flex min-h-[230px] flex-col justify-between overflow-hidden bg-[#244b38] p-6 text-white sm:min-h-[280px] sm:p-9 lg:min-h-[610px] lg:p-10">
          <Image src="/images/ccjabpic.jpg" alt="Bâtiment du Centre Culturel Jacques Aka à Bouaké" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#143a2b]/80 via-[#244b38]/55 to-[#211b19]/80" />
          <div className="relative z-10 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded bg-white p-1.5"><Image src="/images/favicon.png" alt="" width={40} height={40} className="h-full w-full object-contain" /></span>
            <span><span className="block font-serif text-lg font-bold leading-tight">CCJAB</span><span className="mt-1 block text-[8px] font-semibold uppercase tracking-[.18em] text-white/70">Bouaké · Côte d’Ivoire</span></span>
          </div>
          <div className="relative z-10 mt-9 max-w-lg lg:mb-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">Espace professionnel</p>
            <h1 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">La culture se construit ensemble.</h1>
            <p className="mt-3 max-w-md text-xs leading-5 text-white/80 sm:text-sm sm:leading-6">Connectez-vous à votre espace de travail pour accéder aux outils du Centre Culturel Jacques Aka.</p>
          </div>
          <div className="relative z-10 hidden items-center gap-2 text-[9px] text-white/65 lg:flex"><ShieldCheck size={13} /> Accès réservé aux membres de l’équipe</div>
        </section>

        <section className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
          <Link href="/web/home" className="mb-8 inline-flex w-fit items-center gap-2 text-[10px] font-semibold text-[#81736e] transition hover:text-[#b43a1a]"><ArrowLeft size={13} /> Retour au site public</Link>
          <div className="mb-7">
            <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#b43a1a]">Bienvenue</p>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl">Connexion</h2>
            <p className="mt-2 text-xs leading-5 text-[#786e69]">Entrez vos identifiants pour accéder à votre espace.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-[10px] font-semibold text-[#493e39]">Adresse e-mail</label>
              <div className="relative"><Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#988a84]" /><input id="email" type="email" autoComplete="username" placeholder="nom@exemple.com" className="h-12 w-full rounded-md border border-[#e9dfdc] bg-[#fbf8f7] pl-10 pr-3 text-xs outline-none transition placeholder:text-[#a99d97] focus:border-[#b43a1a] focus:bg-white focus:ring-2 focus:ring-[#b43a1a]/10" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-[10px] font-semibold text-[#493e39]">Mot de passe</label>
              <div className="relative"><LockKeyhole size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#988a84]" /><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" className="h-12 w-full rounded-md border border-[#e9dfdc] bg-[#fbf8f7] pl-10 pr-11 text-xs outline-none transition focus:border-[#b43a1a] focus:bg-white focus:ring-2 focus:ring-[#b43a1a]/10" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#8c7f79] hover:text-[#b43a1a]">{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div>
            </div>
            <button type="submit" disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#b43a1a] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#922c13] disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Connexion en cours…</> : <>Se connecter <ArrowRight size={15} /></>}</button>
          </form>

          <p className="mt-6 border-t border-[#f0eae8] pt-5 text-center text-[9px] leading-4 text-[#918680]">L’accès à cet espace est réservé au personnel autorisé du CCJAB. En cas de difficulté, contactez votre administrateur.</p>
        </section>
      </div>
    </main>
  );
}
