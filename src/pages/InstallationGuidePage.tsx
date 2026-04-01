import { CheckCircle2, Copy, Terminal, Download, Server, Database, Shield, Globe, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface StepProps {
  number: number;
  title: string;
  children: React.ReactNode;
}

function Step({ number, title, children }: StepProps) {
  return (
    <div className="flex gap-4 mb-8">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground font-bold text-sm">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <div className="text-muted-foreground text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-md border border-border bg-muted/50 overflow-hidden">
      {label && (
        <div className="px-4 py-1.5 bg-secondary/60 border-b border-border text-xs text-muted-foreground font-medium flex items-center gap-1.5">
          <Terminal className="h-3 w-3" />
          {label}
        </div>
      )}
      <div className="relative">
        <pre className="px-4 py-3 text-sm font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
          {code}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-sm bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

function RequirementCard({ icon: Icon, title, description }: { icon: typeof Server; title: string; description: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-4 flex gap-3">
      <Icon className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export default function InstallationGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Installationsanleitung</h1>
        <p className="text-muted-foreground">
          Schritt-für-Schritt-Anleitung zur Einrichtung und Konfiguration des TuningCockpit.
        </p>
      </div>

      {/* Requirements */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-destructive" />
          Systemvoraussetzungen
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RequirementCard
            icon={Server}
            title="Node.js 18+"
            description="LTS-Version empfohlen. Prüfbar via node --version"
          />
          <RequirementCard
            icon={Database}
            title="npm oder pnpm"
            description="Paketmanager für Abhängigkeiten"
          />
          <RequirementCard
            icon={Globe}
            title="Moderner Browser"
            description="Chrome, Firefox, Edge oder Safari (aktuelle Version)"
          />
          <RequirementCard
            icon={Download}
            title="Git"
            description="Zur Verwaltung des Quellcodes"
          />
        </div>
      </section>

      {/* Installation steps */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-destructive" />
          Installation
        </h2>

        <Step number={1} title="Repository klonen">
          <p>Klone das TuningCockpit-Repository auf dein lokales System.</p>
          <CodeBlock
            label="Terminal"
            code="git clone https://github.com/dein-team/tuningcockpit.git
cd tuningcockpit"
          />
        </Step>

        <Step number={2} title="Abhängigkeiten installieren">
          <p>Installiere alle benötigten Pakete mit npm.</p>
          <CodeBlock
            label="Terminal"
            code="npm install"
          />
          <p className="mt-2">Alternativ mit pnpm:</p>
          <CodeBlock code="pnpm install" />
        </Step>

        <Step number={3} title="Umgebungsvariablen konfigurieren">
          <p>Erstelle eine <code className="text-foreground font-mono text-xs bg-muted px-1.5 py-0.5 rounded">.env</code>-Datei im Projektverzeichnis und passe die Werte an.</p>
          <CodeBlock
            label=".env"
            code={`VITE_API_URL=https://api.deine-domain.de
VITE_APP_NAME=TuningCockpit`}
          />
        </Step>

        <Step number={4} title="Entwicklungsserver starten">
          <p>Starte den lokalen Entwicklungsserver.</p>
          <CodeBlock
            label="Terminal"
            code="npm run dev"
          />
          <p className="mt-2">
            Die Anwendung ist anschließend unter{' '}
            <code className="text-foreground font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
              http://localhost:5173
            </code>{' '}
            erreichbar.
          </p>
        </Step>

        <Step number={5} title="Produktions-Build erstellen">
          <p>Für den produktiven Einsatz erzeuge einen optimierten Build.</p>
          <CodeBlock
            label="Terminal"
            code={`npm run build
npm run preview`}
          />
          <p className="mt-2">
            Die statischen Dateien befinden sich im{' '}
            <code className="text-foreground font-mono text-xs bg-muted px-1.5 py-0.5 rounded">dist/</code>-Verzeichnis
            und können auf jedem Webserver gehostet werden.
          </p>
        </Step>
      </section>

      {/* Deployment */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Globe className="h-5 w-5 text-destructive" />
          Deployment
        </h2>

        <div className="rounded-md border border-border bg-card p-5">
          <h3 className="text-base font-semibold text-foreground mb-3">Hosting-Optionen</h3>
          <ul className="space-y-3">
            {[
              { name: 'Lovable Cloud', desc: 'Ein-Klick-Deployment direkt aus der Entwicklungsumgebung' },
              { name: 'Vercel', desc: 'Automatisches Deployment via Git-Integration' },
              { name: 'Netlify', desc: 'Einfaches Hosting mit CI/CD-Pipeline' },
              { name: 'Eigener Server', desc: 'Statische Dateien via nginx oder Apache ausliefern' },
            ].map(option => (
              <li key={option.name} className="flex items-start gap-2 text-sm">
                <ArrowRight className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span>
                  <span className="font-medium text-foreground">{option.name}</span>
                  <span className="text-muted-foreground"> – {option.desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Troubleshooting */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-destructive" />
          Häufige Probleme
        </h2>
        <div className="space-y-3">
          {[
            {
              q: 'Port 5173 ist bereits belegt',
              a: 'Verwende einen anderen Port: npm run dev -- --port 3000',
            },
            {
              q: 'Module not found-Fehler',
              a: 'Lösche node_modules und package-lock.json, dann führe npm install erneut aus.',
            },
            {
              q: 'Umgebungsvariablen werden nicht geladen',
              a: 'Stelle sicher, dass alle Variablen mit VITE_ beginnen. Starte den Dev-Server nach Änderungen neu.',
            },
          ].map(item => (
            <div key={item.q} className="rounded-md border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground mb-1">{item.q}</p>
              <p className="text-xs text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
