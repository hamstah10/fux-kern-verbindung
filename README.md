# TuningCockpit

Web-basiertes Cockpit zur Verwaltung von Fahrzeug-Tuning-Projekten, Kunden, Aufträgen und Dyno-Daten. Gebaut mit React 18, Vite, TypeScript, Tailwind CSS und shadcn/ui.

> 📖 Die ausführliche, interaktive Installationsanleitung findest du nach dem Start der App unter **`/operations/installation`**.

---

## Inhalt

- [Voraussetzungen](#voraussetzungen)
- [Schnellstart](#schnellstart)
- [Umgebungsvariablen](#umgebungsvariablen)
- [Verfügbare Skripte](#verfügbare-skripte)
- [Projektstruktur](#projektstruktur)
- [Backend (Lovable Cloud)](#backend-lovable-cloud)
- [Fahrzeugdatenbank-API](#fahrzeugdatenbank-api)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Voraussetzungen

| Tool | Version | Hinweis |
|------|---------|---------|
| Node.js | **18+** (LTS) | Prüfen mit `node --version` |
| npm / pnpm / bun | aktuell | Paketmanager deiner Wahl |
| Git | aktuell | Zum Klonen des Repos |
| Browser | aktuell | Chrome, Firefox, Edge oder Safari |

---

## Schnellstart

```bash
# 1. Repository klonen
git clone https://github.com/dein-team/tuningcockpit.git
cd tuningcockpit

# 2. Abhängigkeiten installieren
npm install
# oder
pnpm install
# oder
bun install

# 3. Umgebungsvariablen anlegen
cp .env.example .env   # Werte anpassen

# 4. Entwicklungsserver starten
npm run dev
```

Die App läuft anschließend unter **http://localhost:5173**.

---

## Umgebungsvariablen

Lege eine `.env`-Datei im Projektroot an:

```env
VITE_API_URL=https://api.deine-domain.de
VITE_APP_NAME=TuningCockpit
```

> ⚠️ Alle clientseitig genutzten Variablen **müssen** mit `VITE_` beginnen, sonst werden sie von Vite nicht eingebunden.

Server-Secrets (z. B. API-Tokens) gehören **nicht** in `.env`, sondern in die Lovable Cloud Secrets:

```
FAHRZEUGDATENBANK_API_TOKEN=<dein-api-token>
FAHRZEUGDATENBANK_TOKEN_ID=<deine-token-id>
```

---

## Verfügbare Skripte

| Befehl | Zweck |
|--------|-------|
| `npm run dev` | Startet den Vite-Entwicklungsserver |
| `npm run build` | Erstellt einen produktiven Build in `dist/` |
| `npm run preview` | Lokale Vorschau des Production-Builds |
| `npm run lint` | ESLint-Check |
| `npm run test` | Vitest-Unit-Tests |

---

## Projektstruktur

```
src/
├── components/        # Wiederverwendbare UI-Komponenten (inkl. shadcn/ui)
├── pages/             # Seiten / Routen
│   └── InstallationGuidePage.tsx   # Interaktive Installations-Doku
├── lib/               # API-Clients, Stores, Utilities
├── hooks/             # Custom React Hooks
├── types/             # Geteilte TypeScript-Typen
├── index.css          # Design-Tokens (HSL) & Tailwind Layer
└── App.tsx            # Routing
```

---

## Backend (Lovable Cloud)

TuningCockpit nutzt **Lovable Cloud** für Datenbank, Auth, Storage und Edge Functions – ohne externen Account.

1. Lovable Cloud in den Projekteinstellungen aktivieren.
2. Tabellen + RLS-Policies anlegen, z. B.:
   ```sql
   CREATE TABLE vehicles (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     brand TEXT NOT NULL,
     model TEXT NOT NULL,
     year INTEGER,
     engine TEXT,
     power_stock INTEGER,
     power_tuned INTEGER,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
   ```
3. Auth-Provider (E-Mail/Passwort, Google, Apple) im Dashboard konfigurieren.
4. Server-seitige Logik (private API-Keys, E-Mail, Payments) als **Edge Functions** umsetzen.

---

## Fahrzeugdatenbank-API

Externe Datenquelle: `https://verwaltung.tuningfux.de/api/fahrzeugdatenbank`

Pflicht-Header pro Request:

```
Authorization: Bearer <FAHRZEUGDATENBANK_API_TOKEN>
X-Token-Id:    <FAHRZEUGDATENBANK_TOKEN_ID>
```

> 🔐 Tokens **niemals** im Client-Code committen – stattdessen via Edge Function proxyen und als Secret hinterlegen.

---

## Deployment

| Plattform | Vorgehen |
|-----------|----------|
| **Lovable Cloud** | Ein-Klick-Publish aus dem Editor |
| **Vercel / Netlify** | Repo verbinden, Build-Befehl `npm run build`, Output `dist` |
| **Eigener Server** | `dist/` per nginx oder Apache statisch ausliefern |

---

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| Port 5173 belegt | `npm run dev -- --port 3000` |
| `Module not found` | `node_modules` + Lockfile löschen, neu `npm install` |
| Env-Vars greifen nicht | Müssen mit `VITE_` beginnen, Dev-Server neu starten |
| API liefert 401/403 | Tokens prüfen, Header korrekt gesetzt? |

---

## Lizenz

Proprietär – © TuningCockpit. Alle Rechte vorbehalten.
