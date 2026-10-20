import { Badge } from '@/components/ui/badge';

export function isCejabEvent(eventOrClientName) {
  const event = eventOrClientName && typeof eventOrClientName === 'object' ? eventOrClientName : null;
  const clientName = event ? event.nom_client : eventOrClientName;
  if (event?.organise_par_ccjab) return true;

  const normalized = (clientName || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();

  return normalized === 'CCJAB'
    || normalized.startsWith('CCJAB ')
    || normalized.includes('CENTRE CULTUREL JACQUES AKA');
}

export function getEventOriginColor(eventOrClientName) {
  return isCejabEvent(eventOrClientName) ? '#b33211' : '#2563eb';
}

const styles = {
  ccjab: 'border-orange-200 bg-orange-50 text-orange-800',
  external: 'border-blue-200 bg-blue-50 text-blue-800',
};

export function EventOriginBadge({ event, clientName, className = '' }) {
  const isCejab = isCejabEvent(event || clientName);

  return (
    <Badge
      variant="outline"
      className={`whitespace-nowrap ${isCejab ? styles.ccjab : styles.external} ${className}`}
    >
      {isCejab ? 'Organisé par le CCJAB' : 'Client externe'}
    </Badge>
  );
}

export function EventOriginLegend({ className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 text-xs text-gray-600 ${className}`} aria-label="Légende des organisateurs">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-orange-700" aria-hidden="true" />
        Organisé par le CCJAB
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" aria-hidden="true" />
        Client externe
      </span>
    </div>
  );
}
