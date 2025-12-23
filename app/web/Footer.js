"use client";

import React from 'react';
import Link from 'next/link';
import { Music, MapPin, Phone, Mail, Facebook, Instagram, Twitter, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Footer() {
  const router = useRouter();
  let clickCount = 0;

  const handleSecretAccess = (e) => {
    // Empêche le comportement normal du lien
    e.preventDefault();
    clickCount++;

    // Si on clique 3 fois rapidement
    if (clickCount === 3) {
      router.push('/auth/login');
    }

    // Reset après 1 seconde
    setTimeout(() => clickCount = 0, 1000);
  };
  return (
    <footer className="bg-gray-950 text-white pt-20 pb-10 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* COLONNE 1 : MARQUE */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Image
                onDoubleClick={handleSecretAccess}
                alt="Logo CCJAB"
                src="/images/favicon.png"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
              <span className="font-bold text-xl tracking-tight">CENTRE<span className="text-emerald-500">CULTUREL</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Le cœur battant de la culture à Bouaké. Concerts, théâtres, expositions et espaces de travail pour tous les passionnés d'art.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialIcon icon={Facebook} />
              <SocialIcon icon={Instagram} />
              <SocialIcon icon={Twitter} />
            </div>
          </div>

          {/* COLONNE 2 : LIENS */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Plan du site</h4>
            <ul className="space-y-3">
              <FooterLink href="/web/home" label="Accueil" />
              <FooterLink href="/web/agenda" label="Programmation" />
              <FooterLink href="/web/espaces" label="Location de salle" />
              <FooterLink href="/web/contact" label="Contact & Accès" />
            </ul>
          </div>

          {/* COLONNE 3 : CONTACT */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Nous trouver</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>Centre Culturel Jacques Aka,<br />Bouaké, Côte d'Ivoire</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-emerald-500 shrink-0" />
                <span>+225 07 07 07 07 07</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-emerald-500 shrink-0" />
                <span>contact@ccjab.ci</span>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <p>© {new Date().getFullYear()} RELAIS IT pour CCJAB. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-emerald-500 transition-colors">Mentions légales</Link>
            <Link href="#" className="hover:text-emerald-500 transition-colors">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Petits composants utilitaires pour le footer
function FooterLink({ href, label }) {
  return (
    <li>
      <Link href={href} className="text-gray-400 hover:text-emerald-400 hover:translate-x-1 transition-all inline-flex items-center gap-1">
        {label}
      </Link>
    </li>
  );
}

function SocialIcon({ icon: Icon }) {
  return (
    <a href="#" className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-all duration-300">
      <Icon size={18} />
    </a>
  );
}