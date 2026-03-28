import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Calendar, Clock, Wrench, User, Car, Building2, MessageSquare } from 'lucide-react';
import { DataCard, StatusBadge } from '@/components/DataComponents';
import { mockDealerRequests, mockLeads, mockVehicles, mockDealers, dealerRequestStatusLabels } from '@/lib/mock-data';
import type { DealerRequestStatus } from '@/types/models';

const drStatusDisplay: Record<DealerRequestStatus, 'new' | 'processing' | 'success' | 'error'> = {
  pending: 'new', accepted: 'processing', in_progress: 'processing', completed: 'success', rejected: 'error',
};

const statusSteps: DealerRequestStatus[] = ['pending', 'accepted', 'in_progress', 'completed'];

export default function DealerRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const request = mockDealerRequests.find(r => r.id === id);

  if (!request) {
    return (
      <div className="p-6">
        <Link to="/admin/dealer-requests" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Zurück zu Dealer Requests
        </Link>
        <p className="text-muted-foreground">Anfrage nicht gefunden.</p>
      </div>
    );
  }

  const lead = mockLeads.find(l => l.id === request.lead_id);
  const vehicle = mockVehicles.find(v => v.id === request.vehicle_id);
  const dealer = mockDealers.find(d => d.id === request.dealer_id);
  const createdDate = new Date(request.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const updatedDate = new Date(request.updated_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const currentStepIndex = request.status === 'rejected' ? -1 : statusSteps.indexOf(request.status);

  return (
    <div className="p-6">
      <Link to="/admin/dealer-requests" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Zurück zu Dealer Requests
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-destructive" />
              <h1 className="text-xl font-bold text-foreground">Werkstattanfrage {request.id}</h1>
            </div>
            <p className="text-sm text-muted-foreground">{dealer?.name || request.dealer_id}</p>
          </div>
          <StatusBadge status={drStatusDisplay[request.status]} label={dealerRequestStatusLabels[request.status]} />
        </div>

        {/* Status Pipeline */}
        <DataCard className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Status-Pipeline</h3>
          {request.status === 'rejected' ? (
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 rounded-sm bg-destructive" />
              <p className="text-xs text-destructive font-medium">Abgelehnt</p>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex-1">
                  <div className={`h-2 rounded-sm ${i <= currentStepIndex ? 'bg-destructive' : 'bg-secondary'}`} />
                  <p className={`text-[10px] mt-1 ${i <= currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {dealerRequestStatusLabels[step]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DataCard>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Request Details */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Anfrage-Details</h3>
            <div className="space-y-3">
              <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Erstellt" value={createdDate} />
              <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Aktualisiert" value={updatedDate} />
              <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="Geschätzte Dauer" value={`~${request.estimated_duration_hours} Stunden`} />
            </div>
          </DataCard>

          {/* Equipment */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Protokoll-Equipment</h3>
            <div className="space-y-2">
              {request.protocol_equipment.map(eq => (
                <div key={eq} className="flex items-center gap-2">
                  <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="px-2.5 py-1 rounded-sm bg-secondary text-secondary-foreground text-xs font-medium">{eq}</span>
                </div>
              ))}
            </div>
            {request.notes && (
              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Notizen</p>
                    <p className="text-sm text-foreground">{request.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </DataCard>

          {/* Linked Entities */}
          <DataCard>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Verknüpfungen</h3>
            <div className="space-y-3">
              {lead && (
                <Link to={`/admin/leads/${lead.id}`} className="block hover:bg-muted/20 rounded-sm p-1.5 -m-1.5 transition-colors">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-foreground">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </div>
                  </div>
                </Link>
              )}
              {vehicle && (
                <Link to={`/admin/vehicles/${vehicle.id}`} className="block hover:bg-muted/20 rounded-sm p-1.5 -m-1.5 transition-colors">
                  <div className="flex items-center gap-2">
                    <Car className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-foreground">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.engine_code} · {vehicle.year}</p>
                    </div>
                  </div>
                </Link>
              )}
              {dealer && (
                <Link to={`/admin/partners/${dealer.id}`} className="block hover:bg-muted/20 rounded-sm p-1.5 -m-1.5 transition-colors">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-foreground">{dealer.name}</p>
                      <p className="text-xs text-muted-foreground">{dealer.city}, {dealer.region}</p>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </DataCard>
        </div>

        {/* API Trace */}
        <div className="text-[11px] text-muted-foreground/60 font-mono space-y-0.5 mt-8">
          <p>GET /api/v1/dealer-requests/{request.id} → 200 OK</p>
          <p>Response: {JSON.stringify({ id: request.id, status: request.status, dealer_id: request.dealer_id }).slice(0, 120)}</p>
        </div>
      </motion.div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="text-muted-foreground mt-0.5">{icon}</span>}
      <div>
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}
