"use client";

import React, { useState, useRef, useEffect } from "react";
import { Funnel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { eventCategories, eventTypes } from '@/lib/list';
import { fetchAgents } from "@/utils/agentUtils";

export default function FiltreBar({ onApplyFilters }) {
    const [open, setOpen] = useState(false);
    const [agents, setAgents] = useState([])
    const [isloading, setIsLoading] = useState(true)
    const [filters, setFilters] = useState({
        agent: "",
        type: "",
        categorie: "",
        statut: "",
        date_debut: "",
        date_fin: "",
    });

    const dropdownRef = useRef(null);

    const handleChange = (name, value) => {
        setFilters({ ...filters, [name]: value });
    };

    // ✅ Fermer seulement si on clique vraiment en dehors du filtre
    useEffect(() => {
        fetchAgents(setAgents, setIsLoading);
        function handleClickOutside(event) {
            // 🧠 1. Si clic dans un menu Select Shadcn → ne rien faire
            if (event.target.closest('[role="listbox"]')) return;

            // 🧠 2. Si clic dans le conteneur du filtre → ne rien faire
            if (dropdownRef.current && dropdownRef.current.contains(event.target)) return;

            // 🧠 3. Sinon, fermer le filtre
            setOpen(false);
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left mb-3" ref={dropdownRef}>
            <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setOpen(!open)}
            >
                <Funnel className="w-5 h-5 text-gray-600" /> Filtrer
            </Button>

            {open && (
                <div className="absolute grid sm:grid-cols-3 grid-cols-2 mt-2 w-max bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4 gap-4">
                    {/* Agent */}
                    <Select value={filters.agent} onValueChange={(val) => handleChange("agent", val)}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Tous les agents" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Agents</SelectLabel>
                                {agents.map((agent) => (
                                    <SelectItem key={agent.id} value={agent.id}>
                                        {agent.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {/* Type */}
                    <Select value={filters.type} onValueChange={(val) => handleChange("type", val)}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Tous les types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Types</SelectLabel>
                                {eventTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {/* Catégorie */}
                    <Select value={filters.categorie} onValueChange={(val) => handleChange("categorie", val)}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Toutes les catégories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Catégories</SelectLabel>
                                {eventCategories.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {/* Statut */}
                    <Select value={filters.statut} onValueChange={(val) => handleChange("statut", val)}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Tous les statuts" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Statuts</SelectLabel>
                                <SelectItem value="Prévu">Prévu</SelectItem>
                                <SelectItem value="En cours">En cours</SelectItem>
                                <SelectItem value="Terminé">Terminé</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {/* Dates */}
                    <div className="flex flex-col gap-1">
                        <Label>Date début</Label>
                        <Input
                            type="datetime-local"
                            value={filters.date_debut}
                            onChange={(e) => handleChange("date_debut", e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Date fin</Label>
                        <Input
                            type="datetime-local"
                            value={filters.date_fin}
                            onChange={(e) => handleChange("date_fin", e.target.value)}
                        />
                    </div>

                    {/* Boutons */}
                    <div className="flex items-center justify-between gap-2 col-span-full">
                        <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                onApplyFilters(filters);
                                setOpen(false);
                            }}
                        >
                            Appliquer
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}