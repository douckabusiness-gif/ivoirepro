#!/usr/bin/env bash
set -Eeuo pipefail

# Rotate the production PostgreSQL password without deleting the database volume.
# Run this script on the VPS as root from /opt/ivoirepro.

PROJECT_DIR="${PROJECT_DIR:-/opt/ivoirepro}"
ENV_FILE="$PROJECT_DIR/.env.production"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.production.yml"
BACKUP_DIR="${BACKUP_DIR:-/opt/backups}"
TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
ENV_BACKUP="$BACKUP_DIR/ivoirepro-env-before-db-rotation-$TIMESTAMP"
DB_BACKUP="$BACKUP_DIR/ivoirepro-$TIMESTAMP.sql.gz"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Ce script doit être exécuté en root sur le VPS." >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" || ! -f "$COMPOSE_FILE" ]]; then
  echo "Projet de production introuvable dans $PROJECT_DIR." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
chmod 600 "$ENV_FILE"

read_env_value() {
  local key="$1"
  sed -n "s/^${key}=//p" "$ENV_FILE" | head -n 1 | sed -e 's/^"//' -e 's/"$//'
}

POSTGRES_USER="$(read_env_value POSTGRES_USER)"
POSTGRES_DB="$(read_env_value POSTGRES_DB)"
OLD_PASSWORD="$(read_env_value POSTGRES_PASSWORD)"

if [[ -z "$POSTGRES_USER" || -z "$POSTGRES_DB" || -z "$OLD_PASSWORD" ]]; then
  echo "POSTGRES_USER, POSTGRES_DB ou POSTGRES_PASSWORD est absent." >&2
  exit 1
fi

if [[ ! "$POSTGRES_USER" =~ ^[A-Za-z0-9_]+$ || ! "$POSTGRES_DB" =~ ^[A-Za-z0-9_]+$ ]]; then
  echo "Le nom PostgreSQL contient des caractères non pris en charge par cette procédure." >&2
  exit 1
fi

NEW_PASSWORD="$(openssl rand -hex 32)"
TEMP_ENV="$(mktemp "${ENV_FILE}.XXXXXX")"

cleanup() {
  rm -f "$TEMP_ENV"
}
trap cleanup EXIT

echo "Sauvegarde PostgreSQL en cours..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T db \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" | gzip > "$DB_BACKUP"
chmod 600 "$DB_BACKUP"
if [[ ! -s "$DB_BACKUP" ]]; then
  echo "La sauvegarde PostgreSQL est vide; rotation annulée." >&2
  exit 1
fi

cp -p "$ENV_FILE" "$ENV_BACKUP"

echo "Rotation du mot de passe PostgreSQL..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T db \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "ALTER ROLE \"$POSTGRES_USER\" PASSWORD '$NEW_PASSWORD';" >/dev/null

# Keep the password in the environment only while generating the protected file.
ROTATED_DB_PASSWORD="$NEW_PASSWORD" \
ROTATED_DB_USER="$POSTGRES_USER" \
ROTATED_DB_NAME="$POSTGRES_DB" \
awk '
  BEGIN {
    password = ENVIRON["ROTATED_DB_PASSWORD"]
    user = ENVIRON["ROTATED_DB_USER"]
    database = ENVIRON["ROTATED_DB_NAME"]
  }
  /^POSTGRES_PASSWORD=/ {
    print "POSTGRES_PASSWORD=\"" password "\""
    next
  }
  /^DATABASE_URL=/ {
    print "DATABASE_URL=\"postgresql://" user ":" password "@db:5432/" database "?schema=public\""
    next
  }
  { print }
' "$ENV_FILE" > "$TEMP_ENV"
chmod 600 "$TEMP_ENV"
mv "$TEMP_ENV" "$ENV_FILE"

if ! docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config --quiet; then
  echo "La nouvelle configuration est invalide; restauration en cours." >&2
  cp -p "$ENV_BACKUP" "$ENV_FILE"
  docker compose --env-file "$ENV_BACKUP" -f "$COMPOSE_FILE" exec -T db \
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -c "ALTER ROLE \"$POSTGRES_USER\" PASSWORD '$OLD_PASSWORD';" >/dev/null || true
  exit 1
fi

echo "Redémarrage de l'application..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --force-recreate app

for attempt in $(seq 1 30); do
  if curl --fail --silent http://127.0.0.1:3000/api/health >/dev/null; then
    echo "Rotation terminée. Sauvegarde: $DB_BACKUP"
    echo "Le nouveau secret est enregistré uniquement dans $ENV_FILE."
    exit 0
  fi
  sleep 2
done

echo "L'application ne répond pas après la rotation; restauration du secret précédent." >&2
cp -p "$ENV_BACKUP" "$ENV_FILE"
docker compose --env-file "$ENV_BACKUP" -f "$COMPOSE_FILE" exec -T db \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "ALTER ROLE \"$POSTGRES_USER\" PASSWORD '$OLD_PASSWORD';" >/dev/null || true
docker compose --env-file "$ENV_BACKUP" -f "$COMPOSE_FILE" up -d --force-recreate app || true
exit 1
