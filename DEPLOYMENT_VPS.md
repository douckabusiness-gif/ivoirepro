# Déploiement VPS de ivoireci.com

Cette procédure déploie PostgreSQL, Next.js sur le port interne `3000` et
Caddy sur les ports publics `80/443`. Les secrets restent exclusivement dans
`.env.production` sur le VPS.

## 1. Sécuriser le VPS

Créer un utilisateur de déploiement avec une clé SSH, puis désactiver la
connexion root par mot de passe après avoir vérifié la nouvelle connexion.

Activer le pare-feu :

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw enable
```

Le port `3000` ne doit pas être ouvert publiquement. Compose le lie uniquement
à `127.0.0.1` pour les diagnostics effectués depuis le VPS.

## 2. Installer le projet

```bash
mkdir -p /opt/ivoirepro
cd /opt/ivoirepro
git clone https://github.com/douckabusiness-gif/ivoirepro.git .
cp .env.production.example .env.production
chmod 600 .env.production
```

Renseigner toutes les valeurs `CHANGE_WITH_...`. Le mot de passe PostgreSQL
doit être identique dans `POSTGRES_PASSWORD` et dans `DATABASE_URL`.

Génération de secrets URL-safe :

```bash
openssl rand -hex 32
openssl rand -hex 48
```

## 3. Démarrer

```bash
bash scripts/deploy-production.sh
```

Contrôles locaux :

```bash
docker compose --env-file .env.production -f docker-compose.production.yml ps
curl -fsS http://127.0.0.1:3000/api/health
docker compose --env-file .env.production -f docker-compose.production.yml logs --tail 100
```

Le premier compte administrateur est créé lors de la première connexion avec
`ADMIN_DEFAULT_EMAIL` et `ADMIN_DEFAULT_PASSWORD`.

## 3 bis. Migrations Prisma et rapport quotidien

Le schéma est désormais versionné dans `prisma/migrations/`. Au démarrage, le conteneur `app`
exécute `prisma migrate deploy`. Si la base a été créée avant cette version (via `db push`),
le script de démarrage détecte l'erreur `P3005` et marque automatiquement la migration
initiale comme appliquée (baseline) — aucune action manuelle, aucune perte de données.

Pour toute évolution du schéma en développement : `npm run db:migrate -- --name ma_modification`,
puis committer le dossier généré dans `prisma/migrations/`.

Le rapport Telegram quotidien s'appelle depuis la crontab du VPS (le secret est celui de
`.env.production`) :

```bash
( crontab -l 2>/dev/null; echo '0 20 * * * curl -fsS -H "Authorization: Bearer '"$(grep ^CRON_SECRET= .env.production | cut -d'"' -f2)"'" https://ivoireci.com/api/cron/daily-report >/dev/null 2>&1' ) | crontab -
```

## 4. Cloudflare

Enregistrements attendus :

```text
A      @      <VPS_IP>        Proxied
CNAME  www    ivoireci.com    Proxied
```

Dans `SSL/TLS`, sélectionner `Full (strict)` après l'émission du certificat
Caddy. Activer `Always Use HTTPS`. Ne pas modifier les enregistrements MX,
DKIM, SPF et les autres enregistrements de messagerie.

## 5. Sauvegarde avant mise à jour

```bash
mkdir -p /opt/backups
docker compose --env-file .env.production -f docker-compose.production.yml exec -T db \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > \
  "/opt/backups/ivoirepro-$(date +%Y%m%d-%H%M%S).sql.gz"
```

Mise à jour :

```bash
git pull --ff-only
bash scripts/deploy-production.sh
```

Ne jamais exécuter `docker compose down -v` en production : l'option `-v`
supprime les volumes et donc la base PostgreSQL.

## 6. Rotation du mot de passe PostgreSQL

Le mot de passe PostgreSQL ne doit pas être modifié depuis l'interface web :
la rotation nécessite de mettre à jour le rôle PostgreSQL et l'URL de connexion
de l'application ensemble. Depuis le VPS, exécuter :

```bash
cd /opt/ivoirepro
bash scripts/rotate-db-password.sh
```

Le script crée d'abord une sauvegarde, change le mot de passe SCRAM, met à jour
`.env.production`, recrée uniquement le conteneur applicatif et vérifie
`http://127.0.0.1:3000/api/health`. Il ne supprime aucun volume Docker.
