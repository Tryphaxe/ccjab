
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  ArrowDownUp,
  CalendarClock,
  CheckCircle2,
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
  ArrowRight,
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
    color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
    dot: 'bg-emerald-500',
  },
  UPDATE: {
    label: 'Modification',
    icon: Pencil,
    color: 'bg-blue-50 text-blue-700 ring-blue-600/10',
    dot: 'bg-blue-500',
  },
  DELETE: {
    label: 'Suppression',
    icon: Trash2,
    color: 'bg-rose-50 text-rose-700 ring-rose-600/10',
    dot: 'bg-rose-500',
  },
  PROMOTE: {
    label: 'Mise à la une',
    icon: Star,
    color: 'bg-amber-50 text-amber-700 ring-amber-600/10',
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
  'h-12 w-full rounded-xl border border-gray-200/80 bg-white px-3.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-[#2e6655] focus:ring-4 focus:ring-[#2e6655]/10';

function MetricCard({ icon: Icon, label, value, description, accent }) {
  return (
    <div className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.025)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-gray-950">
            {value}
          </p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-gray-400">{description}</p>
    </div>
  );
}

function EmptyState({ filtered }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-400">
        {filtered ? <FileSearch size={27} /> : <ClipboardList size={27} />}
      </div>
      <h3 className="mt-5 text-base font-semibold text-gray-900">
        {filtered ? 'Aucun résultat trouvé' : 'Le journal est encore vide'}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
        {filtered
          ? 'Aucune activité ne correspond à ces critères. Essaie de modifier les filtres.'
          : 'Les actions effectuées dans le tableau de bord apparaîtront ici lorsqu’elles seront enregistrées.'}
      </p>
    </div>
  );
}

function AuditEntry({ entry, index }) {
  const config = ACTION_CONFIG[entry.action] || {
    label: entry.action || 'Action',
    icon: Activity,
    color: 'bg-gray-100 text-gray-700 ring-gray-500/10',
    dot: 'bg-gray-400',
  };

  const Icon = config.icon;
  const changedFields = entry.metadata?.changedFields;

  return (
    <article className="group relative grid gap-4 px-5 py-5 transition hover:bg-[#f8faf9] sm:px-6 lg:grid-cols-[minmax(190px,0.8fr)_minmax(260px,1.4fr)_minmax(150px,0.65fr)] lg:items-start">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-500 shadow-sm">
          <UserRound size={18} strokeWidth={1.8} />
        </div>
        <div className="min-w-0 pt-0.5">
          <p className="truncate text-sm font-semibold text-gray-900">
            {entry.actorName || 'Utilisateur inconnu'}
          </p>
          <p className="mt-1 break-all text-xs text-gray-500">
            {entry.actorEmail || 'Adresse e-mail non disponible'}
          </p>
          {entry.actorRole && (
            <span className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              <ShieldCheck size={12} />
              {entry.actorRole}
            </span>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ring-1 ring-inset ${config.color}`}
          >
            <Icon size={13} />
            {config.label}
          </span>
          {entry.entity && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-gray-500">
              <Layers3 size={12} />
              {entry.entity}
            </span>
          )}
        </div>

        <p className="text-sm leading-6 text-gray-800">
          {entry.summary || 'Aucune description disponible.'}
        </p>

        {Array.isArray(changedFields) && changedFields.length > 0 && (
          <div className="mt-3 rounded-xl border border-blue-100/80 bg-blue-50/50 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
              Champs modifiés
            </p>
            <div className="flex flex-wrap gap-1.5">
              {changedFields.map((field) => (
                <span
                  key={field}
                  className="rounded-md border border-blue-100 bg-white px-2 py-1 text-[10px] font-medium text-blue-800"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        {entry.entityId && (
          <p className="mt-3 truncate font-mono text-[10px] text-gray-400">
            Référence : {entry.entityId}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end">
        <time
          dateTime={entry.createdAt}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500"
        >
          <Clock3 size={13} className="text-gray-400" />
          {dateLabel(entry.createdAt)}
        </time>
        <span className="text-[10px] text-gray-300">
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
    <main className="bg-[#f6f8f7] text-gray-900">
      <div className="space-y-7">
        {/* En-tête */}
        <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
              <span>Administration</span>
              <ChevronRight size={13} />
              <span className="font-medium text-[#2e6655]">Journal d’audit</span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#683205] text-white shadow-lg shadow-[#683205]/10">
                <ShieldCheck size={27} strokeWidth={1.7} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
                  Journal d’audit
                </h1>
                <p className="mt-1.5 text-sm leading-6 text-gray-500">
                  Suivez les actions et les modifications effectuées sur la plateforme.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={loadAudit}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60 lg:self-center"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Actualiser le journal
          </button>
        </header>

        {/* Bannière de présentation */}
        <section className="relative overflow-hidden rounded-3xl bg-[#683205] p-6 text-white shadow-sm sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/[0.08]" />
          <div className="pointer-events-none absolute -right-2 -top-14 h-52 w-52 rounded-full border border-white/[0.08]" />
          <div className="pointer-events-none absolute -bottom-28 right-1/3 h-48 w-48 rounded-full bg-emerald-300/[0.06] blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[11px] font-semibold text-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Traçabilité des opérations
              </span>
              <h2 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
                Chaque action compte.
                <br />
                Chaque modification laisse une trace.
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-emerald-50/70">
                Retrouvez qui a effectué une opération, sur quel élément et à quel moment,
                pour faciliter le suivi et la résolution des incidents.
              </p>
            </div>

            <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-5 md:min-w-[220px]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-100">
                <Activity size={23} />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-100/65">
                  Actions enregistrées
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">
                  {total.toLocaleString('fr-FR')}
                </p>
                <p className="mt-1 text-[10px] text-emerald-100/50">
                  Selon les filtres appliqués
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Indicateurs */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            icon={ClipboardList}
            label="Actions correspondantes"
            value={total.toLocaleString('fr-FR')}
            description="Nombre total de résultats pour les critères sélectionnés."
            accent="bg-emerald-50 text-emerald-700"
          />
          <MetricCard
            icon={History}
            label="Page consultée"
            value={`${page}${pageCount ? ` / ${pageCount}` : ' / —'}`}
            description="Navigation dans les journaux, 25 entrées par page."
            accent="bg-blue-50 text-blue-700"
          />
          <MetricCard
            icon={CalendarClock}
            label="Entrées affichées"
            value={entries.length.toLocaleString('fr-FR')}
            description="Nombre d’actions chargées sur cette page."
            accent="bg-violet-50 text-violet-700"
          />
        </section>

        {/* Filtres */}
        <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_3px_12px_rgba(15,23,42,0.025)]">
          <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-5 sm:px-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
              <Filter size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Rechercher dans les activités
              </h2>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                Filtrez les opérations par utilisateur, type d’action ou élément concerné.
              </p>
            </div>
          </div>

          <form onSubmit={applyFilters} className="p-5 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(220px,1.5fr)_minmax(170px,1fr)_minmax(170px,1fr)]">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-gray-600">
                  Recherche
                </span>
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Nom, e-mail, description..."
                    className={`${inputClass} pl-10`}
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      aria-label="Effacer la recherche"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-gray-600">
                  Type d’action
                </span>
                <div className="relative">
                  <select
                    value={action}
                    onChange={(event) => {
                      setAction(event.target.value);
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
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-gray-600">
                  Élément concerné
                </span>
                <div className="relative">
                  <select
                    value={entity}
                    onChange={(event) => {
                      setEntity(event.target.value);
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
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-h-8 flex-wrap items-center gap-2">
                {hasFilters ? (
                  <>
                    <span className="text-xs text-gray-500">Filtres actifs :</span>
                    {search && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-[11px] font-medium text-gray-700">
                        Recherche : {search}
                      </span>
                    )}
                    {action && (
                      <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-[11px] font-medium text-gray-700">
                        {ACTION_CONFIG[action]?.label || action}
                      </span>
                    )}
                    {entity && (
                      <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-[11px] font-medium text-gray-700">
                        {entity}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="ml-1 text-xs font-semibold text-[#2e6655] hover:underline"
                    >
                      Tout effacer
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">
                    Aucun filtre supplémentaire appliqué.
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  <X size={15} />
                  Réinitialiser
                </button>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#683205] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#245646] focus:outline-none focus:ring-4 focus:ring-[#683205]/15"
                >
                  <Search size={16} />
                  Rechercher
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Journal */}
        <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_3px_12px_rgba(15,23,42,0.025)]">
          <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf5f0] text-[#2e6655]">
                <Activity size={19} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Historique des opérations
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Les actions les plus récentes de la page courante.
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-[11px] font-medium text-gray-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {loading ? 'Synchronisation...' : `${entries.length} entrée(s) chargée(s)`}
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf5f0] text-[#2e6655]">
                <LoaderCircle size={24} className="animate-spin" />
              </div>
              <p className="mt-4 text-sm font-semibold text-gray-800">
                Chargement des activités
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Récupération des journaux d’audit...
              </p>
            </div>
          ) : error ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Activity size={22} />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-gray-900">
                Impossible de charger le journal
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-rose-700">
                {error}
              </p>
              <button
                type="button"
                onClick={loadAudit}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#683205] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245646]"
              >
                <RefreshCw size={15} />
                Réessayer
              </button>
            </div>
          ) : entries.length === 0 ? (
            <EmptyState filtered={hasFilters} />
          ) : (
            <>
              <div className="hidden grid-cols-[minmax(190px,0.8fr)_minmax(260px,1.4fr)_minmax(150px,0.65fr)] gap-4 border-b border-gray-100 bg-gray-50/80 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 lg:grid">
                <span>Utilisateur</span>
                <span>Action et élément</span>
                <span className="text-right">Date et heure</span>
              </div>

              <div className="divide-y divide-gray-100">
                {entries.map((entry, index) => (
                  <AuditEntry
                    key={entry.id}
                    entry={entry}
                    index={(page - 1) * 25 + index}
                  />
                ))}
              </div>
            </>
          )}

          {!loading && !error && pageCount > 0 && (
            <footer className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-gray-500">
                Page <span className="font-semibold text-gray-800">{page}</span>
                {' '}sur{' '}
                <span className="font-semibold text-gray-800">{pageCount}</span>
                <span className="mx-2 text-gray-300">·</span>
                <span className="font-medium text-gray-700">
                  {total.toLocaleString('fr-FR')}
                </span>{' '}
                résultat(s)
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                  Précédent
                </button>

                <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-[#683205] px-3 text-xs font-semibold text-white">
                  {page}
                </span>

                <button
                  type="button"
                  disabled={page >= pageCount}
                  onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Suivant
                  <ChevronRight size={15} />
                </button>
              </div>
            </footer>
          )}
        </section>

        {/* Note de sécurité */}
        <div className="flex items-start gap-3 rounded-2xl border border-[#dce9e1] bg-[#edf5f0]/70 p-4 sm:p-5">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#2e6655] shadow-sm">
            <ShieldCheck size={19} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#244d3c]">
              Traçabilité et sécurité
            </p>
            <p className="mt-1 text-xs leading-5 text-[#587263]">
              L’accès à cette page doit être réservé aux administrateurs autorisés.
              Pour préserver la fiabilité de l’audit, les journaux devraient être
              protégés contre toute modification ou suppression non autorisée.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
