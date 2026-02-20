#!/bin/sh
set -e

echo "Initializing database..."
cd /app/server
npx prisma db push --skip-generate

echo "Starting server..."
exec node dist/index.js
