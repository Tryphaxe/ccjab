'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
}

export default function SearchCombobox({
  value,
  onValueChange,
  options = [],
  placeholder = 'Choisir…',
  searchPlaceholder = 'Rechercher…',
  emptyMessage = 'Aucun résultat.',
  disabled = false,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return options;
    return options.filter((option) => normalize(`${option.label} ${option.searchText || ''}`).includes(needle));
  }, [options, query]);

  return (
    <Popover open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) setQuery(''); }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={`h-10 w-full justify-between rounded-lg border-gray-200 bg-white px-3 text-left text-sm font-normal text-gray-900 hover:bg-gray-50 ${className}`}
        >
          <span className={`truncate ${selected ? '' : 'text-gray-500'}`}>{selected?.label || placeholder}</span>
          <ChevronsUpDown size={15} className="ml-2 shrink-0 text-gray-500" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <div className="border-b border-gray-100 p-2">
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-9 border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div role="listbox" aria-label={searchPlaceholder} className="max-h-64 overflow-y-auto p-1">
          {filtered.length ? filtered.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              disabled={option.disabled}
              onClick={() => { onValueChange(option.value); setOpen(false); setQuery(''); }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-gray-800 outline-none hover:bg-gray-100 focus:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={15} className={`shrink-0 text-[#a93105] ${option.value === value ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
            </button>
          )) : <p className="px-3 py-6 text-center text-sm text-gray-500">{emptyMessage}</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
