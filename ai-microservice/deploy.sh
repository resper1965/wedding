#!/bin/bash
# ai-microservice/deploy.sh
# Automated Deployment Script for Google Cloud Run (Free Tier Optimized)

set -e

# Configurações Padrão
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-"meu-projeto-casamento"}
REGION="us-central1"
SERVICE_NAME="ai-microservice"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Iniciando deploy do $SERVICE_NAME para o GCP Cloud Run..."
echo "📍 Projeto: $PROJECT_ID | Região: $REGION"

# Otimizado para Zero-Cost (Serverless) via GC Build Source Nativo
echo "☁️  Criando a Release no GCP via Source Code..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --project $PROJECT_ID \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 1

echo "✅ Deploy Concluído com Sucesso!"
echo "⚠️  Lembre-se de configurar as variáveis de ambiente (EVOLUTION_API_URL, ZAI_API_KEY) via painel do Cloud Run."
