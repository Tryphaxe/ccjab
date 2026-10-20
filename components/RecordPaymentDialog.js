"use client";

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CreditCard, Loader2, ReceiptText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const formatMoney = (value) => `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
const localDateValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export default function RecordPaymentDialog({ event, onClose, onSaved }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ amount: '', paidAt: localDateValue(), method: 'Mobile Money', reference: '', note: '' });
  const balance = Math.max(0, (event?.montant || 0) - (event?.avance || 0));

  useEffect(() => {
    if (!event) return;
    let active = true;
    setLoading(true);
    fetch(`/api/even/${event.id}/payments`, { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Impossible de charger les paiements.');
        if (active) setPayments(data);
      })
      .catch((error) => { if (active) toast.error(error.message); })
      .finally(() => { if (active) setLoading(false); });
    setForm({ amount: '', paidAt: localDateValue(), method: 'Mobile Money', reference: '', note: '' });
    return () => { active = false; };
  }, [event?.id]);

  const submit = async (e) => {
    e.preventDefault();
    if (!event || saving) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/even/${event.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, paidAt: `${form.paidAt}T12:00:00` }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Impossible d’enregistrer le paiement.');
      toast.success('Paiement enregistré.');
      setPayments((current) => [data, ...current]);
      onSaved?.();
      setForm((current) => ({ ...current, amount: '', reference: '', note: '' }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CreditCard size={18} /> Paiements reçus</DialogTitle>
          <DialogDescription>{event?.nom_evenement || event?.categorie} · {event?.montant == null ? 'Montant contractuel manquant' : `Solde restant : ${formatMoney(balance)}`}</DialogDescription>
        </DialogHeader>

        <section aria-label="Historique des paiements" className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><ReceiptText size={15} /> Historique</h3>
          {loading ? <p className="text-sm text-gray-500">Chargement…</p> : payments.length === 0 ? <p className="text-sm text-gray-500">Aucun paiement enregistré.</p> : (
            <ul className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
              {payments.map((payment) => (
                <li key={payment.id} className="flex items-start justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium">{formatMoney(payment.amount)} · {payment.method || 'Mode non précisé'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.paidAt).toLocaleDateString('fr-FR')}
                      {payment.isLegacyEstimate ? ' · date estimée, avance sans date historique' : payment.isInitialAdvance ? ' · avance initiale (date d’enregistrement)' : ''}
                      {payment.createdBy?.name ? ` · ${payment.createdBy.name}` : ''}
                    </p>
                    {payment.note && <p className="text-xs text-gray-500">{payment.note}</p>}
                  </div>
                  {payment.reference && <span className="shrink-0 text-xs text-gray-500">Réf. {payment.reference}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <form onSubmit={submit} className="space-y-3 border-t pt-4">
          <h3 className="text-sm font-semibold">Enregistrer un paiement</h3>
          {event?.montant == null ? <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">Ajoutez d’abord un montant contractuel pour cet événement.</p> : balance <= 0 ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">Le montant contractuel est entièrement couvert.</p> : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1 sm:col-span-1">
                  <Label htmlFor="payment-amount">Montant (FCFA)</Label>
                  <Input id="payment-amount" type="number" min="1" max={balance} step="1" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="payment-date">Date reçue</Label>
                  <Input id="payment-date" type="date" max={localDateValue()} required value={form.paidAt} onChange={(e) => setForm({ ...form, paidAt: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="payment-method">Mode</Label>
                  <select id="payment-method" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                    {['Espèces', 'Mobile Money', 'Virement', 'Carte', 'Chèque', 'Autre'].map((method) => <option key={method}>{method}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1"><Label htmlFor="payment-reference">Référence (facultatif)</Label><Input id="payment-reference" maxLength={100} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></div>
                <div className="space-y-1"><Label htmlFor="payment-note">Note (facultatif)</Label><Input id="payment-note" maxLength={500} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
              </div>
              <div className="flex justify-end"><Button type="submit" disabled={saving || Number(form.amount) > balance}>{saving && <Loader2 size={15} className="mr-2 animate-spin" />}Enregistrer le paiement</Button></div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
