import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Euro } from 'lucide-react';
import { DataCard, StatusBadge } from '@/components/DataComponents';
import { mockOrders, mockLeads, mockVehicles, orderStatusLabels } from '@/lib/mock-data';
import type { OrderStatus } from '@/types/models';

const orderStatusDisplay: Record<OrderStatus, 'new' | 'processing' | 'success' | 'warning' | 'error'> = {
  received: 'new', in_progress: 'processing', on_hold: 'warning', parked: 'warning', completed: 'success', rejected: 'error',
};

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTH_NAMES = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export default function OperationsCalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group orders by date
  const ordersByDate = useMemo(() => {
    const map: Record<string, typeof mockOrders> = {};
    for (const order of mockOrders) {
      const dateKey = new Date(order.created_at).toISOString().slice(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(order);
    }
    return map;
  }, []);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = now.toISOString().slice(0, 10);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };

  const selectedOrders = selectedDate ? (ordersByDate[selectedDate] ?? []) : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Kalender</h1>
        <p className="text-sm text-muted-foreground mb-6">Aufträge nach Erstelldatum</p>

        <div className="grid grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="col-span-2">
            <DataCard>
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1.5 rounded-sm hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-bold text-foreground">{MONTH_NAMES[month]} {year}</h2>
                <button onClick={nextMonth} className="p-1.5 rounded-sm hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map(d => (
                  <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-1">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const orders = ordersByDate[dateKey] ?? [];
                  const isToday = dateKey === today;
                  const isSelected = dateKey === selectedDate;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateKey)}
                      className={`aspect-square rounded-sm flex flex-col items-center justify-center relative transition-all text-sm ${
                        isSelected
                          ? 'bg-destructive text-destructive-foreground font-bold'
                          : isToday
                            ? 'bg-secondary text-foreground font-bold ring-1 ring-destructive/50'
                            : 'text-foreground hover:bg-secondary/60'
                      }`}
                    >
                      {day}
                      {orders.length > 0 && (
                        <div className={`flex gap-0.5 mt-0.5 ${isSelected ? 'opacity-80' : ''}`}>
                          {orders.slice(0, 3).map((_, j) => (
                            <div key={j} className={`h-1 w-1 rounded-full ${isSelected ? 'bg-destructive-foreground' : 'bg-destructive'}`} />
                          ))}
                          {orders.length > 3 && <span className="text-[7px] text-muted-foreground">+</span>}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </DataCard>
          </div>

          {/* Day Detail */}
          <div>
            <DataCard>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
                  : 'Tag auswählen'}
              </h3>
              {selectedDate && selectedOrders.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Keine Aufträge an diesem Tag</p>
              )}
              <div className="space-y-2">
                {selectedOrders.map(order => {
                  const lead = mockLeads.find(l => l.id === order.lead_id);
                  const vehicle = mockVehicles.find(v => v.id === order.vehicle_id);
                  return (
                    <div key={order.id} className="p-2.5 rounded-sm bg-secondary/50 border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono-data text-muted-foreground">{order.id}</span>
                        <StatusBadge status={orderStatusDisplay[order.status]} label={orderStatusLabels[order.status]} />
                      </div>
                      {lead && <p className="text-sm text-foreground">{lead.name}</p>}
                      {vehicle && <p className="text-xs text-muted-foreground">{vehicle.brand} {vehicle.model}</p>}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs font-mono-data text-foreground">
                          <Euro className="h-3 w-3" /> €{order.total_eur.toLocaleString('de-DE')}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!selectedDate && (
                <p className="text-sm text-muted-foreground italic">Klicke auf einen Tag um Aufträge zu sehen</p>
              )}
            </DataCard>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
