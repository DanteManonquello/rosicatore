# 🚀 GUIDA AL DEPLOYMENT SU CLOUDFLARE PAGES

## 📋 PREREQUISITI

### 1. Account Cloudflare
- Registrati su [Cloudflare](https://dash.cloudflare.com/sign-up) (gratuito)
- Verifica email

### 2. API Token Cloudflare
1. Vai su [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click su **"My Profile"** (in alto a destra)
3. Seleziona **"API Tokens"**
4. Click **"Create Token"**
5. Usa template **"Edit Cloudflare Workers"** OPPURE crea custom con permessi:
   - `Account` → `Cloudflare Pages` → `Edit`
   - `Account` → `Account Settings` → `Read`
6. Copia il token generato (serve per il deploy)

### 3. Dominio (opzionale)
- Se hai un dominio su Register.it, prepara le credenziali
- **NON è necessario trasferire il dominio** - basta puntare i nameserver

---

## 🔧 SETUP CLOUDFLARE PAGES

### Metodo 1: Deploy da GitHub (RACCOMANDATO)

#### Step 1: Push codice su GitHub
```bash
# Assicurati che il token GitHub sia valido
# Se scaduto, vai su GitHub → Settings → Developer settings → Personal access tokens
# Genera nuovo token con permessi: repo (full control)

cd /home/user/webapp
git push origin main
```

#### Step 2: Connetti Cloudflare Pages a GitHub
1. Vai su [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Click **"Create a project"**
3. Click **"Connect to Git"**
4. Autorizza GitHub (prima volta)
5. Seleziona repository **"rosicatore"**
6. Configura build:
   ```
   Project name: rosicatore
   Production branch: main
   Build command: npm run build
   Build output directory: dist
   ```
7. **Environment Variables** (lascia vuoto per ora, aggiungeremo dopo)
8. Click **"Save and Deploy"**

**Risultato:** Cloudflare builderà e deploierà automaticamente!
- URL production: `https://rosicatore.pages.dev`
- Ogni push su `main` triggera un nuovo deploy automatico

---

### Metodo 2: Deploy CLI con Wrangler (se GitHub non disponibile)

#### Step 1: Setup Cloudflare API nel sandbox
```bash
# IMPORTANTE: Prima vai su Deploy tab e configura API key
# Poi torna qui e esegui:
cd /home/user/webapp
npm install -g wrangler
wrangler login  # Apre browser per autenticare
```

#### Step 2: Build progetto
```bash
cd /home/user/webapp
npm run build
```

#### Step 3: Deploy
```bash
# Prima deploy (crea progetto)
npx wrangler pages project create rosicatore \
  --production-branch main \
  --compatibility-date 2024-01-01

# Deploy dist/ folder
npx wrangler pages deploy dist --project-name rosicatore
```

**Risultato:** 
- Production: `https://rosicatore.pages.dev`
- Branch: `https://main.rosicatore.pages.dev`

---

## 🔒 RENDERE IL SITO NON INDICIZZABILE

### Opzione A: robots.txt + noindex meta tags (✅ GIÀ IMPLEMENTATO)

File già presenti nel progetto:
- `public/robots.txt` → blocca tutti i bot
- `<meta name="robots" content="noindex, nofollow">` → impedisce indicizzazione

**Test:** Vai su `https://rosicatore.pages.dev/robots.txt` - deve mostrare:
```
User-agent: *
Disallow: /
```

---

### Opzione B: Cloudflare Access (Protezione Email)

**FREE per <50 utenti/mese**

#### Setup Access (5 minuti):
1. Vai su [Cloudflare Zero Trust](https://one.dash.cloudflare.com/)
2. Click **"Access"** → **"Applications"** → **"Add an application"**
3. Seleziona **"Self-hosted"**
4. Configura:
   ```
   Application name: Rosicatore Portfolio
   Session Duration: 24 hours
   Application domain: rosicatore.pages.dev
   ```
5. Policy:
   ```
   Policy name: Email Whitelist
   Action: Allow
   Include:
     - Selector: Emails
     - Value: tua-email@example.com (e altre email autorizzate)
   ```
6. Click **"Save"**

**Risultato:**
- ✅ Solo utenti con email autorizzate possono accedere
- ✅ Login tramite codice OTP inviato via email
- ✅ Google bot e altri crawler vengono bloccati
- ✅ Nessun costo (<50 utenti)

---

### Opzione C: Cloudflare Access con Google Auth

Se preferisci login Google invece di email:
1. Segui setup Access sopra
2. Policy usa:
   ```
   Include:
     - Selector: Emails
     - Value: tua-email@gmail.com
   ```
3. Login sarà con Google OAuth

---

## 🌐 DOMINIO CUSTOM (Register.it)

### Step 1: Aggiungi dominio a Cloudflare
1. Vai su [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **"Add site"**
3. Inserisci dominio: `tuodominio.it`
4. Seleziona piano **Free**
5. Cloudflare mostrerà 2 nameserver, es:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```

### Step 2: Cambia nameserver su Register.it
1. Login su [Register.it](https://www.register.it/)
2. Vai su **"I miei domini"** → seleziona dominio
3. Click **"Gestione DNS"** o **"Modifica nameserver"**
4. Sostituisci nameserver Register.it con quelli Cloudflare:
   ```
   Nameserver 1: ns1.cloudflare.com
   Nameserver 2: ns2.cloudflare.com
   ```
5. Salva modifiche

**⏳ Tempo propagazione:** 0-24 ore (solitamente 1-2 ore)

### Step 3: Configura dominio su Cloudflare Pages
1. Vai su [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Seleziona progetto **"rosicatore"**
3. Tab **"Custom domains"**
4. Click **"Set up a custom domain"**
5. Inserisci: `tuodominio.it`
6. Cloudflare crea automaticamente DNS record

**Risultato:**
- ✅ `https://tuodominio.it` → tuo sito
- ✅ SSL automatico attivo in ~5 minuti
- ✅ CDN globale Cloudflare (300+ datacenter)

---

## 🔄 WORKFLOW AGGIORNAMENTI

### Aggiornamenti veloci (2 minuti)
1. Modifica codice localmente
2. Commit e push:
   ```bash
   cd /home/user/webapp
   git add .
   git commit -m "Update feature X"
   git push origin main
   ```
3. Cloudflare Pages builderà e deploierà automaticamente in ~2 minuti

### Verifica build
- Vai su [Cloudflare Pages Dashboard](https://dash.cloudflare.com/?to=/:account/pages)
- Seleziona progetto → Tab **"Deployments"**
- Vedi log build in real-time

### Rollback rapido (30 secondi)
1. Vai su **"Deployments"**
2. Trova deploy precedente funzionante
3. Click **"···"** → **"Rollback to this deployment"**
4. Conferma

---

## 🧪 TESTING PRE-PRODUZIONE

### Preview Deployment (ogni commit)
Cloudflare crea URL preview per ogni branch/PR:
- Branch preview: `https://<branch>.rosicatore.pages.dev`
- PR preview: `https://<pr-number>.rosicatore.pages.dev`

### Test locale prima del deploy
```bash
cd /home/user/webapp
npm run build
npx wrangler pages dev dist
# Apri http://localhost:8788
```

---

## 📊 MONITORING & ANALYTICS

### Cloudflare Analytics (gratuito)
- Vai su Pages → rosicatore → **"Analytics"**
- Vedi: requests, bandwidth, cache hit rate, errors

### Real User Monitoring (RUM)
Cloudflare fornisce automaticamente:
- Page load time
- Core Web Vitals
- Geographic distribution

---

## 🚨 TROUBLESHOOTING

### Build fallisce
**Errore:** `npm install` fallisce
**Fix:** Verifica `package.json` dependencies, usa `npm ci` invece di `npm install`

### CSS/JS non si caricano
**Errore:** 404 su `/static/app.js`
**Fix:** Verifica che `public/static/` sia copiato in `dist/` dopo build

### Dominio custom non funziona
**Errore:** DNS_PROBE_FINISHED_NXDOMAIN
**Fix:** 
- Verifica nameserver su Register.it siano corretti
- Aspetta 24h per propagazione DNS
- Verifica su [DNS Checker](https://dnschecker.org/)

### Token GitHub scaduto
**Errore:** `fatal: Authentication failed`
**Fix:**
1. GitHub → Settings → Developer settings → Personal access tokens
2. Genera nuovo token con `repo` permissions
3. Aggiorna remote:
   ```bash
   git remote set-url origin https://TOKEN@github.com/DanteManonquello/rosicatore.git
   ```

### Cloudflare Access blocca te stesso
**Errore:** "Access Denied"
**Fix:**
1. Vai su Cloudflare Zero Trust → Access → Applications
2. Modifica policy, aggiungi tua email
3. Oppure disabilita temporaneamente Access

---

## 💰 COSTI

### ✅ Tutto GRATUITO con questi volumi:
- **Cloudflare Pages:** Unlimited requests (free tier)
- **Build minutes:** 500 min/mese gratuiti (1 build = ~2 min → 250 deploy/mese)
- **Bandwidth:** Unlimited
- **Cloudflare Access:** Free <50 utenti/mese
- **SSL Certificate:** Gratuito automatico
- **CDN:** Gratuito (300+ datacenter)

### Costo totale stimato:
- **Dominio Register.it:** €10-15/anno
- **Cloudflare (tutto):** €0/mese
- **TOTALE:** ~€12/anno (solo dominio)

---

## 📞 SUPPORTO

- [Cloudflare Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Community](https://community.cloudflare.com/)
- [Cloudflare Discord](https://discord.gg/cloudflaredev)

---

## ✅ CHECKLIST FINALE

Prima di deploy production:

- [ ] Codice committato su GitHub (`git status` clean)
- [ ] Build locale funziona (`npm run build` → success)
- [ ] robots.txt presente in `public/`
- [ ] noindex meta tag presente in HTML
- [ ] Cloudflare API token configurato (se usi CLI)
- [ ] GitHub repo connesso a Cloudflare Pages (se usi GitHub)
- [ ] Custom domain nameserver aggiornati (se usi dominio custom)
- [ ] Cloudflare Access configurato (se vuoi protezione email)
- [ ] Test su preview URL prima di mergiare su `main`

---

**Pronto per il deploy! 🚀**
