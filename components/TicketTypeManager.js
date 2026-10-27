"use client";

import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Check, Info, Loader2, Pencil, Plus, Ticket, ToggleLeft, ToggleRight, X } from 'lucide-react';
import SearchCombobox from '@/components/ui/search-combobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const money = (value) => new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
const toLocalDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

export default function TicketTypeManager() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: '', capacity: '', salesStart: '', salesEnd: '' });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    let active = true;
    fetch('/api/even', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Impossible de charger les événements.');
        return data;
      })
      .then((data) => {
        if (!active) return;
        setEvents(data);
        setEventId(data[0]?.id || '');
      })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const loadTypes = useCallback(async () => {
    if (!eventId) { setTypes([]); return; }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/even/${encodeURIComponent(eventId)}/tickets`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Impossible de charger les tarifs.');
      setTypes(data);
    } catch (loadError) {
      setError(loadError.message || 'Impossible de charger les tarifs.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { loadTypes(); }, [loadTypes]);

  async function save(event) {
    event.preventDefault();
    if (!eventId) return;
    setSaving(true); setError(''); setNotice('');
    try {
      const response = await fetch(`/api/even/${encodeURIComponent(eventId)}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: Number(form.price), capacity: Number(form.capacity), salesStart: form.salesStart || null, salesEnd: form.salesEnd || null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Impossible de créer ce tarif.');
      setForm({ name: '', description: '', price: '', capacity: '', salesStart: '', salesEnd: '' });
      setNotice('Tarif créé en brouillon. Activez-le après vérification.');
      await loadTypes();
    } catch (saveError) {
      setError(saveError.message || 'Impossible de créer ce tarif.');
    } finally {
      setSaving(false);
    }
  }

  async function updateType(type, changes) {
    setSaving(true); setError(''); setNotice('');
    try {
      const response = await fetch(`/api/even/${encodeURIComponent(eventId)}/tickets`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: type.id, ...changes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Impossible de modifier ce tarif.');
      setEditing(null);
      setNotice(changes.isActive ? 'Tarif publié.' : changes.isActive === false ? 'Tarif désactivé.' : 'Tarif mis à jour.');
      await loadTypes();
    } catch (updateError) {
      setError(updateError.message || 'Impossible de modifier ce tarif.');
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#a24701] focus:ring-2 focus:ring-[#a24701]/10';
  const selectedEvent = events.find((event) => event.id === eventId);
  const eventOptions = events.map((event) => {
    const date = new Date(event.date_debut).toLocaleDateString('fr-FR');
    const organizer = event.organise_par_ccjab ? 'CCJAB' : (event.nom_client || 'Client');
    return {
      value: event.id,
      label: `${event.nom_evenement || event.categorie} · ${organizer} · ${date}`,
      searchText: `${event.nom_evenement || ''} ${event.categorie || ''} ${event.nom_client || ''} ${organizer} ${date}`,
    };
  });

  return (
    <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="ticket-type-heading">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#a24701]"><Ticket size={19} /></span>
          <div><h2 id="ticket-type-heading" className="font-bold text-gray-950">Tarifs et quotas</h2><p className="mt-1 text-xs text-gray-500">Configurez les offres de billets pour les événements déjà enregistrés.</p></div>
        </div>
        <label className="min-w-0 text-xs font-semibold text-gray-600 sm:min-w-[280px]">Événement
          <div className="mt-1">
            <SearchCombobox
              value={eventId}
              onValueChange={(value) => { setEventId(value); setNotice(''); setError(''); }}
              options={eventOptions}
              placeholder={events.length ? 'Rechercher ou choisir un événement…' : 'Aucun événement disponible'}
              searchPlaceholder="Saisir le nom d’un événement…"
              emptyMessage="Aucun événement ne correspond à cette recherche."
              disabled={!events.length || loading}
            />
          </div>
        </label>
      </header>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}

      {!selectedEvent && !loading ? <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">Créez d’abord un événement pour configurer sa billetterie.</p> : <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
        <div className="space-y-3">
          <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-gray-800">Offres existantes</h3>{loading && <Loader2 size={15} className="animate-spin text-[#a24701]" />}</div>
          {!loading && types.length === 0 && <p className="rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500">Aucun tarif configuré pour cet événement.</p>}
          {types.map((type) => <article key={type.id} className="rounded-xl border border-gray-200 p-4">
            {editing?.id === type.id ? <form
              onSubmit={(event) => {
                event.preventDefault();
                updateType(type, {
                  name: editing.name,
                  description: editing.description,
                  price: Number(editing.price),
                  capacity: Number(editing.capacity),
                  salesStart: editing.salesStart ? new Date(editing.salesStart).toISOString() : null,
                  salesEnd: editing.salesEnd ? new Date(editing.salesEnd).toISOString() : null,
                });
              }}
              className="-m-1 space-y-5 rounded-xl border border-[#eadfd9] bg-[#fdfaf8] p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <span className="rounded-lg bg-white p-2 text-[#a24701] shadow-sm"><Pencil size={16} /></span>
                <div className="min-w-0 flex-1"><h4 className="text-sm font-bold text-gray-950">Modifier le tarif</h4><p className="mt-1 text-xs leading-5 text-gray-500">Les changements s’appliqueront aux prochaines commandes. Les billets déjà vendus restent inchangés.</p></div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`ticket-name-${type.id}`} className="text-xs font-semibold text-gray-700">Nom de l’offre</Label>
                  <Input id={`ticket-name-${type.id}`} required maxLength={80} value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} className="h-10 rounded-lg bg-white" placeholder="Ex. Tarif standard" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`ticket-price-${type.id}`} className="text-xs font-semibold text-gray-700">Prix unitaire <span className="font-normal text-gray-500">(FCFA)</span></Label>
                  <div className="relative"><Input id={`ticket-price-${type.id}`} required type="number" min="0" step="1" value={editing.price} onChange={(event) => setEditing({ ...editing, price: event.target.value })} className="h-10 rounded-lg bg-white pr-14" placeholder="0" /><span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-gray-400">FCFA</span></div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`ticket-description-${type.id}`} className="text-xs font-semibold text-gray-700">Description <span className="font-normal text-gray-500">(facultative)</span></Label>
                  <Textarea id={`ticket-description-${type.id}`} maxLength={500} rows={2} value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} className="min-h-20 resize-y rounded-lg bg-white" placeholder="Précisez ce qui est inclus dans ce tarif…" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`ticket-capacity-${type.id}`} className="text-xs font-semibold text-gray-700">Quota total <span className="font-normal text-gray-500">(billets)</span></Label>
                  <Input id={`ticket-capacity-${type.id}`} required type="number" min={Math.max(1, type.reserved)} step="1" value={editing.capacity} onChange={(event) => setEditing({ ...editing, capacity: event.target.value })} className="h-10 rounded-lg bg-white" />
                  <p className="text-[11px] leading-5 text-gray-500">{type.reserved} billet(s) vendu(s) ou réservé(s). Le quota ne peut pas être inférieur à ce nombre.</p>
                </div>
              </div>

              <details className="group rounded-lg border border-gray-200 bg-white p-3">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-gray-700"><CalendarDays size={15} className="text-[#a24701]" />Période de vente <span className="font-normal text-gray-400">(facultative)</span></summary>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor={`ticket-start-${type.id}`} className="text-xs font-medium text-gray-600">Début des ventes</Label><Input id={`ticket-start-${type.id}`} type="datetime-local" value={editing.salesStart} onChange={(event) => setEditing({ ...editing, salesStart: event.target.value })} className="h-10 rounded-lg" /></div>
                  <div className="space-y-2"><Label htmlFor={`ticket-end-${type.id}`} className="text-xs font-medium text-gray-600">Fin des ventes</Label><Input id={`ticket-end-${type.id}`} type="datetime-local" value={editing.salesEnd} onChange={(event) => setEditing({ ...editing, salesEnd: event.target.value })} className="h-10 rounded-lg" /></div>
                  <p className="flex gap-2 text-[11px] leading-5 text-gray-500 sm:col-span-2"><Info size={14} className="mt-0.5 shrink-0" />Laissez une date vide pour ne pas définir de limite de vente.</p>
                </div>
              </details>

              <div className="flex flex-col-reverse gap-2 border-t border-[#eadfd9] pt-4 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={saving} className="h-10 rounded-lg bg-white"><X size={15} />Annuler</Button>
                <Button type="submit" disabled={saving || !editing.name.trim() || !Number.isSafeInteger(Number(editing.price)) || Number(editing.price) < 0 || !Number.isSafeInteger(Number(editing.capacity)) || Number(editing.capacity) < type.reserved} className="h-10 rounded-lg bg-[#3e2315] text-white hover:bg-[#57341f]">{saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}{saving ? 'Enregistrement…' : 'Enregistrer les modifications'}</Button>
              </div>
            </form> : <div className="flex flex-wrap items-center justify-between gap-3">
              <div><div className="flex flex-wrap items-center gap-2"><h4 className="text-sm font-bold text-gray-900">{type.name}</h4><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${type.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{type.isActive ? 'En vente' : 'Brouillon'}</span></div><p className="mt-1 text-xs text-gray-500">{money(type.price)} · {type.reserved} réservé(s) sur {type.capacity} · {type.available} disponible(s)</p></div>
              <div className="flex items-center gap-1"><button type="button" onClick={() => setEditing({ id: type.id, name: type.name, description: type.description || '', price: String(type.price), capacity: String(type.capacity), salesStart: toLocalDateTime(type.salesStart), salesEnd: toLocalDateTime(type.salesEnd) })} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-[#e7c9b8] hover:bg-[#fff8f4] hover:text-[#8b3b12]"><Pencil size={13} />Modifier</button><button type="button" disabled={saving} onClick={() => updateType(type, { isActive: !type.isActive })} className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60">{type.isActive ? <ToggleRight size={15} className="text-emerald-700" /> : <ToggleLeft size={15} />}{type.isActive ? 'Désactiver' : 'Activer'}</button></div>
            </div>}
          </article>)}
        </div>

        <form onSubmit={save} className="space-y-3 rounded-xl bg-[#f8f6f5] p-4">
          <div><h3 className="text-sm font-semibold text-gray-900">Créer un tarif</h3><p className="mt-1 text-xs text-gray-500">Le tarif sera créé en brouillon.</p></div>
          <label className="block text-xs font-medium text-gray-700">Nom de l’offre<input required maxLength="80" placeholder="Tarif normal, tarif réduit…" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} /></label>
          <label className="block text-xs font-medium text-gray-700">Description (facultative)<input maxLength="500" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={inputClass} /></label>
          <div className="grid grid-cols-2 gap-3"><label className="text-xs font-medium text-gray-700">Prix (FCFA)<input required type="number" min="0" step="1" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className={inputClass} /></label><label className="text-xs font-medium text-gray-700">Quota<input required type="number" min="1" step="1" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} className={inputClass} /></label></div>
          <details className="rounded-lg bg-white p-3"><summary className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-700"><CalendarDays size={14} />Période de vente (facultative)</summary><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-[10px] text-gray-600">Début<input type="datetime-local" value={form.salesStart} onChange={(event) => setForm({ ...form, salesStart: event.target.value })} className={inputClass} /></label><label className="text-[10px] text-gray-600">Fin<input type="datetime-local" value={form.salesEnd} onChange={(event) => setForm({ ...form, salesEnd: event.target.value })} className={inputClass} /></label></div></details>
          <button type="submit" disabled={!eventId || saving} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#3e2315] px-4 py-3 text-sm font-semibold text-white hover:bg-[#57341f] disabled:opacity-60">{saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}Créer le tarif</button>
        </form>
      </div>}
      <p className="border-t border-gray-100 pt-3 text-[11px] leading-5 text-gray-500">Le tarif est associé à l’événement sélectionné. Il reste en brouillon jusqu’à son activation. Pour être visible au public, l’événement doit également être publié.</p>
    </section>
  );
}
