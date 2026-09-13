#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

ENV_FILE=".env.production"
COMPOSE_FILE="docker-compose.production.yml"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Fichier $ENV_FILE absent. Copiez .env.production.example puis renseignez les secrets."
  exit 1
fi

if grep -q "CHANGE_WITH_" "$ENV_FILE"; then
  echo "Le fichier $ENV_FILE contient encore des valeurs d'exemple."
  exit 1
fi

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config --quiet
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull db caddy
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build --remove-orphans
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps

echo "Vérification de l'application sur le port local 3000..."
for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error http://127.0.0.1:3000/api/health >/dev/null; then
    echo "Application prête sur le port 3000."
    exit 0
  fi
  sleep 2
done

echo "L'application n'est pas devenue saine. Consultez les logs Docker."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs --tail 100 app db
exit 1
