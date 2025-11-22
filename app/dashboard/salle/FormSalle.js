"use client";
import { useState } from "react";

export default function FormSalle({ commodites }) {
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const submit = async () => {
    const form = {
      nom: document.getElementById("nom").value,
      capacite: parseInt(document.getElementById("capacite").value),
      commodites: selected
    };

    await fetch("/api/salles", {
      method: "POST",
      body: JSON.stringify(form),
    });
  };

  return (
    <div className="space-y-4">
      <input id="nom" placeholder="Nom" className="border p-2 w-full" />
      <input id="capacite" placeholder="Capacité" className="border p-2 w-full" />

      <div className="mt-3 space-y-2">
        {commodites.map(c => (
          <label key={c.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              onChange={() => toggle(c.id)}
              checked={selected.includes(c.id)}
            />
            {c.nom}
          </label>
        ))}
      </div>

      <button
        onClick={submit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Ajouter la salle
      </button>
    </div>
  );
}