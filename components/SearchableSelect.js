'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

export default function SearchableSelect({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Saisir pour rechercher…',
  emptyMessage = 'Aucun résultat.',
  disabled = false,
  className = '',
}) {
  const id = useId();
  const listId = `${id}-options`;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('fr');
    if (!term || query === selected?.label) return options;
    return options.filter((option) => `${option.label} ${option.description || ''}`.toLocaleLowerCase('fr').includes(term));
  }, [options, query, selected?.label]);

  useEffect(() => {
    if (!open) setQuery(selected?.label || '');
  }, [open, selected?.label]);

  useEffect(() => setActiveIndex(0), [query, options.length]);

  function choose(option) {
    onChange(option.value);
    setQuery(option.label);
    setOpen(false);
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => filtered.length ? (index + 1) % filtered.length : 0);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => filtered.length ? (index - 1 + filtered.length) % filtered.length : 0);
    } else if (event.key === 'Enter' && open && filtered[activeIndex]) {
      event.preventDefault();
      choose(filtered[activeIndex]);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
      setQuery(selected?.label || '');
    }
  }

  return (
    <div className={`relative ${className}`}>
      {label && <label htmlFor={id} className="block text-xs font-semibold text-[#59413a]">{label}</label>}
      <div className="relative mt-1">
        <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8d7169]" />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && filtered[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
          autoComplete="off"
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setOpen(false);
            setQuery(selected?.label || '');
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (value) onChange('');
          }}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl border border-[#e9e1e4] bg-white py-2.5 pl-9 pr-9 text-sm font-normal text-[#1b1b1d] outline-none transition placeholder:text-[#a18e88] focus:border-[#a93105] focus:ring-2 focus:ring-[#a93105]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
        />
        <ChevronDown size={15} aria-hidden="true" className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8d7169] transition ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && !disabled && <ul id={listId} role="listbox" aria-label={label || 'Résultats'} className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[#e9e1e4] bg-white p-1 shadow-xl">
        {filtered.length ? filtered.map((option, index) => {
          const isSelected = option.value === value;
          return <li
            id={`${id}-option-${index}`}
            key={option.value}
            role="option"
            aria-selected={isSelected}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => choose(option)}
            className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${index === activeIndex ? 'bg-[#f8f5f6]' : ''} ${isSelected ? 'font-semibold text-[#a93105]' : 'text-[#3f332e]'}`}
          >
            <span className="min-w-0"><span className="block truncate">{option.label}</span>{option.description && <span className="mt-0.5 block truncate text-[11px] font-normal text-[#8d7169]">{option.description}</span>}</span>
            {isSelected && <Check size={15} className="shrink-0 text-[#a93105]" />}
          </li>;
        }) : <li className="px-3 py-3 text-sm text-[#8d7169]">{emptyMessage}</li>}
      </ul>}
    </div>
  );
}
