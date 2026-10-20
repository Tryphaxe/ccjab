"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Youtube, Music } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Footer() {
  const router = useRouter();

  const [clickCount, setClickCount] = useState(0);

  const handleSecretAccess = (e) => {
    e.preventDefault();

    // On calcule le nouveau nombre
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Si on atteint 3 clics
    if (newCount === 3) {
      router.push('/auth/login');
      setClickCount(0); // On reset après redirection
    }

    setTimeout(() => {
      setClickCount(0);
    }, 1000);
  };
  return (
    <footer className="border-t border-[#e9dfdb] bg-[#f8f4f2] pb-8 pt-14 text-[#40332e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* COLONNE 1 : MARQUE */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Image
                onClick={handleSecretAccess} /* 4. IMPORTANT : on utilise onClick, pas onDoubleClick */
                alt="Logo CCJAB"
                src="/images/favicon.png"
                width={32}
                height={32}
                className="h-8 w-8 object-contain cursor-pointer active:scale-95 transition-transform" /* Ajout d'un petit effet visuel au clic */
                priority
              />
              <span className="font-serif text-xl font-bold tracking-tight text-[#33241f]">CENTRE<span className="text-[#b33a1a]">CULTUREL</span></span>
            </div>
            <p className="text-sm leading-relaxed text-[#81736e]">
              Le carrefour ideal de l'expression culturelle à Bouaké
            </p>
            <div className="flex gap-3 pt-2 items-center">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/share/p/1BDVJJtsMz/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-[#1877F2] text-white rounded-full hover:opacity-80 transition-all shadow-sm"
                title="Suivre sur Facebook"
              >
                <Facebook size={18} />
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@ccjab-tv?si=_qS64Dbhr7z1fFAJ"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-[#FF0000] text-white rounded-full hover:opacity-80 transition-all shadow-sm"
                title="S'abonner sur YouTube"
              >
                <Youtube size={18} />
              </a>

              {/* TikTok */}
              <a
                href="https://vm.tiktok.com/ZS9eP6EAxfCF8-zbKMl/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-all shadow-sm"
                title="Suivre sur TikTok"
              >
                {/* Utilisation de l'icône FontAwesome ou Music si Lucide n'a pas TikTok */}
                <i className="fa-brands fa-tiktok text-[16px]"></i>
              </a>
            </div>
          </div>

          {/* COLONNE 2 : LIENS */}
          <div>
            <h4 className="mb-5 font-serif text-lg text-[#33241f]">Plan du site</h4>
            <ul className="space-y-3">
              <FooterLink href="/web/home" label="Accueil" />
              <FooterLink href="/web/agenda" label="Programmation" />
              <FooterLink href="/web/espaces" label="Location de salle" />
              <FooterLink href="/web/contact" label="Contact & Accès" />
            </ul>
          </div>

          {/* COLONNE 3 : CONTACT */}
          <div>
            <h4 className="mb-5 font-serif text-lg text-[#33241f]">Nous trouver</h4>
            <ul className="space-y-4 text-sm text-[#81736e]">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#b33a1a]" />
                <span>Centre Culturel Jacques Aka,<br />Bouaké, Côte d'Ivoire</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-[#b33a1a]" />
                <span>+225 01 50 985 220</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-[#b33a1a]" />
                <span>jacquesaka1974@gmail.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 font-serif text-lg text-[#33241f]">La vie du centre</h4>
            <ul className="space-y-3">
              <FooterLink href="/web/historique" label="Notre histoire" />
              <FooterLink href="/web/mediatheque" label="Médiathèque" />
              <FooterLink href="/web/ludotheque" label="Ludothèque" />
              <FooterLink href="/web/contact" label="Accès & horaires" />
            </ul>
            <Link href="/web/actualites" className="mt-5 inline-flex items-center rounded-sm bg-[#315b43] px-4 py-2 text-[10px] font-semibold text-white transition hover:bg-[#244734]">Suivre nos actualités</Link>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-[#e9dfdb] pt-6 text-sm text-[#95857e] md:flex-row">
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
          <Link href={href} className="inline-flex items-center gap-1 text-[#81736e] transition-all hover:translate-x-1 hover:text-[#a83113]">
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
