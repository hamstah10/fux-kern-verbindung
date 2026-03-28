import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, Car, Shield, Sparkles, ArrowRight, Building2, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-foreground">
            Tuning<span className="text-destructive">Fux</span>
          </span>
          <div className="flex gap-3">
            <Link to="/configurator" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Konfigurator</Link>
            <Link to="/my-garage" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Kundenportal</Link>
            <Link to="/dealer" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Händlerportal</Link>
            <Link to="/admin" className="px-4 py-2 text-sm rounded-sm text-primary-foreground transition-colors bg-destructive">Admin</Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 max-w-2xl">
            Vom Datensatz zur Performance. <span className="text-destructive">Nahtlos.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mb-8">
            Datengesteuertes Chiptuning – von der AI-Analyse bis zum Prüfstand. Jeder Schritt verknüpft, jeder Wert nachvollziehbar.
          </p>
          <div className="flex gap-3">
            <Link to="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-sm text-primary-foreground font-medium transition-colors bg-destructive">
              Command Center öffnen <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/my-garage"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors">
              MyGarage
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-3 gap-6">
          {[
            { icon: Sparkles, title: 'AI-Empfehlung', desc: 'Fahrzeugspezifische Prognosen basierend auf Referenzmessungen. Stage 1–3 mit Risikoeinschätzung.' },
            { icon: Activity, title: 'Dyno-Simulation', desc: 'Leistungskurven mit Umgebungsfaktoren. Ansaugtemperatur, Luftdruck, Kraftstoffqualität.' },
            { icon: Shield, title: 'ECU File Vault', desc: 'Originale und modifizierte ECU-Dateien mit SHA256-Checksummen. Lückenlose Nachverfolgung.' },
            { icon: Users, title: 'Lead Pipeline', desc: 'Source-Tracking über Meta Ads, TikTok, WhatsApp und Organic. Attribution bis zur Konversion.' },
            { icon: Building2, title: 'Partner Hub', desc: 'Zertifizierte Werkstätten mit Equipment-Validierung. Autotuner, Flex, KTag, CMD Flash.' },
            { icon: Car, title: 'Fahrzeugdaten', desc: 'VIN-Dekodierung, Motorcodes, ECU-Generationen. Bosch EDC17, MG1, MED17 und mehr.' },
          ].map((feat, i) => (
            <motion.div key={feat.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              className="rounded-md border border-border bg-card p-5"
            >
              <feat.icon className="h-5 w-5 mb-3 text-destructive" />
              <h3 className="text-sm font-semibold text-foreground mb-1">{feat.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* API Architecture */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-lg font-bold text-foreground mb-6">Symfony API-Architektur</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { method: 'POST', endpoint: '/api/v1/leads', desc: 'Lead anlegen mit Source-Tracking' },
              { method: 'POST', endpoint: '/api/v1/recommendations/generate', desc: 'AI-Empfehlung generieren' },
              { method: 'POST', endpoint: '/api/v1/dyno-simulations', desc: 'Dyno-Prognose berechnen' },
              { method: 'POST', endpoint: '/api/v1/dealer-requests', desc: 'Werkstattanfrage mit Equipment-Check' },
              { method: 'PATCH', endpoint: '/api/v1/leads/{id}/status', desc: 'Lead-Status ändern' },
              { method: 'GET', endpoint: '/api/v1/files/{id}/signed-url', desc: 'Signierte Download-URL' },
              { method: 'POST', endpoint: '/api/v1/vehicles', desc: 'Fahrzeug mit VIN-Validierung anlegen' },
              { method: 'GET', endpoint: '/api/v1/orders', desc: 'Aufträge mit Status abrufen' },
            ].map((api, i) => (
              <motion.div key={api.endpoint}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.03 }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-sm border border-border bg-card"
              >
                <span className={`font-mono-data text-xs font-semibold ${api.method === 'POST' ? 'text-blue-400' : api.method === 'PATCH' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {api.method}
                </span>
                <span className="font-mono-data text-xs text-foreground">{api.endpoint}</span>
                <span className="text-xs text-muted-foreground ml-auto">{api.desc}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        TuningFux · Productized Chiptuning Platform · Symfony + React · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
