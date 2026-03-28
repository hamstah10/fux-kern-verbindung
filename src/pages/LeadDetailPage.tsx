import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, Car, Building2, Calendar, Tag, MessageSquare, FileText, ShoppingCart } from 'lucide-react';
import { SectionHeader, DataCard, StatusBadge } from '@/components/DataComponents';
import { mockLeads, mockVehicles, mockOrders, mockDealerRequests, mockFiles, mockRecommendations, sourceLabels, leadStatusLabels, orderStatusLabels, dealerRequestStatusLabels } from '@/lib/mock-data';
import type { LeadStatus } from '@/types/models';

const leadStatusToDisplay: Record<LeadStatus, 'success' | 'processing' | 'new' | 'warning' | 'error'> = {
  new: 'new', qualified: 'processing', in_progress: 'processing', converted: 'success', lost: 'error',
};

const orderStatusDisplay: Record<string, 'new' | 'processing' | 'success' | 'warning'> = {
  draft: 'new', confirmed: 'processing', in_progress: 'processing', quality_check: 'warning', completed: 'success', delivered: 'success',
};

const drStatusDisplay: Record<string, 'new' | 'processing' | 'success' | 'error'> = {
  pending: 'new', accepted: 'processing', in_progress: 'processing', completed: 'success', rejected: 'error',
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const lead = mockLeads.find(l => l.id === id);

  if (!lead) {
    return (
      <div className="p-6">
        <Link to="/admin/leads" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Zurück zu Leads
        </Link>
        <p className="text-muted-foreground">Lead nicht gefunden.</p>
      </div>
    );
  }

  const vehicle = lead.vehicle_id ? mockVehicles.find(v => v.id === lead.vehicle_id) : undefined;
  const orders = mockOrders.filter(o => o.lead_id === lead.id);
  const dealerRequests = mockDealerRequests.filter(dr => dr.lead_id === lead.id);
  const recommendations = mockRecommendations.filter(r => r.lead_id === lead.id);
  const files = mockFiles.filter(f => f.lead_id === lead.id);

  const createdDate = new Date(lead.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const updatedDate = new Date(lead.updated_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="p-6">
      <Link to="/admin/leads" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Zurück zu Leads
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">{lead.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{lead.email}</p>
          </div>
          <StatusBadge status={leadStatusToDisplay[lead.status]} label={leadStatusLabels[lead.status]} />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Contact Info */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Kontaktdaten</h3>
            <div className="space-y-3">
              <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Name" value={lead.name} />
              <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="E-Mail" value={lead.email} />
              <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Telefon" value={lead.phone || '–'} />
              <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Erstellt" value={createdDate} />
              <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Aktualisiert" value={updatedDate} />
            </div>
          </DataCard>

          {/* Source Info */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quelle & Tracking</h3>
            <div className="space-y-3">
              <InfoRow icon={<Tag className="h-3.5 w-3.5" />} label="Kanal" value={sourceLabels[lead.source_metadata.type]} />
              {lead.source_metadata.campaign && (
                <InfoRow icon={<Tag className="h-3.5 w-3.5" />} label="Kampagne" value={lead.source_metadata.campaign} mono />
              )}
              {lead.source_metadata.click_id && (
                <InfoRow icon={<Tag className="h-3.5 w-3.5" />} label="Click ID" value={lead.source_metadata.click_id} mono />
              )}
              {lead.source_metadata.referrer && (
                <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Empfohlen von" value={lead.source_metadata.referrer} />
              )}
              {lead.assigned_dealer_id && (
                <InfoRow icon={<Building2 className="h-3.5 w-3.5" />} label="Händler" value={lead.assigned_dealer_id} mono />
              )}
            </div>
          </DataCard>

          {/* Vehicle */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Fahrzeug</h3>
            {vehicle ? (
              <div className="space-y-3">
                <InfoRow icon={<Car className="h-3.5 w-3.5" />} label="Fahrzeug" value={`${vehicle.brand} ${vehicle.model}`} />
                <InfoRow label="Baujahr" value={String(vehicle.year)} />
                <InfoRow label="Motorcode" value={vehicle.engine_code} mono />
                <InfoRow label="ECU" value={vehicle.ecu_type} mono />
                <InfoRow label="Leistung" value={`${vehicle.stock_hp} PS / ${vehicle.stock_nm} Nm`} />
                {vehicle.vin && <InfoRow label="VIN" value={vehicle.vin} mono />}
                <Link to={`/admin/vehicles/${vehicle.id}`} className="text-xs text-destructive hover:underline mt-2 block">
                  Fahrzeug-Details →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Kein Fahrzeug zugeordnet</p>
            )}
          </DataCard>
        </div>

        {/* Notes */}
        {lead.notes && (
          <DataCard className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notizen</h3>
            <p className="text-sm text-foreground">{lead.notes}</p>
          </DataCard>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Empfehlungen ({recommendations.length})</h3>
            <div className="space-y-2">
              {recommendations.map(rec => (
                <DataCard key={rec.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{rec.stage_label}</p>
                      <p className="text-xs text-muted-foreground">+{rec.delta_hp} PS · +{rec.delta_nm} Nm → {rec.estimated_hp} PS / {rec.estimated_nm} Nm</p>
                    </div>
                    <span className="font-mono-data text-[10px] text-muted-foreground/40">{rec.id}</span>
                  </div>
                </DataCard>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        {orders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Aufträge ({orders.length})</h3>
            <div className="space-y-2">
              {orders.map(order => (
                <Link to={`/admin/orders/${order.id}`} key={order.id}>
                  <DataCard className="hover:border-muted-foreground/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">€{order.total_eur.toLocaleString('de-DE')}</p>
                        <p className="text-xs text-muted-foreground">{order.items.join(', ')}</p>
                      </div>
                      <StatusBadge status={orderStatusDisplay[order.status]} label={orderStatusLabels[order.status]} />
                    </div>
                  </DataCard>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Dealer Requests */}
        {dealerRequests.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Werkstattanfragen ({dealerRequests.length})</h3>
            <div className="space-y-2">
              {dealerRequests.map(dr => (
                <Link to={`/admin/dealer-requests/${dr.id}`} key={dr.id}>
                  <DataCard className="hover:border-muted-foreground/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{dr.dealer_id}</p>
                        <p className="text-xs text-muted-foreground">Equipment: {dr.protocol_equipment.join(', ')} · ~{dr.estimated_duration_hours}h</p>
                      </div>
                      <StatusBadge status={drStatusDisplay[dr.status]} label={dealerRequestStatusLabels[dr.status]} />
                    </div>
                  </DataCard>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* API Trace */}
        <div className="text-[11px] text-muted-foreground/60 font-mono space-y-0.5 mt-8">
          <p>GET /api/v1/leads/{lead.id} → 200 OK</p>
          <p>Response: {JSON.stringify({ id: lead.id, status: lead.status, vehicle_id: lead.vehicle_id }).slice(0, 120)}</p>
        </div>
      </motion.div>
    </div>
  );
}

function InfoRow({ icon, label, value, mono }: { icon?: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="text-muted-foreground mt-0.5">{icon}</span>}
      <div>
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className={`text-sm text-foreground ${mono ? 'font-mono-data' : ''}`}>{value}</p>
      </div>
    </div>
  );
}
