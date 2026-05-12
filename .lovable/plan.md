# Standalone Configurator-App (mit hellem Theme)

Neues Lovable-Projekt per **Remix** anlegen, dann auf Configurator-Funktionalität reduzieren und ein helles Theme als Standard etablieren.

## Schritt 1 — Neues Projekt anlegen (durch dich)
Projektname (oben links) → Remix → neues Projekt z. B. „Tuning Configurator". Danach Schritte 2–6 im neuen Projekt ausführen.

## Schritt 2 — Routing reduzieren
`src/App.tsx` auf:
- `/` → `ConfiguratorPage`
- `/configurator/:id` → `ConfiguratorResultPage`
- `*` → `NotFound`

Layouts (`AppLayout`, `OperationsLayout`) und alle anderen Routen entfernen.

## Schritt 3 — Behaltene Dateien
- `src/pages/ConfiguratorPage.tsx`, `ConfiguratorResultPage.tsx`, `NotFound.tsx`
- `src/lib/configurator-store.ts`, `vehicle-database.ts`, `fahrzeugdatenbank-api.ts`, `utils.ts`
- `src/components/VehicleSearch.tsx`
- Genutzte `src/components/ui/*` (button, input, sonner, toaster, tooltip, …)
- `src/types/models.ts`, `src/index.css`, `src/main.tsx`
- `tailwind.config.ts`, `vite.config.ts`, `tsconfig*`, `index.html`, `package.json`

## Schritt 4 — Zu löschende Dateien
Alle nicht-Configurator-Seiten (`Admin*`, `Leads*`, `Vehicles*`, `Orders*`, `Operations*`, `LandingPage`, `InstallationGuidePage`, `MyGarage*`, `Dealer*`, …) sowie zugehörige Komponenten (`AppSidebar`, `OperationsLayout`, `TelemetryBar`, `ActivityTimeline`, `operations-tabs-store`, …). README für Standalone neu schreiben.

## Schritt 5 — Helles Theme als Standard
- `src/index.css`: `:root`-Tokens auf helle Palette setzen (weißer Hintergrund, dunkle Foreground-HSL, dezente Borders/Muted, roter Destructive-Akzent bleibt als Brand-Highlight). Bestehende Dark-Werte unter `.dark` belassen.
- `index.html`: kein `class="dark"` mehr am `<html>` setzen — Standard ist hell.
- `tailwind.config.ts`: `darkMode: 'class'` beibehalten, damit per `.dark`-Klasse umschaltbar.
- Theme-Toggle: kleiner Button (oben rechts auf `ConfiguratorPage`/`ConfiguratorResultPage`) mit `Sun`/`Moon` aus `lucide-react`. Status in `localStorage` (`theme = light | dark`), Initialwert per Inline-Script in `index.html` setzen, um FOUC zu vermeiden.
- Komponenten audit: alle Configurator-Views nutzen bereits semantische Tokens (`bg-background`, `text-foreground`, `bg-secondary`, …). Hardgecodete `bg-black`/`text-white`-Stellen ersetzen, falls vorhanden.
- QA: Configurator-Flow, Vehicle-Search, Result-Charts (Recharts) in beiden Themes prüfen — Achsen-/Tooltip-Farben über CSS-Vars binden.

## Schritt 6 — Branding & Memory
- `index.html` Title/Meta auf „Tuning Configurator"
- Memory des neuen Projekts: Core-Regel auf „Helles Theme als Default, Dark per Toggle, Roter Brand-Akzent" anpassen.

## Was ich von dir brauche
1. Bestätigung **Remix** als Vorgehen, oder
2. Alternativ: ZIP-Export der Configurator-Dateien unter `/mnt/documents/`.

Sag Bescheid sobald geremixt — dann führe ich Schritte 2–6 dort aus.
