#!/bin/sh
# Démarrage du conteneur applicatif : applique les migrations Prisma puis lance Next.js.
#
# Cas particulier : une base créée avant l'introduction des migrations (via
# `prisma db push`) contient déjà les tables mais pas l'historique des migrations.
# Prisma renvoie alors l'erreur P3005. On marque dans ce cas la migration
# initiale comme déjà appliquée (baseline) puis on relance le déploiement.
set -eu

PRISMA="node_modules/.bin/prisma"
BASELINE_MIGRATION="20260913000000_init"

echo "[entrypoint] Application des migrations Prisma..."
if ! OUTPUT="$($PRISMA migrate deploy 2>&1)"; then
  echo "$OUTPUT"
  if echo "$OUTPUT" | grep -q "P3005"; then
    echo "[entrypoint] Base existante sans historique de migrations : baseline sur $BASELINE_MIGRATION."
    $PRISMA migrate resolve --applied "$BASELINE_MIGRATION"
    $PRISMA migrate deploy
  else
    echo "[entrypoint] Échec des migrations Prisma." >&2
    exit 1
  fi
else
  echo "$OUTPUT"
fi

echo "[entrypoint] Démarrage de Next.js sur le port ${PORT:-3000}..."
exec node_modules/.bin/next start -p "${PORT:-3000}"
