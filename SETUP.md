# VBS Sint-Maarten Website - Setup Instructies

## Vercel Environment Variables

Voeg deze environment variables toe in Vercel (Settings → Environment Variables):

### Verplicht voor foto-uploads:
```
VITE_CLOUDINARY_CLOUD_NAME = dgxcfm2nk
VITE_CLOUDINARY_UPLOAD_PRESET = school_uploads
```

### Optioneel - Voor permanente opslag via GitHub:
```
VITE_GITHUB_TOKEN = ghp_xxxxxxxxxxxxxxxxxxxx
```

**Hoe maak je een GitHub Token:**
1. Ga naar https://github.com/settings/tokens
2. Klik "Generate new token (classic)"
3. Geef een naam: "VBS Website Admin"
4. Selecteer scope: `repo` (full control)
5. Klik "Generate token"
6. Kopieer de token en voeg toe aan Vercel

### Optioneel - Voor AI nieuws generatie:
```
VITE_GEMINI_API_KEY = your_key_here
```

---

## Admin Panel Toegang

**URL:** https://schooltest1.vercel.app/#/admin

**Wachtwoord:** sintmaarten2026

---

## Hoe werkt het?

### Foto Uploads
- Alle foto's worden geüpload naar Cloudinary (cloud storage)
- Foto's blijven permanent beschikbaar
- Geen server nodig!

### Data Opslag
- **Met GitHub Token:** Wijzigingen worden opgeslagen in de GitHub repository
  - Vercel detecteert de wijziging en rebuild automatisch (~30-60 sec)
  - Wijzigingen zijn dan zichtbaar voor iedereen
  
- **Zonder GitHub Token:** Wijzigingen worden lokaal opgeslagen
  - Alleen zichtbaar in dezelfde browser
  - Verdwijnt bij wissen browser data

### Aanbevolen Setup
Voor de beste ervaring, configureer beide:
1. Cloudinary (voor foto's) ✅ Al ingesteld
2. GitHub Token (voor data) → Moet nog toegevoegd worden

---

## Testen

1. Ga naar https://schooltest1.vercel.app/#/admin
2. Log in met wachtwoord: `sintmaarten2026`
3. Probeer een nieuwsbericht toe te voegen met foto
4. Check of de foto uploadt (je ziet een progress bar)
5. Bekijk de publieke site om je wijziging te zien

