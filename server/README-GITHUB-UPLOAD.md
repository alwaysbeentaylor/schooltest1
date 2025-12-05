# GitHub Auto-Upload Setup

Deze server kan automatisch geüploade foto's naar GitHub pushen via de GitHub API.

## Setup Instructies

### 1. Maak een GitHub Personal Access Token

1. Ga naar [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Klik op "Generate new token (classic)"
3. Geef de token een naam (bijv. "School Upload Token")
4. Selecteer de scope: **`repo`** (full control of private repositories)
5. Klik "Generate token"
6. **Kopieer de token** (je ziet hem maar één keer!)

### 2. Configureer Environment Variables

1. Kopieer `.env.example` naar `.env` in de `server/` folder:
   ```bash
   cd server
   cp .env.example .env
   ```

2. Open `.env` en vul de waarden in:
   ```env
   GIT_AUTO_PUSH=true
   GITHUB_TOKEN=ghp_your_token_here
   GITHUB_REPO=alwaysbeentaylor/schooltest1
   ```

   **Belangrijk:**
   - `GITHUB_REPO` moet het formaat `owner/repo` hebben
   - Vervang `alwaysbeentaylor/schooltest1` met jouw eigen repository

### 3. Test de Configuratie

1. Start de server:
   ```bash
   cd server
   node index.js
   ```

2. Upload een foto via het admin panel

3. Check de server console - je zou moeten zien:
   ```
   ✅ Foto gepusht naar GitHub: public/images/category/filename.jpg
   ```

4. Check je GitHub repository - de foto zou automatisch moeten verschijnen!

## Troubleshooting

### "GITHUB_TOKEN niet gevonden"
- Controleer of `.env` bestaat in de `server/` folder
- Controleer of de variabele correct is gespeld
- Herstart de server na het aanmaken/bewerken van `.env`

### "GITHUB_REPO niet gevonden"
- Controleer of `GITHUB_REPO` het formaat `owner/repo` heeft (geen https://)
- Bijvoorbeeld: `alwaysbeentaylor/schooltest1` ✅
- Niet: `https://github.com/alwaysbeentaylor/schooltest1` ❌

### "Fout bij GitHub push: Bad credentials"
- Je token is ongeldig of verlopen
- Maak een nieuwe token aan en update `.env`

### "Fout bij GitHub push: Not found"
- De repository bestaat niet of je hebt geen toegang
- Controleer of `GITHUB_REPO` correct is
- Controleer of je token `repo` rechten heeft

### Foto's worden niet gepusht
- Controleer of `GIT_AUTO_PUSH=true` in `.env` staat
- Check de server console voor error messages
- Uploads falen niet als GitHub push faalt - check de logs

## Uitschakelen

Zet `GIT_AUTO_PUSH=false` in `.env` om automatisch pushen uit te schakelen. Foto's worden dan alleen lokaal opgeslagen.

