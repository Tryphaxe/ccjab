'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, ChevronDown } from 'lucide-react'; // Ajout de ChevronDown
import Image from 'next/image';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Effet pour changer le style au scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fonction utilitaire pour savoir si un lien est actif
  const isActive = (path) => pathname === path;

  // Configuration des liens avec sous-menus
  const navLinks = [
    { name: 'Accueil', href: '/web/home' },
    { name: 'Agenda', href: '/web/agenda' },
    { name: 'Nos Espaces', href: '/web/espaces' },
    { name: 'Actualités', href: '/web/actualite' }, // J'ai conservé Actualités si vous l'aviez ajouté précédemment
    { name: 'Contact', href: '/web/contact' },
    {
      name: 'À propos',
      href: '#', // Lien parent non cliquable ou redirigeant vers une page générale
      subLinks: [
        { name: 'Historique', href: '/web/historique' },
        { name: 'Médiathèque', href: '/web/mediatheque' },
        { name: 'Ludothèque', href: '/web/ludotheque' },
      ]
    },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-2' : 'bg-transparent py-4'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
            <Image
              alt="Logo CCJAB"
              src="/images/favicon.png"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
            <div className="flex flex-col leading-none">
              <span className={`font-bold text-xl tracking-tight ${scrolled ? 'text-gray-900' : 'text-white mix-blend-difference'}`}>
                CENTRE<span className="text-emerald-500">CULTUREL</span>
              </span>
              <span className={`text-[10px] font-medium tracking-widest uppercase ${scrolled ? 'text-gray-500' : 'text-gray-300 mix-blend-difference'}`}>
                JACQUES AKA
              </span>
            </div>
          </Link>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                {/* Si le lien a des sous-liens */}
                {link.subLinks ? (
                  <button
                    className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-emerald-500 py-2 ${scrolled ? 'text-gray-600' : 'text-white/90 hover:text-white mix-blend-difference'
                      }`}
                  >
                    {link.name}
                    <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                ) : (
                  /* Lien standard */
                  <Link
                    href={link.href}
                    className={`text-sm font-medium transition-colors relative hover:text-emerald-500 ${isActive(link.href)
                      ? 'text-emerald-600 font-bold'
                      : scrolled ? 'text-gray-600' : 'text-white/90 hover:text-white mix-blend-difference'
                      }`}
                  >
                    {link.name}
                    {isActive(link.href) && (
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-600 rounded-full"></span>
                    )}
                  </Link>
                )}

                {/* Dropdown (Menu déroulant) */}
                {link.subLinks && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-48 hidden group-hover:block hover:block">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                      {link.subLinks.map((subLink) => (
                        <Link
                          key={subLink.name}
                          href={subLink.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                          {subLink.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-emerald-600/30 hover:-translate-y-0.5">
              <Phone size={14} /> Appelez-nous
            </button>
          </div>

          {/* BOUTON MOBILE */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MENU MOBILE */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl animate-in slide-in-from-top-5 max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-6 space-y-2">
            {navLinks.map((link) => (
              <div key={link.name}>
                {link.subLinks ? (
                  /* Section avec sous-liens pour mobile */
                  <div className="space-y-1">
                    <div className="px-4 py-2 text-base font-bold text-gray-900">
                      {link.name}
                    </div>
                    <div className="pl-4 border-l-2 border-gray-100 ml-4 space-y-1">
                      {link.subLinks.map((subLink) => (
                        <Link
                          key={subLink.name}
                          href={subLink.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(subLink.href) ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                          {subLink.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Lien standard mobile */
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 text-base font-medium rounded-xl transition-colors ${isActive(link.href)
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
            <button className="w-full mt-4 bg-emerald-600 text-white px-5 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-600/20">
              Accéder à la billetterie
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}