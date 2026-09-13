# Boutique E-commerce

Application e-commerce Next.js 15 / React 19 avec PostgreSQL et Prisma. Le projet inclut une boutique client, une console administrateur, un espace partenaire et un portail livreur.

## Prérequis

- Node.js 20 ou plus récent
- npm
- PostgreSQL 16 (ou Docker Desktop)

## Installation locale

1. Installer les dépendances :

   ```bash
   npm install
   ```

2. Copier `.env.example` vers `.env.local`, puis adapter les valeurs. Pour une base PostgreSQL locale, la valeur par défaut utilise le port `5434` afin d'éviter le conflit avec une instance PostgreSQL sur `5432`.

3. Démarrer PostgreSQL, puis synchroniser le schéma et les données de démonstration :

   ```bash
   npm run db:push
   npm run db:seed
   ```

4. Lancer l'application :

   ```bash
   npm run dev
   ```

   Ouvrir ensuite [http://localhost:3000](http://localhost:3000). Le port `3000` est réservé à ce projet : si un autre processus l'utilise, arrêtez-le avant de lancer l'application.

## Mode démo local

Le mode démo est activé par défaut hors production (`ENABLE_DEMO_MODE=true`). Il permet de tester les espaces admin, client et partenaire sans créer de comptes réels depuis les écrans de connexion.

Le mode démo est automatiquement refusé lorsque `NODE_ENV=production` ou `ENABLE_DEMO_MODE=false`. Les cookies de compatibilité historiques sont également désactivés en production.

## Docker

Le fichier `docker-compose.yml` démarre PostgreSQL et l'application en mode production :

```bash
docker compose up --build
```

Avant le démarrage, définir une vraie clé :

```powershell
$env:JWT_SECRET = "une-valeur-longue-et-aleatoire"
docker compose up --build
```

Le conteneur applicatif écoute sur [http://localhost:3000](http://localhost:3000), le PostgreSQL Docker est exposé sur `localhost:5434`, et le mode démo y est volontairement désactivé.

## Variables importantes

| Variable | Usage |
| --- | --- |
| `DATABASE_URL` | URL PostgreSQL utilisée par Prisma |
| `JWT_SECRET` | Signature des sessions admin, client et partenaire |
| `ENABLE_DEMO_MODE` | Active ou désactive les connexions démo locales |
| `ADMIN_DEFAULT_EMAIL` / `ADMIN_DEFAULT_PASSWORD` | Compte admin initial créé à la première connexion |
| `APP_URL` | URL publique utilisée par les liens de l'application |
| `GEMINI_API_KEY` | Clé optionnelle pour les fonctions IA |

Les clés IA et les identifiants SMTP ne sont jamais renvoyés par l'API publique des paramètres. Ils sont réservés à une session admin réelle.

## Vérifications et maintenance

```bash
npm run lint
npx tsc --noEmit
npm run build
npm test
```

Les tests d'intégration qui utilisent la base locale et le serveur de démonstration peuvent être lancés ainsi :

```powershell
$env:RUN_INTEGRATION_TESTS = "true"
$env:TEST_BASE_URL = "http://localhost:3001"
npm test
```

Pour inspecter les données Prisma :

```bash
npx prisma studio
```

## Déploiement

La procédure VPS complète est documentée dans [DEPLOYMENT_VPS.md](./DEPLOYMENT_VPS.md). Elle utilise `docker-compose.production.yml`, conserve Next.js sur le port interne `3000`, ne publie pas PostgreSQL et fournit HTTPS via Caddy.

En production, ne jamais utiliser les valeurs secrètes d'exemple. Copier
`.env.production.example` vers `.env.production` uniquement sur le VPS, puis
lancer `bash scripts/deploy-production.sh`.
