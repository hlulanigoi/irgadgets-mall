#!/bin/bash
cd /app
export DATABASE_URL=postgresql://appuser:apppassword@localhost:5432/taskmanagement
export PORT=5000
export NODE_ENV=development
export FIREBASE_PROJECT_ID=designspark-a0254
exec npx tsx server/index.ts
