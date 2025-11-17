"use client";

import React, { useEffect, useState } from "react";
import { startOfWeek, endOfWeek, addWeeks, format } from "date-fns";
import { fr } from "date-fns/locale";

export default function WeeksEvents() {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [events, setEvents] = useState([]);

    const loadEvents = async (date) => {
        const start = startOfWeek(date, { weekStartsOn: 1 });
        const end = endOfWeek(date, { weekStartsOn: 1 });

        const res = await fetch(
            `/api/even/weeks?start=${start.toISOString()}&end=${end.toISOString()}`
        );

        const data = await res.json();
        setEvents(data);
    };

    useEffect(() => {
        loadEvents(currentWeek);
    }, [currentWeek]);

    const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
    const previousWeek = () => setCurrentWeek(addWeeks(currentWeek, -1));

    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });

    return (
        <div className="">
            {/* Navigation semaines */}
            <div className="sticky top-0 z-30 rounded-2xl mb-3 bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-4 border-b border-gray-200 flex items-center justify-between">
                <button onClick={previousWeek} className="bg-white/20 hover:bg-white/30 border-white text-white p-3 rounded-md">
                    ←
                </button>

                <h2 className="font-bold text-lg">
                    Semaine du {format(start, "dd MMM", { locale: fr })} au{" "}
                    {format(end, "dd MMM yyyy", { locale: fr })}
                </h2>

                <button onClick={nextWeek} className="bg-white/20 hover:bg-white/30 border-white text-white p-3 rounded-md">
                    →
                </button>
            </div>

            {/* Liste des événements */}
            <div className="space-y-3">
                {events.length === 0 && (
                    <p className="text-red-500 italic">Aucun évènement cette semaine.</p>
                )}

                {events.map((even) => (
                    <div
                        key={even.id}
                        className="bg-white p-5 rounded-xl shadow-sm transition duration-300 border border-gray-100" // Carte améliorée
                    >
                        {/* En-tête de la carte : Catégorie et Type */}
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                            <h3 className="font-extrabold text-xl text-orange-600 capitalize">
                                {/* <TrophyIcon className="w-5 h-5 inline mr-2" /> (Exemple d'icône) */}
                                {even.categorie}
                            </h3>
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                                {even.type}
                            </span>
                        </div>

                        {/* Détails du client */}
                        <div className="mb-4 text-sm text-gray-700">
                            {/* <UserIcon className="w-4 h-4 inline mr-2 text-gray-500" /> */}
                            Client : <span className="font-semibold text-gray-900">{even.nom_client ?? "—"}</span>
                            <span className="ml-2">({even.contact_client ?? "—"})</span>
                        </div>
                        <div className="mb-4 text-sm text-gray-700">
                            {/* <UserIcon className="w-4 h-4 inline mr-2 text-gray-500" /> */}
                            Agent assigné : <span className="font-semibold text-gray-900">{even.agent.name ?? "—"}</span>
                            <span className="ml-2">({even.agent.contact ?? "—"})</span>
                        </div>

                        {/* Dates de l'événement (Mise en page en grille pour un alignement propre) */}
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
                            <div>
                                <p className="font-medium text-gray-900 mb-1 flex items-center">
                                    {/* <ClockIcon className="w-4 h-4 inline mr-2 text-green-500" /> */}
                                    Début :
                                </p>
                                <p className="pl-6">
                                    {format(new Date(even.date_debut), "EEEE dd MMM yyyy HH:mm", { locale: fr })}
                                </p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 mb-1 flex items-center">
                                    {/* <ClockIcon className="w-4 h-4 inline mr-2 text-red-500" /> */}
                                    Fin :
                                </p>
                                <p className="pl-6">
                                    {format(new Date(even.date_fin), "EEEE dd MMM yyyy HH:mm", { locale: fr })}
                                </p>
                            </div>
                        </div>

                        {/* Montant et Avance (Mise en évidence) */}
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center text-sm">
                                <p className="text-gray-700 font-medium">Montant Total :</p>
                                <p className="text-lg font-bold text-green-600">
                                    {/* Utilisation de toLocaleString pour un meilleur format monétaire */}
                                    {(even.montant ?? 0).toLocaleString('fr-FR')} FCFA
                                </p>
                            </div>
                            <div className="flex justify-between items-center text-sm mt-1">
                                <p className="text-gray-700 font-medium">Avance Reçue :</p>
                                <p className="text-base font-bold text-yellow-600">
                                    {(even.avance ?? 0).toLocaleString('fr-FR')} FCFA
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
