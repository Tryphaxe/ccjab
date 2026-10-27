'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, Search, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const money = (amount, currency = 'XOF') => `${new Intl.NumberFormat('fr-FR').format(amount)} ${currency === 'XOF' ? 'FCFA' : currency}`;
const dateTime = (value) => value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';

async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Impossible de charger les acheteurs.');
  return data;
}

export default function TicketBuyersTable() {
  const [result, setResult] = useState({ orders: [], pageInfo: { page: 1, total: 0, totalPages: 0 } });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    const query = new URLSearchParams({ page: String(page), pageSize: '25' });
    if (search) query.set('search', search);
    try {
      setResult(await fetch(`/api/tickets/orders?${query}`, { cache: 'no-store' }).then(readJson));
    } catch (loadError) {
      setError(loadError.message || 'Impossible de charger les acheteurs.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  function submitSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#eee8eb] bg-white shadow-sm" aria-labelledby="ticket-buyers-heading">
      <header className="flex flex-col gap-4 border-b border-[#f0edef] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-[#e2f1e8] p-2.5 text-[#446554]"><UsersRound size={19} /></span>
          <div><h2 id="ticket-buyers-heading" className="font-semibold text-[#1b1b1d]">Acheteurs de billets</h2><p className="mt-1 text-xs text-[#8d7169]">{result.pageInfo.total} commande(s) payée(s)</p></div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <form onSubmit={submitSearch} className="flex gap-2">
            <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Nom, e-mail, événement…" aria-label="Rechercher un acheteur" className="w-full sm:w-64" />
            <Button type="submit" variant="outline" aria-label="Rechercher"><Search size={16} /></Button>
          </form>
          <Button type="button" variant="outline" onClick={loadOrders} disabled={loading} className="gap-2"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} />Actualiser</Button>
        </div>
      </header>

      {error && <p role="alert" className="m-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <Table>
        <TableHeader>
          <TableRow className="bg-[#faf8f9]">
            <TableHead>Date</TableHead><TableHead>Acheteur</TableHead><TableHead>Événement</TableHead>
            <TableHead>Billets</TableHead><TableHead>Montant payé</TableHead><TableHead>Paiement</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && <TableRow><TableCell colSpan={6} className="h-28 text-center text-sm text-[#765f58]"><span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" />Chargement des acheteurs…</span></TableCell></TableRow>}
          {!loading && !error && result.orders.length === 0 && <TableRow><TableCell colSpan={6} className="h-32 text-center text-sm text-[#765f58]">Aucun achat payé ne correspond à cette recherche.</TableCell></TableRow>}
          {!loading && result.orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="text-xs text-[#59413a]">{dateTime(order.paidAt)}<span className="mt-1 block font-mono text-[10px] text-[#8d7169]">{order.reference}</span></TableCell>
              <TableCell><span className="block font-semibold text-[#1b1b1d]">{order.customerName}</span><span className="block text-xs text-[#765f58]">{order.customerEmail}</span>{order.customerPhone && <span className="block text-xs text-[#8d7169]">{order.customerPhone}</span>}</TableCell>
              <TableCell className="max-w-56 truncate">{order.event.nom_evenement || order.event.categorie}</TableCell>
              <TableCell>{order.items.map((item) => <span key={`${order.id}-${item.ticketType.name}`} className="block text-xs">{item.quantity} × {item.ticketType.name}</span>)}</TableCell>
              <TableCell className="font-semibold">{money(order.totalAmount, order.currency)}</TableCell>
              <TableCell><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${order.paymentProvider === 'NONE' ? 'bg-blue-50 text-blue-800' : 'bg-emerald-50 text-emerald-800'}`}>{order.paymentProvider === 'NONE' ? 'Simulation' : 'Wave'}</span></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <footer className="flex items-center justify-between border-t border-[#f0edef] px-5 py-3 text-xs text-[#765f58] sm:px-6">
        <span>{result.pageInfo.total ? `Page ${page} sur ${result.pageInfo.totalPages}` : 'Aucune commande'}</span>
        <div className="flex gap-2"><Button type="button" variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Précédent</Button><Button type="button" variant="outline" size="sm" disabled={page >= result.pageInfo.totalPages || loading} onClick={() => setPage((value) => value + 1)}>Suivant</Button></div>
      </footer>
    </section>
  );
}
