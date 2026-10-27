'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock3, Download, Loader2, Ticket, XCircle } from 'lucide-react';

const messages = {
  CANCELLED: 'Le paiement a été annulé. Aucun billet n’a été émis.',
  EXPIRED: 'Le délai de paiement est dépassé. Recommencez votre réservation.',
  REFUNDED: 'Cette commande a été remboursée et les billets ne sont plus valides.',
};

export default function TicketPaymentReturnPage() {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [reference, setReference] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const downloadStarted = useRef(false);
  const emailPollAttempts = useRef(0);

  useEffect(() => {
    setReference(new URLSearchParams(window.location.search).get('reference') || '');
  }, []);

  const refreshOrder = useCallback(async (signal) => {
    if (!reference) return;
    setChecking(true);
    try {
      const response = await fetch(`/api/web/ticket-orders/${encodeURIComponent(reference)}`, { cache: 'no-store', signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Impossible de vérifier la commande.');
      setOrder(data);
      setError('');
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.message || 'Impossible de vérifier la commande.');
    } finally {
      if (!signal?.aborted) setChecking(false);
    }
  }, [reference]);

  useEffect(() => {
    const controller = new AbortController();
    refreshOrder(controller.signal);
    return () => controller.abort();
  }, [refreshOrder]);

  useEffect(() => {
    const waitingForPayment = order?.status === 'PENDING';
    const waitingForEmail = order?.status === 'PAID' && order.ticketEmailStatus !== 'SENT' && emailPollAttempts.current < 15;
    if (!reference || !order || (!waitingForPayment && !waitingForEmail)) return undefined;
    const controller = new AbortController();
    const interval = window.setInterval(() => {
      if (waitingForEmail) emailPollAttempts.current += 1;
      refreshOrder(controller.signal);
    }, 4000);
    return () => { window.clearInterval(interval); controller.abort(); };
  }, [order, reference, refreshOrder]);

  const downloadTickets = useCallback(async () => {
    if (!reference) return;
    setDownloading(true);
    setDownloadError('');
    try {
      const response = await fetch(`/api/web/ticket-orders/${encodeURIComponent(reference)}/pdf`, { cache: 'no-store' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Impossible de télécharger les billets.');
      }
      const pdf = await response.blob();
      const objectUrl = URL.createObjectURL(pdf);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `billets-CCJAB-${reference}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (downloadRequestError) {
      setDownloadError(downloadRequestError.message || 'Impossible de télécharger les billets.');
    } finally {
      setDownloading(false);
    }
  }, [reference]);

  useEffect(() => {
    if (order?.status !== 'PAID' || downloadStarted.current) return;
    downloadStarted.current = true;
    downloadTickets();
  }, [downloadTickets, order?.status]);

  const tickets = order?.items?.flatMap((item) => item.tickets || []) || [];

  return (
    <main className="min-h-[70vh] bg-[#fbf8f7] px-5 py-16 text-[#33241f] sm:py-24">
      <section className="mx-auto max-w-xl rounded-sm border border-[#ece3df] bg-white p-6 shadow-sm sm:p-9">
        {!reference ? <div className="text-center"><XCircle className="mx-auto text-red-700" size={34} /><h1 className="mt-4 text-3xl font-semibold">Référence manquante</h1><p className="mt-2 text-sm text-[#71635d]">Ouvrez le lien de retour reçu après votre paiement.</p></div> : order?.status === 'PAID' ? <div>
          <CheckCircle2 className="mx-auto text-emerald-700" size={38} />
          <h1 className="mt-4 text-center text-3xl font-semibold">Paiement confirmé</h1>
          <p className="mt-2 text-center text-sm text-[#71635d]">Vos billets pour {order.event?.nom_evenement || 'cet événement'} sont prêts.</p>
          <ul className="mt-6 space-y-2" aria-label="Billets émis">
            {tickets.map((ticket) => <li key={ticket.code} className="flex items-center gap-3 rounded-sm border border-emerald-100 bg-emerald-50 p-3"><Ticket className="shrink-0 text-emerald-800" size={17} /><span><span className="block font-mono text-sm font-bold">{ticket.code}</span><span className="text-xs text-emerald-900">{order.items.find((item) => item.tickets?.some((entry) => entry.code === ticket.code))?.ticketType?.name}</span></span></li>)}
          </ul>
          <p className="mt-5 text-center text-xs text-[#71635d]">Conservez ces codes pour l’entrée. Référence de commande : {order.reference}</p>
          <p role="status" className="mt-2 text-center text-xs text-[#71635d]">{order.ticketEmailStatus === 'SENT' ? 'Une copie PDF a été envoyée à l’adresse e-mail indiquée lors de l’achat.' : 'Envoi de la copie PDF par e-mail en cours…'}</p>
          <div className="mt-5 text-center">
            <button type="button" onClick={() => { downloadStarted.current = true; downloadTickets(); }} disabled={downloading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#a83113] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8f290f] disabled:cursor-wait disabled:opacity-60">{downloading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}{downloading ? 'Préparation du billet…' : 'Télécharger le billet PDF'}</button>
            {downloadError && <p role="alert" className="mt-2 text-xs text-red-700">{downloadError}</p>}
          </div>
        </div> : order?.status === 'PENDING' || checking ? <div className="text-center">
          <Clock3 className="mx-auto text-[#b93313]" size={36} />
          <h1 className="mt-4 text-3xl font-semibold">Vérification du paiement</h1>
          <p className="mt-2 text-sm leading-6 text-[#71635d]">Votre paiement est en cours de confirmation. Cette page se met à jour automatiquement. Les billets seront affichés dès réception de la confirmation sécurisée.</p>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#81736e]"><Loader2 className="animate-spin" size={14} />Commande {reference}</p>
          <button type="button" onClick={() => refreshOrder()} className="mt-5 rounded-sm border border-[#b93313] px-4 py-2 text-xs font-semibold text-[#a83113]">Vérifier à nouveau</button>
        </div> : order ? <div className="text-center">
          <XCircle className="mx-auto text-red-700" size={36} />
          <h1 className="mt-4 text-3xl font-semibold">Paiement non confirmé</h1>
          <p className="mt-2 text-sm leading-6 text-[#71635d]">{order.status === 'REFUND_REQUIRED' ? 'Le paiement a été reçu, mais les billets sont indisponibles. Notre équipe doit vérifier la commande et procéder au remboursement.' : messages[order.status] || 'La commande n’a pas été confirmée.'}</p>
          <p className="mt-3 text-xs text-[#81736e]">Référence {order.reference}</p>
        </div> : <div className="text-center">
          {error ? <><XCircle className="mx-auto text-red-700" size={36} /><h1 className="mt-4 text-3xl font-semibold">Impossible de vérifier</h1><p className="mt-2 text-sm text-[#71635d]">{error}</p><button type="button" onClick={() => refreshOrder()} className="mt-4 text-sm font-semibold text-[#a83113]">Réessayer</button></> : <p className="text-sm text-[#71635d]">Chargement de la commande…</p>}
        </div>}
        <div className="mt-8 border-t border-[#eee5e1] pt-5 text-center"><Link href="/web/agenda" className="text-sm font-semibold text-[#a83113] hover:underline">Retour à l’agenda</Link></div>
      </section>
    </main>
  );
}
