'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, ArrowUpRight, LockKeyhole, ChevronDown, BookOpen, Puzzle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const links = [
  { name: 'Accueil', href: '/web/home' },
  { name: 'Agenda', href: '/web/agenda' },
  { name: 'Le CCJAB', href: '/web/historique' },
  { name: 'Espaces & location', href: '/web/espaces' },
  { name: 'Activités', href: '#activities', dropdown: true },
  { name: 'Actualités', href: '/web/actualites' },
  { name: 'Contact', href: '/web/contact' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/web/home';
  const isOverlay = isHome && !isScrolled;
  const active = (href) => pathname === href || (href !== '/web/home' && pathname.startsWith(`${href}/`));
  const activitiesActive = pathname.startsWith('/web/mediatheque') || pathname.startsWith('/web/ludotheque');
  const activityLinks = [
    { name: 'Médiathèque', href: '/web/mediatheque', Icon: BookOpen },
    { name: 'Ludothèque', href: '/web/ludotheque', Icon: Puzzle },
  ];

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 32);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, [pathname]);

  return (
    <>
      <motion.nav initial={{ y: -18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }} className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md transition-all duration-500 ${isOverlay ? 'border-white/15 bg-transparent shadow-none' : 'border-[#eee7e3] bg-[#fffdfc]/95 shadow-[0_2px_12px_rgba(55,30,20,.04)]'}`}>
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <Link href="/web/home" className="flex shrink-0 items-center gap-2.5" aria-label="CCJAB, accueil">
            <Image src="/images/favicon.png" alt="" width={34} height={34} className="h-[34px] w-[34px] object-contain" priority />
            <span className="flex flex-col leading-[1.05]">
              <span className={`font-serif text-[16px] font-bold tracking-tight transition-colors ${isOverlay ? 'text-white' : 'text-[#33241f]'}`}>CCJAB</span>
              <span className={`mt-1 text-[7px] font-semibold uppercase tracking-[.19em] transition-colors ${isOverlay ? 'text-white/75' : 'text-[#8a7770]'}`}>Bouaké · Côte d’Ivoire</span>
            </span>
          </Link>

          <div className="hidden items-center gap-3 lg:flex xl:gap-5">
            {links.map((link) => (
              link.dropdown ? <div key={link.name} className="group relative" onMouseEnter={() => setIsActivitiesOpen(true)} onMouseLeave={() => setIsActivitiesOpen(false)}>
                <button type="button" onClick={() => setIsActivitiesOpen((open) => !open)} onFocus={() => setIsActivitiesOpen(true)} aria-expanded={isActivitiesOpen} aria-haspopup="true" className={`relative inline-flex items-center gap-1 whitespace-nowrap py-2 text-[11px] font-medium transition-colors ${activitiesActive ? 'text-[#f07b4a]' : isOverlay ? 'text-white/90 hover:text-white' : 'text-[#574a44] hover:text-[#ac3214]'}`}>
                  Activités <ChevronDown size={12} className={`transition-transform ${isActivitiesOpen ? 'rotate-180' : ''}`} />
                  {activitiesActive && <span className={`absolute -bottom-[1px] left-0 h-0.5 w-full ${isOverlay ? 'bg-[#f07b4a]' : 'bg-[#b93313]'}`} />}
                </button>
                <AnimatePresence>{isActivitiesOpen && <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.98 }} transition={{ duration: 0.16 }} className="absolute left-1/2 top-full z-50 w-52 -translate-x-1/2 pt-2"><div className="rounded-md border border-[#eee7e3] bg-white p-1.5 shadow-xl">
                  {activityLinks.map(({ name, href, Icon }) => <Link key={href} href={href} onClick={() => setIsActivitiesOpen(false)} className={`flex items-center gap-2 rounded px-3 py-2.5 text-xs transition ${active(href) ? 'bg-[#f8eeeb] font-semibold text-[#ac3214]' : 'text-[#574a44] hover:bg-[#f8f4f2] hover:text-[#ac3214]'}`}><Icon size={14} />{name}</Link>)}
                </div></motion.div>}</AnimatePresence>
              </div> :
              <Link key={link.href} href={link.href} className={`relative whitespace-nowrap py-2 text-[11px] font-medium transition-colors ${active(link.href) ? isOverlay ? 'text-[#f07b4a]' : 'text-[#ac3214]' : isOverlay ? 'text-white/90 hover:text-white' : 'text-[#574a44] hover:text-[#ac3214]'}`}>
                {link.name}
                {active(link.href) && <span className={`absolute -bottom-[1px] left-0 h-0.5 w-full ${isOverlay ? 'bg-[#f07b4a]' : 'bg-[#b93313]'}`} />}
              </Link>
            ))}
          </div>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <Link href="/web/contact" className={`inline-flex items-center gap-1 rounded-sm px-3 py-2.5 text-[10px] font-bold transition-colors xl:px-4 ${isOverlay ? 'bg-white text-[#8f2b15] hover:bg-white/90' : 'bg-[#b93313] text-white hover:bg-[#96270e]'}`}>
              Réserver un espace <ArrowUpRight size={13} />
            </Link>
            {/* <Link href="/auth/login" aria-label="Accès équipe" title="Accès équipe" className="flex h-9 w-8 items-center justify-center rounded-sm bg-[#f1e9e5] text-[#a83113] transition hover:bg-[#e8d8d1]">
              <LockKeyhole size={14} />
            </Link> */}
          </div>

          <button type="button" onClick={() => setIsMenuOpen((open) => !open)} aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={isMenuOpen} className={`rounded-sm p-2 transition-colors lg:hidden ${isOverlay ? 'text-white hover:bg-white/10' : 'text-[#33241f] hover:bg-[#f5efec]'}`}>
            {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        <AnimatePresence>{isMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className={`overflow-hidden border-t px-4 pb-5 pt-2 shadow-lg lg:hidden ${isOverlay ? 'border-white/15 bg-[#201713]/95' : 'border-[#eee7e3] bg-[#fffdfc]'}`}>
            <div className="mx-auto max-w-7xl">
              {links.map((link) => (
                link.dropdown ? <div key={link.name} className={`border-b ${isOverlay ? 'border-white/10' : 'border-[#f0e9e5]'}`}>
                  <button type="button" onClick={() => setIsActivitiesOpen((open) => !open)} aria-expanded={isActivitiesOpen} className={`flex w-full items-center justify-between px-2 py-3 text-left text-sm ${activitiesActive ? 'font-semibold text-[#f07b4a]' : isOverlay ? 'text-white/90' : 'text-[#574a44]'}`}>
                    Activités <ChevronDown size={15} className={`transition-transform ${isActivitiesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isActivitiesOpen && <div className={`mb-2 ml-2 border-l pl-3 ${isOverlay ? 'border-white/20' : 'border-[#e8d8d1]'}`}>{activityLinks.map(({ name, href, Icon }) => <Link key={href} href={href} onClick={() => { setIsMenuOpen(false); setIsActivitiesOpen(false); }} className={`flex items-center gap-2 px-2 py-2.5 text-xs ${active(href) ? 'font-semibold text-[#f07b4a]' : isOverlay ? 'text-white/80' : 'text-[#756963]'}`}><Icon size={14} />{name}</Link>)}</div>}
                </div> :
                <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className={`block border-b px-2 py-3 text-sm ${isOverlay ? 'border-white/10' : 'border-[#f0e9e5]'} ${active(link.href) ? 'font-semibold text-[#f07b4a]' : isOverlay ? 'text-white/90' : 'text-[#574a44]'}`}>
                  {link.name}
                </Link>
              ))}
              <div className="mt-4 flex gap-2">
                <Link href="/web/contact" onClick={() => setIsMenuOpen(false)} className={`flex flex-1 items-center justify-center gap-2 rounded-sm px-3 py-3 text-xs font-bold ${isOverlay ? 'bg-white text-[#8f2b15]' : 'bg-[#b93313] text-white'}`}>Réserver un espace <ArrowUpRight size={14} /></Link>
                {/* <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} aria-label="Accès équipe" className="flex w-12 items-center justify-center rounded-sm bg-[#f1e9e5] text-[#a83113]"><LockKeyhole size={16} /></Link> */}
              </div>
            </div>
          </motion.div>
        )}</AnimatePresence>
      </motion.nav>
    </>
  );
}
