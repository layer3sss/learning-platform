# 📚 Handleiding — DevOps Learning OS

> **De volledige gebruikershandleiding voor de DevOps Learning OS.**
> Dit document is geschreven vanuit het perspectief van de gebruiker: hoe start je de app, hoe doorloop je de leerworkflow, en wat doet elk scherm?

---

## Inhoudsopgave

1. [Wat is de Learning OS?](#1-wat-is-de-learning-os)
2. [De leerfilosofie](#2-de-leerfilosofie)
3. [Installatie & opstarten](#3-installatie--opstarten)
4. [Inloggen & accounts](#4-inloggen--accounts)
5. [Een rondje door de interface](#5-een-rondje-door-de-interface)
6. [De leerworkflow stap voor stap](#6-de-leerworkflow-stap-voor-stap)
7. [De roadmap: Level 0 tot en met 13](#7-de-roadmap-level-0-tot-en-met-13)
8. [Skills-matrix (niveaus 0–5)](#8-skills-matrix-niveaus-05)
9. [Journal & Evidence](#9-journal--evidence)
10. [Admin-view](#10-admin-view)
11. [Problemen oplossen (FAQ)](#11-problemen-oplossen-faq)
12. [Documentatie-index](#12-documentatie-index)

---

## 1. Wat is de Learning OS?

De **DevOps Learning OS** is een persoonlijk leercockpit voor het leren van DevOps door te **bouwen** in plaats van door theorie te lezen. Het is een multi-user webapplicatie (React-frontend + Node.js/Express-backend) die permanent bijhoudt:

- **Waar je bent** in het curriculum (Level 0–13)
- **Welke missie/taak je nu moet doen**
- **Welke vaardigheden je hebt aangetoond** (skills 0–5)
- **Welke beoordelingen je AI-leraar heeft gegeven** (assessments)
- **Bewijsstukken van je werk** (evidence) en **eigen notities** (journal)

### Belangrijkste ontwerpbeginsel

> **De Learning OS is de permanente "source of truth" voor je leerstatus. De AI-leraar is extern en uitwisselbaar.**

De app bevat **geen AI via een API-key**. In plaats daarvan genereert de app een gestructureerde contexttekst (Markdown) die je zelf kopieert naar ChatGPT, Claude, Gemini, of een lokaal model (bijv. Ollama). De externe AI fungeert als leermeester: die geeft hints, wijst missies toe, en beoordeelt je werk. Jij importeert die beoordeling terug in de Learning OS, waar je skills en voortgang permanent worden bijgewerkt.

**Voordelen van deze aanpak:**

- Geen API-kosten, geen API-keys, geen vendor lock-in
- Wissel dagelijks van AI-model (vandaag ChatGPT, morgen Claude, overmorgen een lokaal model)
- Je leerhistorie blijft van jou, niet van een commercieel platform

---

## 2. De leerfilosofie: Learn by Building

Het hele curriculum is opgebouwd rond actief probleemoplossend leren:

```
MISSION → BUILD → BREAK → TROUBLESHOOT → AI HINTS (indien vastgelopen) → ASSESS → RECORD → ADVANCE
```

| Stap | Betekenis |
|---|---|
| **MISSION** | Je krijgt een concrete taak: configureer een server, schrijf een Dockerfile, deploy een pod... |
| **BUILD** | Je bouwt het in je eigen lab (terminal, VM, Docker, k3s-cluster) |
| **BREAK** | Je experimenteert, breekt dingen kapot en leert waarom het stuk ging |
| **TROUBLESHOOT** | Je debugt zelf eerst, met terminal-commando's en logs |
| **AI HINTS** | Alleen als je écht vastloopt: kopieer je AI-context naar de AI-leraar en vraag om hints (geen oplossingen) |
| **ASSESS** | De externe AI beoordeelt je werk op basis van de instructies in de context |
| **RECORD** | Je registreert de beoordeling in de Learning OS (Assessments) |
| **ADVANCE** | Je skills en roadmap-positie worden bijgewerkt; de volgende missie wordt actief |

---

## 3. Installatie & opstarten

### 3.1 Vereisten

- Node.js (aanbevolen 20+; de app is getest op Node 22)
- npm
- (Optioneel) Docker & Docker Compose
- (Optioneel) Een Kubernetes-cluster (k3s/MicroK8s) voor de productie-variant

### 3.2 Lokaal starten (snelste manier)

```bash
# 1. Clone de repository
git clone https://github.com/yourorg/devops-learning-os.git
cd devops-learning-os

# 2. Installeer dependencies
npm install

# 3. (Optioneel) Configureer de omgeving
cp .env.example .env
```

Daarna starten:

```bash
npm run dev
```

Open daarna je browser op **http://localhost:3000**.

> **Geen database nodig!** Zonder `DATABASE_URL` draait de app met een **in-memory store**: dezelfde functionaliteit, maar data wordt gewist bij een herstart. Ideaal om te proberen.
>
> **Met database:** zet `DATABASE_URL` in `.env` naar een PostgreSQL-connectiestring, bijvoorbeeld `postgresql://postgres:postgres@localhost:5432/learning_os?schema=public`. De tabellen worden automatisch aangemaakt bij de eerste start — geen migratiestap nodig.

### 3.3 Docker Compose

Start de app samen met een eigen PostgreSQL 16-database:

```bash
docker compose up -d --build
```

Daarna beschikbaar op http://localhost:3000. Zie [docs/docker.md](docs/docker.md) voor details.

### 3.4 Kubernetes (k3s / MicroK8s)

```bash
# Eenmalig: eerst het echte secret aanmaken (k8s/secret.yaml is git-ignored)
cp k8s/secret.example.yaml k8s/secret.yaml   # vul echte waarden in
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/learning-os.yaml
```

Zie [docs/kubernetes.md](docs/kubernetes.md) en [docs/deployment.md](docs/deployment.md).

### 3.5 Belangrijke omgevingsvariabelen

| Variabele | Betekenis | Standaard |
|---|---|---|
| `PORT` | HTTP-poort van de server | `3000` |
| `AUTH_SECRET` | JWT-ondertekeningssleutel. Genereer met `openssl rand -hex 32` | demo-waarde |
| `DATABASE_URL` | PostgreSQL-connectiestring (Prisma). **Leeg = in-memory modus** | niet gezet |

---

## 4. Inloggen & accounts

### 4.1 Demo-accounts (voorgeconfigureerd)

Bij het opstarten zijn er twee seed-accounts aanwezig:

| Account | E-mail | Wachtwoord | Rol |
|---|---|---|---|
| **DevOps Learner** | `learner@devops-os.local` | `devops123` | `USER` |
| **Curriculum Administrator** | `admin@devops-os.local` | `devops123` | `ADMIN` |

**Let op:** de app logt je standaard automatisch in als de demo-learner bij het openen in de browser. Wil je een eigen account, gebruik dan de **Sign In / Create Account**-modal (rechtsboven in de header) en klik op "Create Account".

### 4.2 Registreren van een nieuw account

1. Klik rechtsboven op **Sign In / Register**
2. Kies het tabblad **Create Account**
3. Vul naam, e-mail en wachtwoord in
4. Kies een rol: **Learner** of **Curriculum Admin**
5. Klik **Create Account**

Je wordt direct ingelogd en je eigen, volledig geïsoleerde leeromgeving wordt aangemaakt. Gebruikers A en B zien nooit elkaars data: elke tabel in de database heeft een directe `userId`-koppeling.

### 4.3 Snel wisselen tussen Learner en Admin

In de header zit een knop **"Switch to Learner/Admin"** — hiermee wissel je met één klik tussen de twee demo-rollen (handig voor testen en demonstreren).

### 4.4 Uitloggen

Klik op het uitlog-icoon rechtsboven. Je token wordt uit de browser verwijderd en de inlogmodal verschijnt weer. De JWT wordt in `localStorage` opgeslagen onder de sleutel `devops_learning_os_jwt`.

---

## 5. Een rondje door de interface

De app bestaat uit een **header**, **sidebar** en een **hoofdpaneel**. In de sidebar vind je alle navigatie:

| Menu-item | Wat je daar doet |
|---|---|
| **Dashboard** | Je missie-cockpit: huidige missie, voortgang, skills, recente assessments |
| **Roadmap** | Het volledige curriculum (Level 0–13) met projects en tasks |
| **Projects** | Zelfde pagina als Roadmap (direct de projects-weergave) |
| **Tasks** | Zelfde pagina als Roadmap (direct de tasks-weergave) |
| **Skills** | De vaardighedenmatrix (niveaus 0–5) |
| **Assessments** | Beoordelingen van je externe AI-leraar registreren en inzien |
| **Journal** | Eigen notities over wat brak en wat je leerde |
| **Evidence** | Bewijsstukken: GitHub-repo's, commits, URL's |
| **AI Context** ⭐ | De kern van de methode: genereer en kopieer je AI-prompt |
| **Settings** | Je profielgegevens en leerfilosofie |
| **Admin** | Gebruikersbeheer (alleen voor ADMIN-rol) |

### 5.1 Header

- **Links:** logo + "Permanent Learning Source of Truth", en een "breadcrumb" met je huidige Level / Project / Task
- **Rechts:** de snelle **Copy AI Context**-knop, **Switch to Learner/Admin**, je gebruikersbadge en **Logout**

### 5.2 Sidebar-onderaan

Een klein vakje met de leerfilosofie samengevat: *"Build, break, troubleshoot, record."*

---

## 6. De leerworkflow stap voor stap

Dit is de kern van de handleiding: de dagelijkse cyclus.

### Stap 1 — Bekijk je huidige missie (Dashboard)

Open de app. Op het **Dashboard** zie je bovenin het blok **ACTIVE MISSION**:

- Het **level** en de **projecttitel** waar je in zit
- De **huidige taak** met een statusbadge: `TODO`, `IN PROGRESS`, `COMPLETED`, `BLOCKED` of `NEEDS PRACTICE`
- Het **leerdoel (Learning Objective)** van de taak
- De **volgende aanbevolen taak** (Next Recommended Task)

Wijzig de taakstatus direct vanaf het dashboard met de knoppen **In Progress**, **Completed** of **Blocked**.

### Stap 2 — Voer de missie uit in je eigen lab

De missie-omschrijving verwijst naar echte, handmatige werkzaamheden: configureer je workstation, zet een Nginx op, schrijf een multi-stage Dockerfile, deploy naar k3s, etc. Je doet dit in je **eigen omgeving** — de app is de administratie, niet de uitvoeringsomgeving.

**Lukt het niet meer? Vraag de AI-leraar om hints (geen oplossingen!).**

### Stap 3 — Genereer en kopieer je AI-context

Klik op **Copy AI Context** (dashboard, roadmap of in de header) om naar de **AI Context**-pagina te gaan.

1. Klik op **Copy AI Context** → de gestructureerde Markdown-context staat op je klembord
2. Open ChatGPT, Claude, Gemini of je lokale model in de browser
3. Plak de context en begin het gesprek

**Wat bevat de context?** Je exacte roadmap-positie (level/project/taak), je geverifieerde skill-niveaus, je leerhistorie, recente fouten uit je journal, en instructies aan de AI om als mentor op te treden die **hints geeft in plaats van oplossingen**.

> 💡 De pagina toont ook de 3-stappen-gids: **1. Copy Context → 2. Paste into External AI → 3. Record Assessment**

### Stap 4 — Leer met de AI en laat je beoordelen

Werk in je lab met de AI als mentor. Als je taak af is, vraag je de AI om een **gestructureerde beoordeling**: een status (PASSED/PARTIAL/FAILED), een samenvatting, sterke punten, verbeterpunten en een aanbevolen volgende taak.

### Stap 5 — Registreer de beoordeling (Assessments)

Ga naar **Assessments** en klik op **Record New Assessment**:

| Veld | Uitleg |
|---|---|
| **Task Name / Focus** | Welke taak is beoordeeld? |
| **Assessment Status** | `PASSED` (volledig aangetoond), `PARTIAL` (werkt, maar hiaten), `FAILED` (grote defecten) |
| **AI Teacher Model** | Welke AI heeft beoordeeld? (bijv. "Claude 3.5 Sonnet") |
| **Summary of Evaluation** | Verplicht: korte samenvatting van de beoordeling |
| **Strengths Demonstrated** | Komma-gescheiden lijst sterke punten |
| **Concepts to Practice** | Komma-gescheiden lijst verbeterpunten |
| **Recommended Next Task** | Wat de AI aanraadt als volgende taak |
| **Raw Assessment Feedback** | Optioneel: plak de volledige AI-tekst als archief |

Na het opslaan wordt je **Dashboard, Skills en Roadmap automatisch bijgewerkt**.

### Stap 6 — Werk je skills bij (Skills)

Ga naar **Skills** en zet per vaardigheid je niveau (0–5) op basis van de beoordeling. De app doet geen magie: jij bepaalt zelf, met de AI-beoordeling als leidraad.

### Stap 7 — Documenteer (Journal & Evidence)

- **Journal:** noteer wat brak, welk commando de hoofdoorzaak vond, en wat je leerde. Deze notities worden meegeleverd in de AI-context van je volgende sessie, zodat de AI-leraar je geschiedenis kent.
- **Evidence:** link je GitHub-repo's, commit-URL's en andere bewijzen aan je voortgang.

### Stap 8 — Ga verder (Advance)

Als je de huidige taak afrondt (status `COMPLETED`), schuift de leerstaat automatisch door naar de volgende taak. Het Dashboard toont dan je nieuwe missie. Kom je erachter dat je iets nog niet beheerst? Zet de taak op `BLOCKED` of `NEEDS PRACTICE` en herhaal de cyclus.

---

## 7. De roadmap: Level 0 tot en met 13

Het curriculum bestaat uit 14 levels, elk met projects en concrete tasks. Je ziet per project een voortgangspercentage en per taak een moeilijkheidsgraad.

| Level | Naam | Focus |
|---|---|---|
| **L0** | DevOps Lab | Terminal, Git, SSH, workstation-setup |
| **L1** | Linux Server | Gebruikers, systemd, firewall |
| **L2** | Web Application | Nginx, DNS, TLS |
| **L3** | Containers | Dockerfiles, Compose |
| **L4** | CI/CD | GitHub Actions, GHCR |
| **L5** | Kubernetes | Deployments, Services, PVCs |
| **L6** | Kubernetes Troubleshooting | Pods debuggen, netwerk- en storageproblemen |
| **L7** | Terraform & Infrastructure as Code | Infrastructuur als code |
| **L8** | Ansible & Configuration Management | Playbooks, idempotentie |
| **L9** | Monitoring & Observability | Prometheus, Grafana |
| **L10** | Security & DevSecOps | RBAC, NetworkPolicies |
| **L11** | GitOps & Continuous Delivery | Argo CD, declaratieve deploys |
| **L12** | Platform Engineering | Ingress, TLS, quota's, backups |
| **L13** | Capstone: Run It Like Production | Volledige productielevenscyclus |

> De tabel hierboven is een overzicht; de volledige, actuele inhoud (met alle projects en tasks) staat in de app zelf onder **Roadmap**.

---

## 8. Skills-matrix (niveaus 0–5)

Elke vaardigheid wordt beoordeeld op een schaal van 0 tot 5:

| Niveau | Betekenis |
|---|---|
| 0 | Niet geïntroduceerd |
| 1 | Basale concepten |
| 2 | Met begeleiding |
| 3 | Zelfstandig |
| 4 | Troubleshoot problemen zelfstandig |
| 5 | Productie-architect |

Ga naar **Skills**, vind de vaardigheid en klik op het gewenste niveau (knoppen 0–5). Je niveaus verschijnen ook als balken op het Dashboard ("Demonstrated Skills").

De skills zijn ingedeeld in categorieën. Niveaus horen gebaseerd te zijn op **geverifieerde assessments**, niet op onderbuikgevoel.

---

## 9. Journal & Evidence

### 9.1 Journal

Het **Journal** is je persoonlijke leerlogboek. Voor elke sessie noteer je:

1. **Titel** — bijv. "Diagnosing Nginx 502 Bad Gateway with netstat"
2. **Discovery / Experience Notes** — wat heb je gebouwd, wat brak er, welk commando vond de oorzaak?
3. **Tags** — komma-gescheiden, bijv. `linux, nginx, troubleshooting, systemd`

Deze notities worden automatisch in de AI-context opgenomen, zodat je externe AI-leraar je recente fouten en inzichten kent.

### 9.2 Evidence

Evidence zijn je **bewijsstukken** (proof of work): wat bewijst dat je de taak echt hebt gedaan?

- **Titel** (verplicht)
- **Description**
- **GitHub Repository URL**
- **Commit URL / Hash**

Evidence-items worden met klikbare links naar de repository en de commit getoond, met datum.

---

## 10. Admin-view (alleen ADMIN-rol)

De **Admin**-view verschijnt alleen voor gebruikers met de rol `ADMIN`:

- **Registered Users** — aantal en lijst van alle geregistreerde gebruikers
- **Curriculum Levels** — 14 levels (0–13) geïnitialiseerd
- **Schema Status** — Prisma/PostgreSQL-schemastatus
- **Users & Learning Instances** — lijst met alle gebruikers, rollen en aanmaakdatums

> De admin kan gebruikers bekijken; het curriculum zelf is statische inhoud in de seed-data van de server (`src/server/seedData.ts`).

---

## 11. Problemen oplossen (FAQ)

**Q: Ik zie geen data / alles is leeg.**
Waarschijnlijk draai je in **in-memory modus** (geen `DATABASE_URL`). Data wordt gewist bij herstart. Wil je persistentie, configureer dan PostgreSQL (zie §3).

**Q: De app start niet / "Booting DevOps Learning OS Environment..." blijft hangen.**
Controleer de serverlogs. Bij gebruik van PostgreSQL: de server wacht tot de database beschikbaar is (retry-loop, ±30 s). Is de database niet bereikbaar, dan start de app niet.

**Q: Ik wil niet automatisch als demo-learner ingelogd worden.**
Log uit en gebruik **Sign In / Create Account** om een eigen account te registreren. De auto-login gebeurt alleen als er geen bestaande sessie is.

**Q: Kan ik de app laten praten met een AI via een API?**
Nee, dat is bewust niet ingebouwd. Het is een ontwerpbeginsel: **Zero AI API Integration**. Je kopieert de context handmatig naar een AI in je browser. Zie §1.

**Q: Hoe zit het met wachtwoorden en beveiliging?**
Wachtwoorden worden met **bcrypt** gezouten en gehasht; sessies via **JWT**. Elke gebruiker heeft strikt geïsoleerde data. Vergeet niet `AUTH_SECRET` te veranderen in productie.

**Q: Hoe test ik dat alles werkt?**
Start de server en draai:

```bash
npm run test:smoke
```

Dit is een API-testsuite met 70+ checks, werkend in beide opslagmodi. Met `--dirty` sla je assertions over die een verse store vereisen.

---

## 12. Documentatie-index

Diepere technische documentatie vind je hier:

- [README.md](README.md) — Projectoverzicht en quick start
- [docs/architecture.md](docs/architecture.md) — Architectuur & ontwerpbeginselen
- [docs/database.md](docs/database.md) — Databaseschema & Prisma-gids
- [docs/development.md](docs/development.md) — Lokale ontwikkeling
- [docs/docker.md](docs/docker.md) — Docker & containergids
- [docs/kubernetes.md](docs/kubernetes.md) — Kubernetes & k3s-deployment
- [docs/deployment.md](docs/deployment.md) — Productie-deployment

---

*Deze handleiding is gegenereerd op basis van de codebase per september 2026. Bij grote UI-wijzigingen kan de handleiding bijgewerkt moeten worden.*
