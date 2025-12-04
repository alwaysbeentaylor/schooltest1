# Server Port Configuratie

Deze applicatie kan nu op verschillende poorten draaien zonder code aanpassingen. De versie van server 3005 (met het uitgebreide inschrijfformulier) is behouden.

## Hoe te gebruiken

### Optie 1: Via npm scripts (aanbevolen)

**Voor server op poort 3000:**
```bash
npm run static:3000    # Static file server op poort 3000
npm run server:3000    # Express API server op poort 3000
npm run dev:3000       # Vite dev server op poort 3000
```

**Voor server op poort 3005:**
```bash
npm run static:3005    # Static file server op poort 3005
npm run server:3005    # Express API server op poort 3005
npm run dev:3005       # Vite dev server op poort 3005
```

### Optie 2: Via environment variabelen

**Windows (PowerShell):**
```powershell
$env:PORT=3000; node serve-static.cjs
$env:PORT=3005; node serve-static.cjs
```

**Windows (CMD):**
```cmd
set PORT=3000 && node serve-static.cjs
set PORT=3005 && node serve-static.cjs
```

**Linux/Mac:**
```bash
PORT=3000 node serve-static.cjs
PORT=3005 node serve-static.cjs
```

## Belangrijk

- De versie van server 3005 (met het uitgebreide inschrijfformulier) is behouden
- Alle servers gebruiken nu dezelfde codebase
- Port configuratie gebeurt via environment variabelen
- Default poorten blijven: 3000 (static), 3001 (API), 3004 (Vite dev)

## Installatie

Als je de nieuwe scripts wilt gebruiken, installeer eerst de dependencies:
```bash
npm install
```

Dit installeert `cross-env` dat nodig is voor Windows-ondersteuning.



