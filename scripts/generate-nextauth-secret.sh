#!/bin/bash

# Generar NEXTAUTH_SECRET seguro para Vercel
# Uso: bash scripts/generate-nextauth-secret.sh

echo "🔐 Generando NEXTAUTH_SECRET..."
echo ""

SECRET=$(openssl rand -base64 32)

echo "Tu NEXTAUTH_SECRET es:"
echo ""
echo "================================"
echo "$SECRET"
echo "================================"
echo ""
echo "Cópialo y pégalo en Vercel:"
echo "Settings → Environment Variables → NEXTAUTH_SECRET"
echo ""
echo "⚠️  Guarda este valor de forma segura!"
