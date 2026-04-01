import { CheckCircle2, Copy, Terminal, Download, Server, Database, Shield, Globe, ArrowRight, Key, Link2, AlertTriangle } from 'lucide-react';
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

      {/* Backend & Database */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Database className="h-5 w-5 text-destructive" />
          Backend &amp; Datenbankanbindung
        </h2>

        <p className="text-muted-foreground text-sm mb-6">
          TuningCockpit nutzt <span className="text-foreground font-medium">Lovable Cloud</span> als Backend-Infrastruktur.
          Dies umfasst eine PostgreSQL-Datenbank, Authentifizierung, Dateispeicher und Edge Functions – alles ohne externen Account.
        </p>

        <Step number={1} title="Lovable Cloud aktivieren">
          <p>
            Aktiviere Lovable Cloud in den Projekteinstellungen. Dadurch wird automatisch eine PostgreSQL-Datenbank,
            ein Auth-System und Dateispeicher bereitgestellt.
          </p>
          <div className="mt-3 rounded-md border border-border bg-muted/30 p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">Hinweis:</span> Lovable Cloud muss aktiviert sein,
              bevor Backend-Funktionen wie Login, Datenbank oder Edge Functions genutzt werden können.
            </p>
          </div>
        </Step>

        <Step number={2} title="Fahrzeugdatenbank-API anbinden">
          <p>
            Die Fahrzeugdatenbank ist an eine externe API angebunden. Folgende Umgebungsvariablen müssen als
            Secrets im Projekt hinterlegt werden:
          </p>
          <CodeBlock
            label="Secrets"
            code={`FAHRZEUGDATENBANK_API_TOKEN=<dein-api-token>
FAHRZEUGDATENBANK_TOKEN_ID=<deine-token-id>`}
          />
          <p className="mt-2">
            Die API ist erreichbar unter{' '}
            <code className="text-foreground font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
              https://verwaltung.tuningfux.de/api/fahrzeugdatenbank
            </code>
          </p>
          <p className="mt-2">
            Jeder Request benötigt die Header{' '}
            <code className="text-foreground font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Authorization: Bearer &lt;API_TOKEN&gt;</code>{' '}
            und{' '}
            <code className="text-foreground font-mono text-xs bg-muted px-1.5 py-0.5 rounded">X-Token-Id: &lt;TOKEN_ID&gt;</code>.
          </p>
        </Step>

        <Step number={3} title="Datenbank-Schema einrichten">
          <p>
            Nach der Aktivierung von Lovable Cloud können Tabellen und RLS-Policies direkt im Editor angelegt werden.
            Beispiel für eine Fahrzeugtabelle:
          </p>
          <CodeBlock
            label="SQL"
            code={`CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  engine TEXT,
  power_stock INTEGER,
  power_tuned INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;`}
          />
        </Step>

        <Step number={4} title="Edge Functions für API-Aufrufe">
          <p>
            Server-seitige Logik wie API-Aufrufe mit privaten Schlüsseln, E-Mail-Versand oder Zahlungsabwicklung
            wird über Edge Functions realisiert.
          </p>
          <CodeBlock
            label="Edge Function (Beispiel)"
            code={`import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const apiToken = Deno.env.get("FAHRZEUGDATENBANK_API_TOKEN");
  const tokenId = Deno.env.get("FAHRZEUGDATENBANK_TOKEN_ID");

  const response = await fetch(
    "https://verwaltung.tuningfux.de/api/fahrzeugdatenbank/types",
    {
      headers: {
        "Authorization": \`Bearer \${apiToken}\`,
        "X-Token-Id": tokenId ?? "",
      },
    }
  );

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});`}
          />
        </Step>

        <Step number={5} title="Authentifizierung konfigurieren">
          <p>
            Lovable Cloud unterstützt E-Mail/Passwort-Login sowie Social Login (Google, Apple).
            Die Konfiguration erfolgt über das Dashboard.
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <RequirementCard
              icon={Key}
              title="E-Mail / Passwort"
              description="Standard-Login mit Registrierung und Passwort-Reset"
            />
            <RequirementCard
              icon={Link2}
              title="Social Login"
              description="Sign in with Google und Sign in with Apple"
            />
          </div>
        </Step>
      </section>


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
