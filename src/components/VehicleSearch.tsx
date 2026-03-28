import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Car, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchVehicles, type VehicleSpec } from '@/lib/vehicle-database';

interface VehicleSearchProps {
  onSelect: (spec: VehicleSpec) => void;
}

export default function VehicleSearch({ onSelect }: VehicleSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VehicleSpec[]>([]);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (value.trim().length >= 2) {
      const found = searchVehicles(value);
      setResults(found);
      setOpen(found.length > 0);
      setHighlightIndex(-1);
    } else {
      setResults([]);
      setOpen(false);
    }
  }, []);

  const handleSelect = useCallback((spec: VehicleSpec) => {
    setQuery(`${spec.brand} ${spec.model}`);
    setOpen(false);
    setResults([]);
    onSelect(spec);
  }, [onSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(results[highlightIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={'Fahrzeug suchen \u2013 z.\u00a0B. \u201eGolf GTI\u201c, \u201eM340i\u201c, \u201ei30 N\u201c\u2026'}
          className="field-input pl-10 pr-10"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 rounded-md border border-border bg-card shadow-lg overflow-hidden"
          >
            <ul className="py-1 max-h-72 overflow-y-auto">
              {results.map((spec, idx) => (
                <li key={`${spec.brand}-${spec.model}-${spec.engineCode}`}>
                  <button
                    type="button"
                    onClick={() => handleSelect(spec)}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                      idx === highlightIndex
                        ? 'bg-primary/10'
                        : 'hover:bg-secondary/50'
                    }`}
                  >
                    <Car className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {spec.brand} {spec.model}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {spec.engineCode}
                        {spec.ecuType ? ` · ${spec.ecuType}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-primary">{spec.stockHp} PS</p>
                      <p className="text-[10px] text-muted-foreground">{spec.stockNm} Nm</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="px-4 py-2 border-t border-border bg-secondary/30">
              <p className="text-[10px] text-muted-foreground">
                {results.length} Ergebnis{results.length !== 1 ? 'se' : ''} · ↑↓ navigieren · Enter auswählen
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
