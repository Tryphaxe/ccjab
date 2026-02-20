'use client';

import React, { useState } from 'react';
import {
    Music, Menu, X, MapPin, Phone, Mail, Send,
    MessageSquare, Clock, Facebook, Instagram, Twitter,
    CheckCircle, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import Image from 'next/image';

// --- FAQ DATA ---
const FAQS = [
    {
        question: "Comment acheter des billets pour un spectacle ?",
        answer: "Vous pouvez acheter vos billets directement à l'accueil du centre, du lundi au samedi de 9h à 18h. Une billetterie en ligne sera bientôt disponible sur ce site."
    },
    {
        question: "Peut-on louer une salle pour un mariage ?",
        answer: "Oui, le Centre Culturel Jacques Aka dispose de plusieurs espaces adaptés aux réceptions privées (mariages, baptêmes). Contactez notre service commercial pour un devis."
    },
    {
        question: "Y a-t-il un parking sur place ?",
        answer: "Oui, un parking sécurisé de 200 places est disponible gratuitement pour les visiteurs lors des évènements."
    },
];

export default function ContactPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStatus('submitting');
        // Simulation d'envoi
        setTimeout(() => {
            setFormStatus('success');
            // Reset après 3 secondes
            setTimeout(() => setFormStatus('idle'), 5000);
        }, 1500);
    };

    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
            {/* ================= HEADER HERO ================= */}
            <section className="pt-32 pb-16 bg-emerald-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-800 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-900 rounded-full blur-3xl opacity-50"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contactez-nous</h1>
                    <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
                        Une question sur la programmation ? Une demande de location ? <br />
                        Notre équipe est à votre écoute pour vous accompagner.
                    </p>
                </div>
            </section>

            {/* ================= CONTENU PRINCIPAL ================= */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- CARTE D'INFORMATIONS (Gauche) --- */}
                    <div className="bg-emerald-800 text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between h-full lg:col-span-1">
                        <div>
                            <h3 className="text-2xl font-bold mb-6">Info Pratiques</h3>
                            <p className="text-emerald-100 mb-8 leading-relaxed">
                                Retrouvez-nous au cœur de Bouaké pour vibrer au rythme de la culture.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-emerald-700/50 rounded-lg flex items-center justify-center shrink-0">
                                        <MapPin className="text-emerald-300" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-emerald-200 uppercase tracking-wider mb-1">Adresse</h4>
                                        <p className="text-sm">Centre Culturel Jacques Aka<br />Bouaké, Côte d'Ivoire</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-emerald-700/50 rounded-lg flex items-center justify-center shrink-0">
                                        <Phone className="text-emerald-300" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-emerald-200 uppercase tracking-wider mb-1">Téléphone</h4>
                                        <p className="text-sm">+225 01 50 985 220</p>
                                        <p className="text-xs text-emerald-400 mt-1">Lun-Ven : 7h30 - 16h30</p>
                                        <p className="text-xs text-emerald-400 mt-1">Sam : 8h - 13h</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-emerald-700/50 rounded-lg flex items-center justify-center shrink-0">
                                        <Mail className="text-emerald-300" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-emerald-200 uppercase tracking-wider mb-1">Email</h4>
                                        <p className="text-sm break-all">jacquesaka1974@gmail.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <h4 className="font-bold text-sm text-emerald-200 uppercase tracking-wider mb-4">Réseaux Sociaux</h4>
                            <div className="flex gap-4">
                                <a
                                    href="https://www.facebook.com/share/p/1BDVJJtsMz/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-emerald-800 rounded-full hover:bg-emerald-600 transition-colors"
                                >
                                    <Facebook size={20} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* --- FAQ --- */}
                    <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100 lg:col-span-2">
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <HelpCircle className="text-emerald-600" /> Questions Fréquentes
                        </h3>
                        <div className="space-y-4">
                            {FAQS.map((faq, index) => (
                                <div key={index} className="border border-gray-100 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                    >
                                        <span className="font-semibold text-gray-800">{faq.question}</span>
                                        {openFaqIndex === index ? <ChevronUp size={18} className="text-emerald-600" /> : <ChevronDown size={18} className="text-gray-400" />}
                                    </button>
                                    {openFaqIndex === index && (
                                        <div className="p-4 bg-white text-gray-600 text-sm leading-relaxed border-t border-gray-100 animate-in slide-in-from-top-2">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= MAP & FAQ ================= */}
            <section className="py-16 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                        {/* --- GOOGLE MAP EMBED --- */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <MapPin className="text-emerald-600" /> Nous trouver
                            </h3>
                            <div className="w-full h-80 bg-gray-200 rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative">
                                {/* Placeholder Map - Remplacer src par votre lien Google Maps Embed */}
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.541481541624!2d-5.033622023249079!3d7.732298707920377!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfc88450f75f32b7%3A0x6b4a5d3f23479a0!2sCentre%20Culturel%20Jacques%20Aka!5e0!3m2!1sfr!2sci!4v1700000000000!5m2!1sfr!2sci"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="filter grayscale hover:grayscale-0 transition-all duration-500"
                                ></iframe>
                                <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md text-xs font-bold text-gray-700 pointer-events-none">
                                    Centre Culturel Jacques Aka
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 flex items-center justify-center">
                            <Image
                                alt="Logo CCJAB"
                                src="/images/favicon.png"
                                width={92}
                                height={92}
                                className="h-56 w-56 object-contain"
                                priority
                            />
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}