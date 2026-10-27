'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Loader2, ScanLine, Ticket, XCircle } from 'lucide-react';

const dateTime = (value) => value ? new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Africa/Abidjan', dateStyle: 'full', timeStyle: 'short',
}).format(new Date(value)) : 'Date à confirmer';

export default function VerifyTicketPage({ params }) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInError, setCheckInError] = useState('');
  const [justScanned, setJustScanned] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve(params).then(async ({ code: ticketCode }) => {
      if (active) setCode(ticketCode);
      const [ticketResponse, sessionResponse] = await Promise.all([
        fetch(`/api/web/tickets/${encodeURIComponent(ticketCode)}/verify`, { cache: 'no-store' }),
        fetch('/api/login/me', { cache: 'no-store' }),
      ]);
      const data = await ticketResponse.json().catch(() => ({}));
      const session = await sessionResponse.json().catch(() => ({}));
      if (!ticketResponse.ok && ticketResponse.status !== 404) throw new Error(data.error || 'Vérification impossible.');
      if (active) {
        setResult(data);
        setCanCheckIn(['ADMIN', 'AGENT', 'ASSISTANT'].includes(session.user?.role));
      }
    }).catch((requestError) => { if (active) setError(requestError.message || 'Vérification impossible.'); });
    return () => { active = false; };
  }, [params]);

  async function markTicketUsed() {
    if (!code || checkingIn) return;
    setCheckingIn(true);
    setCheckInError('');
    try {
      const response = await fetch(`/api/web/tickets/${encodeURIComponent(code)}/verify`, { method: 'POST' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const failure = new Error(data.error || 'Impossible de valider cette entrée.');
        failure.status = response.status;
        throw failure;
      }
      setJustScanned(true);
      setResult((current) => ({ ...current, valid: false, ticketStatus: 'SCANNED', scannedAt: data.scannedAt, scannedBy: data.scannedBy }));
    } catch (requestError) {
      setCheckInError(requestError.message || 'Impossible de valider cette entrée.');
      if (requestError.status === 409) {
        const response = await fetch(`/api/web/tickets/${encodeURIComponent(code)}/verify`, { cache: 'no-store' });
        const data = await response.json().catch(() => null);
        if (data) { setResult(data); setJustScanned(false); }
      }
    } finally {
      setCheckingIn(false);
    }
  }

  const used = result?.ticketStatus === 'SCANNED';
  const valid = result?.valid === true;
  const notFound = result?.ticketStatus === 'NOT_FOUND';
  const accepted = valid || justScanned;

  return (
    <main className="min-h-[75vh] bg-[#fbf8f7] px-4 py-12 text-[#33241f] sm:py-20">
      <section className="mx-auto max-w-lg rounded-xl border border-[#ece3df] bg-white p-6 shadow-sm sm:p-9">
        {!result && !error ? <div className="py-8 text-center"><Loader2 className="mx-auto animate-spin text-[#a83113]" size={32} /><p className="mt-4 text-sm text-[#71635d]">Vérification du billet…</p></div> : error ? <div className="py-6 text-center"><AlertTriangle className="mx-auto text-amber-700" size={36} /><h1 className="mt-4 text-2xl font-semibold">Vérification indisponible</h1><p className="mt-2 text-sm text-[#71635d]">{error}</p></div> : <>
          <div className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${accepted ? 'bg-emerald-50 text-emerald-700' : used ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
            {accepted ? <CheckCircle2 size={32} /> : used ? <AlertTriangle size={32} /> : <XCircle size={32} />}
          </div>
          <p className={`mt-4 text-center text-xs font-bold uppercase tracking-[.16em] ${accepted ? 'text-emerald-700' : used ? 'text-amber-700' : 'text-red-700'}`}>{justScanned ? 'Entrée validée' : valid ? 'Billet authentique' : used ? 'Billet déjà utilisé' : 'Billet invalide'}</p>
          <h1 className="mt-2 text-center font-[Georgia] text-3xl font-semibold">{justScanned ? 'Accès autorisé' : valid ? 'Billet valide' : used ? 'Accès déjà enregistré' : 'Accès refusé'}</h1>
          {valid && <p className="mt-2 text-center text-sm text-[#71635d]">Ce billet est payé et n’a pas encore été utilisé.</p>}
          {justScanned && <p className="mt-2 text-center text-sm text-emerald-800">Ce billet est maintenant marqué comme utilisé. L’entrée a été enregistrée.</p>}
          {used && !justScanned && <p className="mt-2 text-center text-sm text-[#71635d]">Ce billet a déjà été scanné. Vérifiez avec la personne responsable de l’accueil.</p>}
          {!valid && !used && <p className="mt-2 text-center text-sm text-[#71635d]">{notFound ? 'Aucun billet ne correspond à ce code.' : 'Ce billet n’est pas valide pour l’entrée.'}</p>}
          {result.code && <div className="mt-6 rounded-lg bg-[#f8f4f2] px-4 py-3 text-center"><span className="text-[10px] font-semibold uppercase tracking-wider text-[#81736e]">Code du billet</span><p className="mt-1 font-mono text-sm font-bold tracking-wide">{result.code}</p></div>}
          {result.customerName && <dl className="mt-6 divide-y divide-[#eee5e1]">
            <div className="flex justify-between gap-4 py-3"><dt className="text-sm text-[#71635d]">Titulaire</dt><dd className="text-right text-sm font-semibold">{result.customerName}</dd></div>
            <div className="flex justify-between gap-4 py-3"><dt className="text-sm text-[#71635d]">Événement</dt><dd className="text-right text-sm font-semibold">{result.event.name}</dd></div>
            <div className="flex justify-between gap-4 py-3"><dt className="text-sm text-[#71635d]">Billet</dt><dd className="text-right text-sm font-semibold">{result.ticketType}</dd></div>
            <div className="flex justify-between gap-4 py-3"><dt className="text-sm text-[#71635d]">Date</dt><dd className="text-right text-sm font-semibold">{dateTime(result.event.dateStart)}</dd></div>
            <div className="flex justify-between gap-4 py-3"><dt className="text-sm text-[#71635d]">Lieu</dt><dd className="text-right text-sm font-semibold">{result.event.locations.length ? result.event.locations.join(' · ') : 'Centre culturel CCJAB · Bouaké'}</dd></div>
            {used && result.scannedAt && <div className="flex justify-between gap-4 py-3"><dt className="text-sm text-[#71635d]">Entrée validée le</dt><dd className="text-right text-sm font-semibold">{dateTime(result.scannedAt)}</dd></div>}
          </dl>}
          {valid && canCheckIn && <div className="mt-5">
            <button type="button" onClick={markTicketUsed} disabled={checkingIn} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60">{checkingIn ? <Loader2 className="animate-spin" size={17} /> : <ScanLine size={17} />}{checkingIn ? 'Validation en cours…' : 'Valider l’entrée'}</button>
            {checkInError && <p role="alert" className="mt-2 text-center text-xs text-red-700">{checkInError}</p>}
          </div>}
          {valid && !canCheckIn && <p className="mt-5 rounded-lg bg-[#f8f4f2] px-4 py-3 text-center text-xs leading-5 text-[#71635d]">Connectez-vous avec un compte du personnel autorisé pour marquer ce billet comme utilisé.</p>}
          {code && <p className="mt-4 break-all text-center font-mono text-[10px] text-[#a89b94]">{code}</p>}
        </>}
        <div className="mt-7 border-t border-[#eee5e1] pt-5 text-center"><Link href="/web/agenda" className="inline-flex items-center gap-2 text-sm font-semibold text-[#a83113] hover:underline"><Ticket size={15} />CCJAB · Billetterie</Link></div>
      </section>
    </main>
  );
}
