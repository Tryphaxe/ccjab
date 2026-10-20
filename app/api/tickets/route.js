import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';
import { ticketingMaintenanceResponse } from '@/lib/ticketingMaintenance';

const validPeriods = new Set(['7d', '30d', 'year']);
const validStatuses = new Set(['En vente', 'Gratuit', 'Brouillon', 'Terminé', 'Billetterie inactive', 'Sans billetterie']);
const dayKey = (date) => date.toISOString().slice(0, 10);

export async function GET(request) {
  return ticketingMaintenanceResponse();
  const auth = await authorize(request, ['ADMIN', 'FINANCIER']);
  if (auth.response) return auth.response;

  const now = new Date();
  const params = new URL(request.url).searchParams;
  const periodParam = params.get('period');
  const period = validPeriods.has(periodParam) ? periodParam : '7d';
  const page = Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1);
  const pageSize = Math.min(50, Math.max(1, Number.parseInt(params.get('pageSize') || '10', 10) || 10));
  const search = (params.get('search') || '').trim().slice(0, 100);
  const status = validStatuses.has(params.get('status')) ? params.get('status') : '';
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  if (period === '7d') start.setUTCDate(start.getUTCDate() - 6);
  else if (period === '30d') start.setUTCDate(start.getUTCDate() - 29);
  else { start.setUTCMonth(0, 1); }

  const activeTicketType = { isActive: true, AND: [
    { OR: [{ salesStart: null }, { salesStart: { lte: now } }] },
    { OR: [{ salesEnd: null }, { salesEnd: { gt: now } }] },
  ] };
  const notEnded = { date_fin: { gte: now } };
  const statusFilters = {
    'Terminé': { date_fin: { lt: now } },
    'Brouillon': { ...notEnded, visible: false },
    'En vente': { ...notEnded, visible: true, ticketTypes: { some: { ...activeTicketType, price: { gt: 0 } } } },
    'Gratuit': { ...notEnded, visible: true, ticketTypes: { some: { ...activeTicketType, price: 0 } }, NOT: { ticketTypes: { some: { ...activeTicketType, price: { gt: 0 } } } } },
    'Billetterie inactive': { ...notEnded, visible: true, ticketTypes: { some: {} }, NOT: { ticketTypes: { some: activeTicketType } } },
    'Sans billetterie': { ...notEnded, visible: true, ticketTypes: { none: {} } },
  };
  const where = {
    ...(search ? { OR: ['nom_evenement', 'categorie', 'type', 'description', 'nom_client'].map((field) => ({ [field]: { contains: search, mode: 'insensitive' } })) } : {}),
    ...(status ? statusFilters[status] : {}),
  };

  try {
    const [events, total, orders, capacityResult, paidItems, activeEvents] = await Promise.all([
      prisma.even.findMany({
        where,
        orderBy: [{ date_debut: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          nom_evenement: true,
          categorie: true,
          type: true,
          date_debut: true,
          date_fin: true,
          description: true,
          image: true,
          visible: true,
          organise_par_ccjab: true,
          nom_client: true,
          salles: { select: { nom_salle: true } },
          ticketTypes: {
            select: {
              id: true,
              name: true,
              price: true,
              capacity: true,
              isActive: true,
              salesStart: true,
              salesEnd: true,
              items: {
                where: { order: { status: 'PAID', paymentProvider: 'WAVE' } },
                select: { quantity: true, unitPrice: true },
              },
            },
          },
        },
      }),
      prisma.even.count({ where }),
      prisma.ticketOrder.findMany({
        where: { status: 'PAID', paymentProvider: 'WAVE', paidAt: { gte: start, lte: now } },
        select: { paidAt: true, totalAmount: true, items: { select: { quantity: true } } },
      }),
      prisma.ticketType.aggregate({ _sum: { capacity: true } }),
      prisma.ticketOrderItem.findMany({
        where: { order: { status: 'PAID', paymentProvider: 'WAVE' } },
        select: { quantity: true, unitPrice: true },
      }),
      prisma.even.count({ where: { visible: true, date_fin: { gte: now }, ticketTypes: { some: activeTicketType } } }),
    ]);

    const buckets = new Map();
    if (period === 'year') {
      for (let month = 0; month < 12; month += 1) {
        const key = `${now.getUTCFullYear()}-${String(month + 1).padStart(2, '0')}`;
        buckets.set(key, { label: new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(now.getUTCFullYear(), month, 1))), tickets: 0, revenue: 0 });
      }
    } else {
      const length = period === '7d' ? 7 : 30;
      for (let offset = 0; offset < length; offset += 1) {
        const date = new Date(start);
        date.setUTCDate(start.getUTCDate() + offset);
        const key = dayKey(date);
        buckets.set(key, {
          label: new Intl.DateTimeFormat('fr-FR', { weekday: period === '7d' ? 'short' : undefined, day: period === '7d' ? undefined : '2-digit', month: period === '7d' ? undefined : 'short', timeZone: 'UTC' }).format(date),
          tickets: 0,
          revenue: 0,
        });
      }
    }
    for (const order of orders) {
      const key = period === 'year'
        ? `${order.paidAt.getUTCFullYear()}-${String(order.paidAt.getUTCMonth() + 1).padStart(2, '0')}`
        : dayKey(order.paidAt);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.tickets += order.items.reduce((sum, item) => sum + item.quantity, 0);
      bucket.revenue += order.totalAmount;
    }

    const mappedEvents = events.map((event) => {
      const ticketTypes = event.ticketTypes;
      const activeTypes = ticketTypes.filter((type) => type.isActive && (!type.salesStart || type.salesStart <= now) && (!type.salesEnd || type.salesEnd > now));
      const sold = ticketTypes.flatMap((type) => type.items).reduce((sum, item) => sum + item.quantity, 0);
      const revenue = ticketTypes.flatMap((type) => type.items).reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const capacity = ticketTypes.reduce((sum, type) => sum + type.capacity, 0);
      const lowestActivePrice = activeTypes.length ? Math.min(...activeTypes.map((type) => type.price)) : null;
      const status = event.date_fin < now
        ? 'Terminé'
        : !event.visible
          ? 'Brouillon'
          : activeTypes.length
            ? activeTypes.every((type) => type.price === 0) ? 'Gratuit' : 'En vente'
            : ticketTypes.length ? 'Billetterie inactive' : 'Sans billetterie';
      return {
        id: event.id,
        title: event.nom_evenement || event.description || event.categorie,
        category: event.type || event.categorie,
        date: event.date_debut,
        location: event.salles.map((room) => room.nom_salle).filter(Boolean).join(' · ') || 'Lieu à confirmer',
        poster: event.image,
        organizer: event.organise_par_ccjab ? 'CCJAB' : event.nom_client || 'Client',
        status,
        sold,
        capacity,
        revenue,
        price: lowestActivePrice,
        ticketTypeCount: ticketTypes.length,
      };
    });

    const totals = {
      tickets: paidItems.reduce((sum, item) => sum + item.quantity, 0),
      capacity: capacityResult._sum.capacity || 0,
      revenue: paidItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
      activeEvents,
    };

    return NextResponse.json({
      events: mappedEvents,
      totals: { ...totals, available: Math.max(0, totals.capacity - totals.tickets), occupancy: totals.capacity ? Math.round(totals.tickets / totals.capacity * 100) : 0 },
      sales: Array.from(buckets.values()),
      period,
      pageInfo: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      waveConfigured: false,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Erreur de lecture du tableau de bord billetterie:', error);
    return NextResponse.json({ error: 'Impossible de charger les données de billetterie.' }, { status: 500 });
  }
}
