'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileSearch,
  Filter,
  History,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
  Pencil,
  Plus,
  Star,
  Layers3,
} from 'lucide-react';

const ACTIONS = [
  { value: '', label: 'Toutes les actions' },
  { value: 'CREATE', label: 'Création' },
  { value: 'UPDATE', label: 'Modification' },
  { value: 'DELETE', label: 'Suppression' },
  { value: 'PROMOTE', label: 'Mise à la une' },
];

const ENTITIES = [
  { value: '', label: 'Tous les éléments' },
  { value: 'Évènement', label: 'Évènements' },
  { value: 'Salle', label: 'Salles' },
  { value: 'Utilisateur', label: 'Utilisateurs' },
  { value: 'Publication', label: 'Publications' },
  { value: 'Commodité', label: 'Commodités' },
];

const ACTION_CONFIG = {
  CREATE: {
    label: 'Création',
    icon: Plus,
    color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 border-emerald-200/60',
    dot: 'bg-emerald-500',
  },
  UPDATE: {
    label: 'Modification',
    icon: Pencil,
    color: 'bg-blue-50 text-blue-700 ring-blue-600/20 border-blue-200/60',
    dot: 'bg-blue-500',
  },
  DELETE: {
    label: 'Suppression',
    icon: Trash2,
    color: 'bg-rose-50 text-rose-700 ring-rose-600/20 border-rose-200/60',
    dot: 'bg-rose-500',
  },
  PROMOTE: {
    label: 'Mise à la une',
    icon: Star,
    color: 'bg-amber-50 text-amber-700 ring-amber-600/20 border-amber-200/60',
    dot: 'bg-amber-500',
  },
};

const dateLabel = (date) => {
  if (!date) return 'Date inconnue';

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Date inconnue';

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
};

const inputClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-[#2e6655] focus:ring-4 focus:ring-[#2e6655]/10';

function MetricCard({ icon: Icon, label, value, description, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {value}
          </p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">{description}</p>
    </div>
  );
}

function EmptyState({ filtered }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50/80 text-gray-400 shadow-inner">
        {filtered ? <FileSearch size={26} /> : <ClipboardList size={26} />}
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">
        {filtered ? 'Aucun résultat trouvé' : 'Le journal est vide'}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-gray-500">
        {filtered
          ? 'Aucune activité ne correspond à vos critères de recherche. Essayez de réinitialiser les filtres.'
          : "Les actions effectuées sur la plateforme apparaîtront ici dès qu'elles seront enregistrées."}
      </p>
    </div>
  );
}

function AuditEntry({ entry, index }) {
  const config = ACTION_CONFIG[entry.action] || {
    label: entry.action || 'Action',
    icon: Activity,
    color: 'bg-gray-100 text-gray-700 ring-gray-500/20 border-gray-200',
    dot: 'bg-gray-400',
  };

  const Icon = config.icon;
  const changedFields = entry.metadata?.changedFields;

  return (
    <article className="group relative grid gap-4 px-6 py-4.5 transition-colors duration-150 hover:bg-gray-50/80 sm:px-8 lg:grid-cols-[minmax(210px,1fr)_minmax(280px,1.6fr)_minmax(160px,0.8fr)] lg:items-start">
      {/* Colonne 1 : Acteur */}
      <div className="flex min-w-0 items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50 text-gray-600 shadow-xs">
          <UserRound size={18} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {entry.actorName || 'Utilisateur inconnu'}
          </p>
          <p className="mt-0.5 truncate text-xs text-gray-500">
            {entry.actorEmail || 'E-mail non disponible'}
          </p>
          {entry.actorRole && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-md border border-gray-200/80 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
              <ShieldCheck size={11} className="text-[#2e6655]" />
              {entry.actorRole}
            </span>
          )}
        </div>
      </div>

      {/* Colonne 2 : Détails de l'action */}
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.color}`}
          >
            <Icon size={13} strokeWidth={2.2} />
            {config.label}
          </span>
          {entry.entity && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 shadow-xs">
              <Layers3 size={12} className="text-gray-400" />
              {entry.entity}
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed text-gray-800">
          {entry.summary || 'Aucune description disponible.'}
        </p>

        {Array.isArray(changedFields) && changedFields.length > 0 && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Champs modifiés
            </p>
            <div className="flex flex-wrap gap-1.5">
              {changedFields.map((field) => (
                <span
                  key={field}
                  className="rounded-md border border-blue-200/60 bg-white px-2 py-0.5 text-[11px] font-medium text-blue-900 shadow-2xs"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        {entry.entityId && (
          <p className="truncate font-mono text-[11px] text-gray-400">
            Ref : {entry.entityId}
          </p>
        )}
      </div>

      {/* Colonne 3 : Date et Index */}
      <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end lg:justify-start">
        <time
          dateTime={entry.createdAt}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500"
        >
          <Clock3 size={13} className="text-gray-400" />
          {dateLabel(entry.createdAt)}
        </time>
        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-gray-400">
          #{String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </article>
  );
}

export default function AuditPage() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAudit = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams({
      page: String(page),
      pageSize: '25',
    });

    if (search) params.set('q', search);
    if (action) params.set('action', action);
    if (entity) params.set('entity', entity);

    try {
      const response = await fetch(`/api/audit?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de charger les journaux.');
      }

      setEntries(data.entries || []);
      setTotal(data.total || 0);
      setPageCount(data.pageCount || 0);
    } catch (loadError) {
      setError(loadError.message || 'Impossible de charger les journaux.');
      setEntries([]);
      setTotal(0);
      setPageCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, action, entity]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(query.trim());
  };

  const resetFilters = () => {
    setQuery('');
    setSearch('');
    setAction('');
    setEntity('');
    setPage(1);
  };

  const hasFilters = Boolean(search || action || entity);

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-16 text-gray-900">
      <div className="space-y-8">
        
        {/* En-tête Principal */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
              <span>Administration</span>
              <span>/</span>
              <span className="font-semibold text-[#2e6655]">Journal d’audit</span>
            </div>
            <div className="mt-2 flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#683205] text-white shadow-md shadow-[#683205]/20">
                <ShieldCheck size={24} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Journal d’audit
                </h1>
                <p className="text-sm text-gray-500">
                  Suivi des actions et de la traçabilité des opérations de la plateforme.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={loadAudit}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 hover:border-gray-300 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#2e6655]' : ''} />
            Actualiser
          </button>
        </header>

        {/* Section Indicateurs (KPIs) */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            icon={ClipboardList}
            label="Total des actions"
            value={total.toLocaleString('fr-FR')}
            description="Résultats correspondant aux critères actifs."
            accent="bg-emerald-50 text-emerald-700"
          />
          <MetricCard
            icon={History}
            label="Page courante"
            value={`${page}${pageCount ? ` / ${pageCount}` : ' / —'}`}
            description="Pagination active (25 éléments par page)."
            accent="bg-blue-50 text-blue-700"
          />
          <MetricCard
            icon={CalendarClock}
            label="Éléments affichés"
            value={entries.length.toLocaleString('fr-FR')}
            description="Entrées chargées sur la vue actuelle."
            accent="bg-purple-50 text-purple-700"
          />
        </section>

        {/* Barre de Filtres et Recherche */}
        <section className="rounded-2xl border border-gray-200/80 bg-white shadow-xs">
          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
              <Filter size={17} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Filtres et recherche</h2>
              <p className="text-xs text-gray-500">Affinez l'historique par mots-clés ou par type d'événement.</p>
            </div>
          </div>

          <form onSubmit={applyFilters} className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Recherche texte */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Recherche</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Nom, e-mail, description..."
                    className={`${inputClass} pl-10`}
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Type d'action */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Type d'action</label>
                <div className="relative">
                  <select
                    value={action}
                    onChange={(e) => {
                      setAction(e.target.value);
                      setPage(1);
                    }}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    {ACTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Élément concerné */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Élément concerné</label>
                <div className="relative">
                  <select
                    value={entity}
                    onChange={(e) => {
                      setEntity(e.target.value);
                      setPage(1);
                    }}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    {ENTITIES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Actions du filtre & Badges actifs */}
            <div className="mt-5 flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {hasFilters ? (
                  <>
                    <span className="text-xs font-medium text-gray-500">Filtres actifs :</span>
                    {search && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                        Recherche: <strong className="font-medium">{search}</strong>
                      </span>
                    )}
                    {action && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                        {ACTION_CONFIG[action]?.label || action}
                      </span>
                    )}
                    {entity && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                        {entity}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-xs font-semibold text-[#2e6655] hover:underline ml-1"
                    >
                      Effacer tout
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">Aucun filtre supplémentaire appliqué.</span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    <X size={15} />
                    Réinitialiser
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#683205] px-5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#522704] focus:ring-4 focus:ring-[#683205]/20"
                >
                  <Search size={16} />
                  Filtrer
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Tableau / Liste du Journal d'Audit */}
        <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
          <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-6 py-4.5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#2e6655]">
                <Activity size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Historique des opérations</h2>
                <p className="text-xs text-gray-500">Journal chronologique des activités enregistrées.</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {loading ? 'Chargement...' : `${entries.length} entrée(s) affichée(s)`}
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#2e6655]">
                <LoaderCircle size={24} className="animate-spin" />
              </div>
              <p className="mt-4 text-sm font-semibold text-gray-800">Chargement en cours</p>
              <p className="mt-1 text-xs text-gray-400">Récupération des journaux d’audit...</p>
            </div>
          ) : error ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Activity size={22} />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-gray-900">Erreur de chargement</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-rose-600">{error}</p>
              <button
                type="button"
                onClick={loadAudit}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#683205] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#522704]"
              >
                <RefreshCw size={15} />
                Réessayer
              </button>
            </div>
          ) : entries.length === 0 ? (
            <EmptyState filtered={hasFilters} />
          ) : (
            <>
              {/* En-têtes des colonnes desktop */}
              <div className="hidden grid-cols-[minmax(210px,1fr)_minmax(280px,1.6fr)_minmax(160px,0.8fr)] gap-4 border-b border-gray-100 bg-gray-50/70 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 lg:grid">
                <span>Utilisateur</span>
                <span>Action et élément</span>
                <span className="text-right">Date et heure</span>
              </div>

              {/* Liste des entrées */}
              <div className="divide-y divide-gray-100">
                {entries.map((entry, index) => (
                  <AuditEntry
                    key={entry.id || index}
                    entry={entry}
                    index={(page - 1) * 25 + index}
                  />
                ))}
              </div>
            </>
          )}

          {/* Pied de tableau / Pagination */}
          {!loading && !error && pageCount > 0 && (
            <footer className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                Page <span className="font-semibold text-gray-800">{page}</span> sur{' '}
                <span className="font-semibold text-gray-800">{pageCount}</span>
                <span className="mx-2 text-gray-300">•</span>
                <span className="font-semibold text-gray-700">{total.toLocaleString('fr-FR')}</span> résultats au total
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                  Précédent
                </button>

                <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-[#683205] px-3 text-xs font-semibold text-white shadow-xs">
                  {page}
                </span>

                <button
                  type="button"
                  disabled={page >= pageCount}
                  onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Suivant
                  <ChevronRight size={15} />
                </button>
              </div>
            </footer>
          )}
        </section>

        {/* Note informative de sécurité */}
        <div className="flex items-start gap-3.5 rounded-2xl border border-emerald-900/10 bg-emerald-50/40 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#2e6655] shadow-xs">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Sécurité & Intégrité du Journal</h4>
            <p className="mt-1 text-xs leading-relaxed text-emerald-800/80">
              Ce journal consigne toutes les actions critiques. Les entrées sont immuables et réservées aux administrateurs disposant des habilitations de sécurité requises.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}