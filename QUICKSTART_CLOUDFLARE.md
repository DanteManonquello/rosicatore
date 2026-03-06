# ⚡ QUICK START - CLOUDFLARE DEPLOYMENT

## 🎯 OBIETTIVO
Deployare Rosicatore v4.1.4 su Cloudflare Pages con dominio privato non indicizzabile.

---

## ✅ COSA È GIÀ PRONTO

- ✅ Sito 100% funzionante (v4.1.4)
- ✅ Tutti i CSV caricati (65,291 rows, 12 ticker)
- ✅ Portfolio calculations working
- ✅ SEO blocking attivo (robots.txt + noindex meta)
- ✅ Build configurato correttamente
- ✅ Git repository committato localmente

---

## 🚧 COSA SERVE ANCORA

### 1. GitHub Token (OPZIONALE - ma raccomandato)
**Problema:** Token attuale scaduto → push fallisce

**Soluzione (5 minuti):**
1. Vai su [GitHub Settings](https://github.com/settings/tokens)
2. Click **"Personal access tokens"** → **"Tokens (classic)"**
3. Click **"Generate new token (classic)"**
4. Seleziona:
   - Nome: `Rosicatore Deployment`
   - Scadenza: `90 days` (o custom)
   - Permessi: `✓ repo` (full control)
5. Click **"Generate token"**
6. **COPIA IL TOKEN** (lo vedi solo una volta!)

**Aggiorna remote:**
```bash
cd /home/user/webapp
git remote set-url origin https://NUOVO_TOKEN@github.com/DanteManonquello/rosicatore.git
git push origin main
```

**Verifica:**
```bash
git push origin main
# Dovrebbe dire: "Everything up-to-date" o pushare i commit
```

---

### 2. Cloudflare API Key (NECESSARIO)
**Problema:** Nessun API key configurato → deploy fallisce

**Soluzione (5 minuti):**

**A. Ottieni API Token da Cloudflare**
1. Vai su [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Login (o registrati se nuovo)
3. Click su tuo profilo (in alto a destra) → **"My Profile"**
4. Tab **"API Tokens"**
5. Click **"Create Token"**
6. Usa template **"Edit Cloudflare Workers"** → **"Use template"**
7. **OPPURE** crea custom con permessi:
   ```
   - Account → Cloudflare Pages → Edit
   - Account → Account Settings → Read
   - Zone → Zone → Read (opzionale, per custom domain)
   ```
8. Click **"Continue to summary"** → **"Create Token"**
9. **COPIA IL TOKEN** (lo vedi solo una volta!)

**B. Configura API Key nel Sandbox**
1. Vai su tab **"Deploy"** nella sidebar
2. Incolla API token
3. Click **"Save"**
4. Torna qui e esegui:
   ```bash
   # Verifica setup
   cd /home/user/webapp
   npx wrangler whoami
   # Dovrebbe mostrare email Cloudflare
   ```

---

## 🚀 DEPLOYMENT (3 METODI)

### METODO 1: GitHub Integration (RACCOMANDATO)
**Tempo:** ~5 minuti | **Aggiornamenti automatici:** ✅ | **Rollback facile:** ✅

**Prerequisites:** GitHub token aggiornato (step 1 sopra)

**Steps:**
1. **Push su GitHub:**
   ```bash
   cd /home/user/webapp
   git push origin main
   ```

2. **Connetti Cloudflare Pages:**
   - Vai su [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
   - Click **"Create a project"**
   - Click **"Connect to Git"**
   - Autorizza GitHub (prima volta)
   - Seleziona repository **"rosicatore"**

3. **Configura Build:**
   ```
   Project name: rosicatore
   Production branch: main
   Build command: npm run build
   Build output directory: dist
   Environment variables: (lascia vuoto)
   ```

4. **Deploy:**
   - Click **"Save and Deploy"**
   - Aspetta ~2 minuti
   - URL production: `https://rosicatore.pages.dev`

**Aggiornamenti futuri:**
```bash
# Modifica codice → commit → push
git add .
git commit -m "Update feature X"
git push origin main
# Cloudflare rebuilda automaticamente in ~2 min
```

---

### METODO 2: CLI Deploy Manuale
**Tempo:** ~10 minuti | **Aggiornamenti automatici:** ❌ | **Rollback:** manuale

**Prerequisites:** Cloudflare API key configurato (step 2 sopra)

**Steps:**

1. **Build locale:**
   ```bash
   cd /home/user/webapp
   npm run build
   ```

2. **Login Wrangler:**
   ```bash
   npx wrangler login
   # Apre browser per autenticare
   ```

3. **Crea progetto Pages:**
   ```bash
   npx wrangler pages project create rosicatore \
     --production-branch main \
     --compatibility-date 2024-01-01
   ```

4. **Deploy:**
   ```bash
   npx wrangler pages deploy dist --project-name rosicatore
   ```

5. **Verifica:**
   - Production: `https://rosicatore.pages.dev`
   - Ogni branch: `https://BRANCH.rosicatore.pages.dev`

**Aggiornamenti futuri:**
```bash
# Modifica codice → build → deploy
npm run build
npx wrangler pages deploy dist --project-name rosicatore
```

---

### METODO 3: Drag & Drop Web UI
**Tempo:** ~5 minuti | **Aggiornamenti automatici:** ❌ | **Per test veloci**

**Steps:**
1. Build locale:
   ```bash
   cd /home/user/webapp
   npm run build
   ```

2. Vai su [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)

3. Click **"Upload assets"**

4. Drag & drop cartella `dist/` sulla pagina

5. Nome progetto: `rosicatore`

6. Click **"Deploy"**

**⚠️ Limitazioni:**
- Deploy solo manuale (no auto-rebuild)
- No Git integration
- No preview deployments
- Serve re-upload manuale per ogni update

---

## 🌐 DOMINIO CUSTOM (OPZIONALE)

**Tempo:** ~15 minuti + propagazione DNS (1-24h)

### Step 1: Aggiungi Dominio a Cloudflare
1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **"Add site"**
2. Inserisci: `tuodominio.it`
3. Piano: **Free**
4. Cloudflare mostrerà 2 nameserver (es: `ns1.cloudflare.com`, `ns2.cloudflare.com`)

### Step 2: Aggiorna Nameserver su Register.it
1. [Login Register.it](https://www.register.it/)
2. **"I miei domini"** → seleziona dominio
3. **"Gestione DNS"** → **"Modifica nameserver"**
4. Sostituisci con nameserver Cloudflare
5. Salva

**⏳ Attesa propagazione:** 1-24h (solitamente 1-2h)

**Verifica:** [DNS Checker](https://dnschecker.org/) → inserisci dominio → controlla nameserver

### Step 3: Connetti Dominio a Pages
1. [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Progetto **"rosicatore"** → Tab **"Custom domains"**
3. **"Set up a custom domain"**
4. Inserisci: `tuodominio.it` (o `www.tuodominio.it`)
5. Cloudflare crea DNS record automaticamente
6. **SSL attivo in ~5 minuti**

**Risultato:**
- ✅ `https://tuodominio.it` → tuo sito
- ✅ SSL gratuito automatico
- ✅ CDN globale (300+ datacenter)

---

## 🔒 PROTEZIONE SEO (GIÀ IMPLEMENTATO ✅)

### Attuale (già nel codice):
- ✅ `robots.txt` → blocca tutti i bot crawler
- ✅ `<meta name="robots" content="noindex, nofollow">` → impedisce indicizzazione

### Verifica:
```bash
curl https://rosicatore.pages.dev/robots.txt
# Dovrebbe mostrare:
# User-agent: *
# Disallow: /
```

### Protezione Extra (opzionale): Cloudflare Access
**FREE <50 utenti/mese** - Login con email

**Setup (5 minuti):**
1. [Cloudflare Zero Trust](https://one.dash.cloudflare.com/)
2. **"Access"** → **"Applications"** → **"Add application"**
3. Tipo: **"Self-hosted"**
4. Config:
   ```
   Application name: Rosicatore
   Session Duration: 24 hours
   Application domain: rosicatore.pages.dev
   ```
5. Policy:
   ```
   Policy name: Email Whitelist
   Action: Allow
   Include → Emails: tua-email@example.com
   ```
6. Save

**Risultato:**
- ✅ Solo email autorizzate accedono
- ✅ Login OTP via email
- ✅ Google bot bloccato automaticamente
- ✅ Log accessi disponibili

---

## 🧪 TESTING POST-DEPLOY

### 1. Verifica Deployment
```bash
# Test health endpoint
curl https://rosicatore.pages.dev/api/health
# Risposta attesa: {"status":"ok","version":"4.1.4"}

# Test homepage
curl -I https://rosicatore.pages.dev
# HTTP/2 200 OK

# Test robots.txt
curl https://rosicatore.pages.dev/robots.txt
# User-agent: *
# Disallow: /
```

### 2. Test Funzionalità
- [ ] Homepage carica correttamente
- [ ] CSV auto-loaded (12/12 ticker)
- [ ] Date range picker funzionante
- [ ] Calcolo portafoglio funzionante
- [ ] Export JSON/CSV funzionante
- [ ] Sidebar menu funzionante

### 3. Test SEO Blocking
- [ ] `robots.txt` accessibile e corretto
- [ ] Meta tag `noindex` presente nell'HTML
- [ ] Google Search Console non trova il sito (dopo 1-2 giorni)

---

## 📊 MONITORING

### Cloudflare Analytics (gratuito)
- Vai su Pages → rosicatore → **"Analytics"**
- Vedi: requests, bandwidth, cache hit rate, errors

### Log Build
- Tab **"Deployments"** → seleziona deploy → **"View build log"**

### Rollback
- Tab **"Deployments"** → deploy precedente → **"···"** → **"Rollback"**

---

## 🐛 TROUBLESHOOTING

### GitHub Push Fallisce
**Errore:** `fatal: Authentication failed`
```bash
# Genera nuovo token → aggiorna remote
git remote set-url origin https://NUOVO_TOKEN@github.com/DanteManonquello/rosicatore.git
```

### Wrangler Login Fallisce
**Errore:** `Not authenticated`
```bash
# 1. Vai su Deploy tab → configura API key
# 2. Oppure usa browser auth
npx wrangler login
```

### Build Fallisce su Cloudflare
**Errore:** `npm install failed`
- Verifica `package.json` non ha syntax errors
- Usa `npm ci` invece di `npm install` nelle build settings

### CSS/JS non si caricano
**Errore:** 404 su `/static/app.js`
- Verifica build: `npm run build` → controlla `dist/` contiene `_worker.js` e `_routes.json`
- Verifica `public/static/` sia copiato in build

### Dominio custom non funziona
**Errore:** DNS_PROBE_FINISHED_NXDOMAIN
- Verifica nameserver su Register.it siano Cloudflare
- Aspetta 24h propagazione
- Test: [DNS Checker](https://dnschecker.org/)

---

## 💰 COSTI FINALI

**Cloudflare (tutto gratuito):**
- ✅ Pages hosting: Unlimited requests
- ✅ Build minutes: 500 min/mese (≈250 deploys)
- ✅ Bandwidth: Unlimited
- ✅ SSL Certificate: Gratuito automatico
- ✅ CDN: 300+ datacenter
- ✅ Access: Free <50 utenti

**Dominio Register.it:**
- €10-15/anno (.it domain)

**TOTALE: ~€12/anno** (solo dominio)

---

## 🎯 PROSSIMI STEP IMMEDIATI

1. **GitHub Token:**
   - [ ] Genera nuovo token su GitHub
   - [ ] Aggiorna remote locale
   - [ ] Push su GitHub

2. **Cloudflare API:**
   - [ ] Vai su Deploy tab
   - [ ] Configura API key
   - [ ] Verifica `wrangler whoami`

3. **Deploy:**
   - [ ] Scegli metodo (GitHub integration raccomandato)
   - [ ] Segui steps sopra
   - [ ] Verifica deployment funzionante

4. **Dominio Custom (opzionale):**
   - [ ] Aggiungi sito su Cloudflare
   - [ ] Cambia nameserver Register.it
   - [ ] Collega dominio a Pages
   - [ ] Aspetta propagazione DNS

5. **Test Finale:**
   - [ ] Homepage funzionante
   - [ ] Calcoli portafoglio OK
   - [ ] robots.txt corretto
   - [ ] SSL attivo

---

## 📞 LINK UTILI

**Sito Live (sandbox):**
https://3000-inhuz3ki84jfyb92lkc7q-2b54fc91.sandbox.novita.ai

**Download Progetto:**
https://www.genspark.ai/api/files/s/r10XxnpY

**GitHub Repository:**
https://github.com/DanteManonquello/rosicatore

**Cloudflare Dashboard:**
https://dash.cloudflare.com

**Cloudflare Pages:**
https://dash.cloudflare.com/?to=/:account/pages

**Cloudflare Zero Trust (Access):**
https://one.dash.cloudflare.com/

**GitHub Settings (Tokens):**
https://github.com/settings/tokens

**Register.it:**
https://www.register.it/

---

**🚀 Pronto per il deploy!**

**Tempo stimato totale:** 15-30 minuti (senza propagazione DNS)
