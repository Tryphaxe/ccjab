"use client";

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Ticket } from 'lucide-react';

const money = (value) => new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';

export default function PublicTicketSales({ eventId, isPast = false }) {
  const [offers, setOffers] = useState([]);
  const [demoMode, setDemoMode] = useState(false);
  const [onlinePaymentAvailable, setOnlinePaymentAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', quantity: 1 });
  const [selectedOffer, setSelectedOffer] = useState('');
  const [order, setOrder] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/web/even/${encodeURIComponent(eventId)}/tickets`, { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Impossible de charger les tarifs.');
        setOffers(data.ticketTypes || []);
        setDemoMode(data.demoModeAvailable === true);
        setOnlinePaymentAvailable(data.onlinePaymentAvailable === true);
        setSelectedOffer(data.ticketTypes?.[0]?.id || '');
      })
      .catch((loadError) => {
        if (loadError.name !== 'AbortError') setError(loadError.message || 'Impossible de charger les tarifs.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [eventId]);

  const offer = offers.find((item) => item.id === selectedOffer);
  const available = Math.min(10, offer?.available || 0);

  async function createOrder(event) {
    event.preventDefault();
    if (!offer || (!demoMode && !onlinePaymentAvailable)) return;
    setError('');
    setSaving(true);
    try {
      const response = await fetch('/api/web/ticket-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketTypeId: offer.id, customerName: form.name, customerEmail: form.email, customerPhone: form.phone, quantity: Number(form.quantity) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Impossible de créer la commande.');
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      setOrder(data);
    } catch (requestError) {
      setError(requestError.message || 'Impossible de créer la commande.');
    } finally {
      setSaving(false);
    }
  }

  async function simulatePayment() {
    if (!order?.reference) return;
    setError('');
    setSaving(true);
    try {
      const response = await fetch(`/api/web/ticket-orders/${encodeURIComponent(order.reference)}/simulate-payment`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Le paiement simulé a échoué.');
      const confirmationResponse = await fetch(`/api/web/ticket-orders/${encodeURIComponent(order.reference)}`, { cache: 'no-store' });
      const confirmation = await confirmationResponse.json();
      if (!confirmationResponse.ok) throw new Error(confirmation.error || 'Impossible de charger les billets.');
      setOrder(confirmation);
    } catch (requestError) {
      setError(requestError.message || 'Le paiement simulé a échoué.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-5 border-t border-[#eee5e1] pt-4" aria-label="Billetterie de l’événement">
      <div className="flex items-center gap-2 text-[#a83113]"><Ticket size={15} /><h3 className="text-xs font-bold">Billetterie</h3></div>
      {loading ? <p className="mt-3 flex items-center gap-2 text-xs text-[#81736e]"><Loader2 size={13} className="animate-spin" />Chargement des tarifs…</p> : error && !order ? <p role="alert" className="mt-3 text-xs text-red-700">{error}</p> : offers.length === 0 ? <p className="mt-2 text-[10px] leading-5 text-[#81736e]">Contactez l’accueil pour connaître les tarifs et les disponibilités.</p> : (
        <>
          <div className="mt-3 space-y-2">
            {offers.map((item) => <button key={item.id} type="button" onClick={() => { setSelectedOffer(item.id); setOrder(null); }} disabled={!item.available || isPast} className={`flex w-full items-center justify-between gap-2 rounded-sm border px-3 py-2 text-left text-xs transition ${selectedOffer === item.id ? 'border-[#b93313] bg-[#fff8f5]' : 'border-[#eee5e1] bg-white'} disabled:cursor-not-allowed disabled:opacity-50`}>
              <span><span className="block font-semibold text-[#3f332e]">{item.name}</span><span className="text-[10px] text-[#81736e]">{item.available} place{item.available === 1 ? '' : 's'} restante{item.available === 1 ? '' : 's'}</span></span>
              <span className="shrink-0 font-bold text-[#a83113]">{item.price === 0 ? 'Gratuit' : money(item.price)}</span>
            </button>)}
          </div>
          {order?.status === 'PAID' ? <div className="mt-3 rounded-sm border border-emerald-200 bg-emerald-50 p-3">
            <p className="flex items-center gap-2 text-xs font-bold text-emerald-800"><CheckCircle2 size={15} />Billets émis · commande {order.reference.slice(0, 8).toUpperCase()}</p>
            <ul className="mt-2 space-y-1">{order.items?.flatMap((item) => item.tickets || []).map((ticket) => <li key={ticket.code} className="rounded bg-white px-2 py-1 font-mono text-[10px] text-[#3f332e]">{ticket.code}</li>)}</ul>
          </div> : order ? <div className="mt-3 space-y-2 rounded-sm bg-[#f8f4f2] p-3">
            <p className="text-xs font-semibold text-[#3f332e]">Commande créée · {money(order.totalAmount)}</p>
            <p className="text-[10px] text-[#81736e]">Référence {order.reference} · places réservées 15 minutes.</p>
            {demoMode && <button type="button" disabled={saving} onClick={simulatePayment} className="w-full rounded-sm bg-[#315b43] px-3 py-2.5 text-xs font-bold text-white disabled:opacity-60">{saving ? 'Traitement…' : 'Simuler le paiement (développement)'}</button>}
          </div> : <form onSubmit={createOrder} className="mt-3 space-y-2">
            {!demoMode && !onlinePaymentAvailable && <p className="text-[10px] leading-4 text-[#81736e]">Les tarifs sont consultables. La réservation en ligne sera activée après le raccordement du paiement sécurisé.</p>}
            <label className="block text-[10px] font-semibold text-[#594a43]">Nom complet<input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded-sm border border-[#e7ddd8] px-3 py-2 text-xs outline-none focus:border-[#b93313]" /></label>
            <label className="block text-[10px] font-semibold text-[#594a43]">Adresse e-mail<input type="email" required maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1 w-full rounded-sm border border-[#e7ddd8] px-3 py-2 text-xs outline-none focus:border-[#b93313]" /></label>
            <div className="grid grid-cols-[1fr_80px] gap-2"><label className="block text-[10px] font-semibold text-[#594a43]">Téléphone (facultatif)<input maxLength={40} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-1 w-full rounded-sm border border-[#e7ddd8] px-3 py-2 text-xs outline-none focus:border-[#b93313]" /></label><label className="block text-[10px] font-semibold text-[#594a43]">Quantité<input type="number" min="1" max={available || 1} value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className="mt-1 w-full rounded-sm border border-[#e7ddd8] px-2 py-2 text-xs outline-none focus:border-[#b93313]" /></label></div>
            {error && <p role="alert" className="text-[10px] text-red-700">{error}</p>}
            <button type="submit" disabled={(!demoMode && !onlinePaymentAvailable) || !offer || available < 1 || isPast || saving} className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#b93313] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#96270e] disabled:cursor-not-allowed disabled:opacity-50">{saving && <Loader2 size={13} className="animate-spin" />}{demoMode ? 'Réserver et simuler le paiement' : onlinePaymentAvailable ? 'Acheter mes billets via Wave' : 'Paiement en ligne bientôt disponible'}</button>
          </form>}
        </>
      )}
    </section>
  );
}
