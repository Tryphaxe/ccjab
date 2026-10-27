'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle, ArrowUpRight, CheckCircle2, CircleDollarSign, ExternalLink,
  FlaskConical, Loader2, RefreshCw, ShieldCheck, Ticket, TriangleAlert, UsersRound,
} from 'lucide-react';
import TicketTypeManager from '@/components/TicketTypeManager';
import TicketBuyersTable from '@/components/TicketBuyersTable';
import SearchCombobox from '@/components/ui/search-combobox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const money = (amount) => `${new Intl.NumberFormat('fr-FR').format(amount)} FCFA`;
const inputClass = 'mt-1 w-full rounded-xl border border-[#e9e1e4] bg-white px-3 py-2.5 text-sm text-[#1b1b1d] outline-none transition focus:border-[#a93105] focus:ring-2 focus:ring-[#a93105]/10';

async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'La requête a échoué.');
  return data;
}

export default function TicketTestingPage() {
  const [diagnostics, setDiagnostics] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [ticketTypeId, setTicketTypeId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [paymentMode, setPaymentMode] = useState('geniuspay');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/tickets/diagnostics', { cache: 'no-store' }).then(readJson),
      fetch('/api/web/even', { cache: 'no-store' }).then(readJson),
    ]).then(([config, availableEvents]) => {
      if (!active) return;
      setDiagnostics(config);
      setPaymentMode(config.onlinePaymentAvailable ? 'geniuspay' : config.simulationAvailable ? 'simulation' : 'geniuspay');
      setEvents(Array.isArray(availableEvents) ? availableEvents : []);
      setEventId(Array.isArray(availableEvents) ? availableEvents[0]?.id || '' : '');
    }).catch((loadError) => {
      if (active) setError(loadError.message || 'Impossible de charger les informations de test.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const loadTicketTypes = useCallback(async () => {
    if (!eventId) { setTicketData(null); setTicketTypeId(''); return; }
    setLoadingTickets(true);
    setError('');
    try {
      const data = await fetch(`/api/web/even/${encodeURIComponent(eventId)}/tickets`, { cache: 'no-store' }).then(readJson);
      setTicketData(data);
      setTicketTypeId((current) => data.ticketTypes?.some((type) => type.id === current)
        ? current
        : data.ticketTypes?.find((type) => type.available > 0)?.id || '');
    } catch (loadError) {
      setTicketData(null);
      setError(loadError.message || 'Impossible de charger les tarifs de cet événement.');
    } finally {
      setLoadingTickets(false);
    }
  }, [eventId]);

  useEffect(() => { loadTicketTypes(); }, [loadTicketTypes]);

  const selectedEvent = events.find((event) => event.id === eventId);
  const selectedType = ticketData?.ticketTypes?.find((type) => type.id === ticketTypeId);
  const total = (selectedType?.price || 0) * quantity;
  const eventOptions = events.map((event) => {
    const date = new Date(event.date_debut).toLocaleDateString('fr-FR');
    return {
      value: event.id,
      label: `${event.nom_evenement || event.categorie} · ${date}`,
      searchText: `${event.nom_evenement || ''} ${event.categorie || ''} ${date}`,
    };
  });
  const ticketOptions = (ticketData?.ticketTypes || []).map((type) => ({
    value: type.id,
    label: `${type.name} · ${money(type.price)} · ${type.available} disponible(s)`,
    searchText: type.description,
    disabled: type.available < 1,
  }));

  async function startOrder(mode) {
    setError(''); setNotice(''); setOrder(null); setSubmitting(true);
    const checkoutTab = mode === 'geniuspay' ? window.open('about:blank', '_blank') : null;
    try {
      const created = await fetch('/api/web/ticket-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketTypeId, quantity, customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone, paymentMode: mode }),
      }).then(readJson);

      if (mode === 'geniuspay') {
        if (!created.checkoutUrl) throw new Error('Aucun lien de paiement n’a été retourné. Vérifiez la configuration Genius Pay.');
        setOrder(created);
        setNotice('Commande créée. Le paiement s’ouvre dans un nouvel onglet; vous pourrez revenir ici pour suivre son statut.');
        if (checkoutTab) checkoutTab.location.href = created.checkoutUrl;
        else window.location.assign(created.checkoutUrl);
        return;
      }

      const simulated = await fetch(`/api/web/ticket-orders/${encodeURIComponent(created.reference)}/simulate-payment`, { method: 'POST' }).then(readJson);
      const confirmed = await fetch(`/api/web/ticket-orders/${encodeURIComponent(created.reference)}`, { cache: 'no-store' }).then(readJson);
      setOrder(confirmed);
      setNotice(simulated.status === 'PAID' ? 'Simulation réussie : la commande est payée et les billets ont été émis.' : 'La simulation est terminée.');
      await loadTicketTypes();
    } catch (submitError) {
      checkoutTab?.close();
      setError(submitError.message || 'Impossible de lancer ce test.');
    } finally {
      setSubmitting(false);
    }
  }

  async function refreshOrder() {
    if (!order?.reference) return;
    setRefreshing(true); setError('');
    try {
      const latest = await fetch(`/api/web/ticket-orders/${encodeURIComponent(order.reference)}`, { cache: 'no-store' }).then(readJson);
      setOrder(latest);
      setNotice(latest.status === 'PAID' ? 'Paiement confirmé : les billets sont disponibles ci-dessous.' : 'Statut actualisé. En attente de la confirmation du paiement.');
    } catch (refreshError) {
      setError(refreshError.message || 'Impossible d’actualiser la commande.');
    } finally { setRefreshing(false); }
  }

  const statusTone = diagnostics?.onlinePaymentAvailable
    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
    : 'border-amber-200 bg-amber-50 text-amber-950';

  return (
    <main className="min-h-[75vh] space-y-6 bg-[#fcf8fb] py-3 text-[#1b1b1d]">
      <header className="flex flex-col justify-between gap-4 border-b border-[#e9e1e4] pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#f6ece8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.13em] text-[#a93105]"><Ticket size={13} /> Gestion des ventes · Bouaké</div>
          <h1 className="font-[Georgia] text-3xl font-semibold tracking-tight sm:text-4xl">Billetterie</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#765f58]">Assignez des tarifs aux événements, consultez les acheteurs et testez le paiement Wave.</p>
        </div>
        <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e9e1e4] bg-white px-3 py-2.5 text-sm font-semibold text-[#59413a] hover:bg-[#f8f5f6]"><RefreshCw size={15} /> Actualiser</button>
      </header>

      <Tabs defaultValue="assign" className="gap-5">
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-[#f0edef] p-1">
          <TabsTrigger value="assign" className="gap-2 rounded-lg py-3 text-xs sm:text-sm"><Ticket size={16} />Assignation</TabsTrigger>
          <TabsTrigger value="buyers" className="gap-2 rounded-lg py-3 text-xs sm:text-sm"><UsersRound size={16} />Acheteurs</TabsTrigger>
          <TabsTrigger value="tests" className="gap-2 rounded-lg py-3 text-xs sm:text-sm"><FlaskConical size={16} />Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="assign" className="mt-0">
          <TicketTypeManager />
        </TabsContent>

        <TabsContent value="buyers" className="mt-0">
          <TicketBuyersTable />
        </TabsContent>

        <TabsContent value="tests" className="mt-0 space-y-6">

      {error && <div role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertCircle className="mt-0.5 shrink-0" size={17} />{error}</div>}
      {notice && <div role="status" className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><CheckCircle2 className="mt-0.5 shrink-0" size={17} />{notice}</div>}

      <section className={`rounded-2xl border p-5 sm:p-6 ${statusTone}`} aria-labelledby="configuration-heading">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 rounded-xl bg-white/80 p-2.5"><ShieldCheck size={19} /></span>
          <div className="min-w-0 flex-1">
            <h2 id="configuration-heading" className="font-semibold">Configuration du paiement</h2>
            {loading ? <p className="mt-1 text-sm opacity-75">Vérification de la configuration…</p> : diagnostics ? (
              <>
                <p className="mt-1 text-sm">{diagnostics.onlinePaymentAvailable ? 'Les variables Genius Pay sont présentes.' : 'Le paiement en ligne Genius Pay n’est pas encore entièrement configuré.'}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(diagnostics.configured).map(([name, configured]) => <div key={name} className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-xs"><span className={`h-2 w-2 rounded-full ${configured ? 'bg-emerald-600' : 'bg-amber-500'}`} /><code className="break-all">{name}</code><span className="ml-auto font-semibold">{configured ? 'OK' : 'Manquante'}</span></div>)}
                </div>
                <p className="mt-3 text-xs opacity-80">{diagnostics.production ? 'Environnement de production.' : diagnostics.simulationAvailable ? 'Simulation locale disponible.' : 'Pour activer la simulation locale, définissez ENABLE_TICKET_PAYMENT_SIMULATION=true puis redémarrez le serveur.'}</p>
              </>
            ) : <p className="mt-1 text-sm">Configuration indisponible.</p>}
          </div>
        </div>
      </section>

      {!diagnostics?.production && diagnostics?.simulationAvailable && (
        <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950"><FlaskConical className="mt-0.5 shrink-0" size={17} /><p><strong>Mode simulation actif.</strong> Ce bouton crée une commande payée fictivement pour vérifier l’émission des billets. Aucun paiement réel n’est effectué.</p></div>
      )}
      {diagnostics?.production && <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"><TriangleAlert className="mt-0.5 shrink-0" size={17} /><p>La simulation est désactivée en production. Le test ci-dessous ouvrira un vrai parcours de paiement si les identifiants Genius Pay sont configurés.</p></div>}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
        <section className="rounded-2xl border border-[#eee8eb] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="order-heading">
          <div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-[#fae9e3] p-2.5 text-[#a93105]"><Ticket size={19} /></span><div><h2 id="order-heading" className="font-semibold">Commande d’essai</h2><p className="text-xs text-[#8d7169]">Choisissez un événement publié avec un tarif actif.</p></div></div>

          {loading ? <div className="flex items-center gap-2 py-10 text-sm text-[#765f58]"><Loader2 size={17} className="animate-spin" />Chargement des événements…</div> : events.length === 0 ? <div className="rounded-xl bg-[#f8f5f6] p-4 text-sm leading-6 text-[#765f58]">Aucun événement publié n’est disponible. Publiez un événement et activez au moins un tarif de billetterie avant de lancer le test.</div> : (
            <form onSubmit={(event) => { event.preventDefault(); startOrder(paymentMode); }} className="space-y-4">
              <label className="block text-xs font-semibold text-[#59413a]">Événement
                <div className="mt-1">
                  <SearchCombobox
                    value={eventId}
                    onValueChange={(value) => { setEventId(value); setOrder(null); setNotice(''); }}
                    options={eventOptions}
                    placeholder="Rechercher ou choisir un événement…"
                    searchPlaceholder="Saisir le nom d’un événement…"
                    emptyMessage="Aucun événement ne correspond à cette recherche."
                    disabled={!eventOptions.length}
                  />
                </div>
              </label>
              <label className="block text-xs font-semibold text-[#59413a]">Tarif actif{loadingTickets && <span className="ml-2 font-normal text-[#8d7169]">Chargement…</span>}
                <div className="mt-1">
                  <SearchCombobox
                    value={ticketTypeId}
                    onValueChange={setTicketTypeId}
                    options={ticketOptions}
                    placeholder={loadingTickets ? 'Chargement des tarifs…' : ticketOptions.length ? 'Rechercher ou choisir un tarif…' : 'Aucun tarif actif disponible'}
                    searchPlaceholder="Saisir le nom d’un tarif…"
                    emptyMessage="Aucun tarif ne correspond à cette recherche."
                    disabled={loadingTickets || !ticketOptions.length}
                  />
                </div>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-[#59413a]">Nom de test<input required maxLength={120} autoComplete="name" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Nom du testeur" className={inputClass} /></label>
                <label className="block text-xs font-semibold text-[#59413a]">E-mail<input required type="email" maxLength={254} autoComplete="email" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} placeholder="test@example.com" className={inputClass} /></label>
              </div>
              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold text-[#59413a]">Mode de test</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {diagnostics?.onlinePaymentAvailable && <label className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-xs ${paymentMode === 'geniuspay' ? 'border-[#a93105] bg-[#fff8f5]' : 'border-[#e9e1e4] bg-white'}`}><input type="radio" name="paymentMode" value="geniuspay" checked={paymentMode === 'geniuspay'} onChange={() => setPaymentMode('geniuspay')} className="mt-0.5 accent-[#a93105]" /><span><strong className="block text-[#3f332e]">Wave</strong><span className="mt-1 block leading-5 text-[#765f58]">Teste l’appel API et ouvre directement Wave.</span></span></label>}
                  {diagnostics?.simulationAvailable && <label className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-xs ${paymentMode === 'simulation' ? 'border-[#a93105] bg-[#fff8f5]' : 'border-[#e9e1e4] bg-white'}`}><input type="radio" name="paymentMode" value="simulation" checked={paymentMode === 'simulation'} onChange={() => setPaymentMode('simulation')} className="mt-0.5 accent-[#a93105]" /><span><strong className="block text-[#3f332e]">Simulation locale</strong><span className="mt-1 block leading-5 text-[#765f58]">Émet des billets de test sans contacter le prestataire.</span></span></label>}
                </div>
              </fieldset>
              <div className="grid gap-3 sm:grid-cols-[1fr_150px] sm:items-end">
                <label className="block text-xs font-semibold text-[#59413a]">Téléphone (facultatif)<input type="tel" maxLength={40} autoComplete="tel" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="+225 …" className={inputClass} /></label>
                <label className="block text-xs font-semibold text-[#59413a]">Quantité<input required type="number" min="1" max={Math.min(10, selectedType?.available || 10)} step="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(10, Number(event.target.value) || 1)))} className={inputClass} /></label>
              </div>

              {selectedType && <div className="flex items-center justify-between rounded-xl bg-[#f8f5f6] px-4 py-3 text-sm"><span className="flex items-center gap-2 text-[#765f58]"><CircleDollarSign size={16} />Total de la commande</span><strong>{money(total)}</strong></div>}

              {ticketData && !ticketData.onlinePaymentAvailable && !ticketData.demoModeAvailable && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">Ni Genius Pay ni la simulation ne sont activés. Configurez les variables côté serveur ou activez la simulation en local.</p>}
              {ticketData?.onlinePaymentAvailable && !diagnostics?.simulationAvailable && <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-900">Le bouton ouvrira directement Wave. Pour confirmer le webhook en test local, le serveur doit être accessible via une URL publique HTTPS (tunnel ou déploiement).</p>}

              <button type="submit" disabled={submitting || !ticketTypeId || !selectedType?.available || !customer.name.trim() || !customer.email.trim() || (!ticketData?.onlinePaymentAvailable && !ticketData?.demoModeAvailable)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#a93105] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#862300] disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? <Loader2 size={17} className="animate-spin" /> : paymentMode === 'simulation' ? <FlaskConical size={17} /> : <ExternalLink size={17} />}
                {submitting ? 'Préparation du test…' : paymentMode === 'simulation' ? 'Créer et simuler le paiement' : 'Continuer vers Wave'}
                {!submitting && paymentMode === 'geniuspay' && <ArrowUpRight size={16} />}
              </button>
            </form>
          )}
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-[#eee8eb] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-semibold">Étapes de vérification</h2>
            <ol className="mt-4 space-y-4 text-sm text-[#59413a]">
              <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#fae9e3] text-xs font-bold text-[#a93105]">1</span><span>Publiez l’événement et activez son tarif dans la billetterie.</span></li>
              <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#fae9e3] text-xs font-bold text-[#a93105]">2</span><span>Complétez le formulaire avec une adresse e-mail de test.</span></li>
              <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#fae9e3] text-xs font-bold text-[#a93105]">3</span><span>Effectuez le paiement sandbox ou utilisez la simulation locale.</span></li>
              <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#fae9e3] text-xs font-bold text-[#a93105]">4</span><span>Vérifiez que la commande passe à « Payée » et que les billets sont émis.</span></li>
            </ol>
          </section>

          {order && <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6" aria-live="polite">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-emerald-700">Commande créée</p><h2 className="mt-1 font-semibold">{order.event?.nom_evenement || selectedEvent?.nom_evenement || 'Événement'}</h2></div><span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">{order.status}</span></div>
            <p className="mt-3 break-all font-mono text-xs text-[#765f58]">Référence : {order.reference}</p>
            <p className="mt-1 text-sm font-semibold">{money(order.totalAmount)}</p>
            {order.items?.flatMap((item) => item.tickets || []).length > 0 && <div className="mt-4 space-y-2"><p className="text-xs font-semibold text-[#59413a]">Billets émis</p>{order.items.flatMap((item) => item.tickets || []).map((ticket) => <p key={ticket.code} className="rounded-lg bg-emerald-50 px-3 py-2 font-mono text-xs text-emerald-900">{ticket.code} · {ticket.status}</p>)}</div>}
            {order.status === 'PENDING' && <><p className="mt-3 text-xs leading-5 text-[#765f58]">Après le paiement, actualisez ici pour vérifier la confirmation reçue par webhook.</p><button type="button" onClick={refreshOrder} disabled={refreshing} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#e9e1e4] px-3 py-2 text-xs font-semibold text-[#59413a] hover:bg-[#f8f5f6] disabled:opacity-60">{refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}Actualiser le statut</button></>}
            {order.status === 'PAID' && <a href={`/web/paiement/retour?reference=${encodeURIComponent(order.reference)}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#a93105] hover:underline">Voir la page de confirmation <ExternalLink size={13} /></a>}
          </section>}

          <section className="rounded-2xl bg-[#183b36] p-5 text-white sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/65">Environnement actuel</p>
            <p className="mt-2 text-sm leading-6">{loading ? 'Lecture du mode…' : diagnostics?.production ? 'Production : tout paiement lancé ici est réel.' : 'Développement local : les tests simulés n’effectuent aucun débit.'}</p>
          </section>
        </aside>
      </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
