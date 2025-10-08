#!/bin/bash

# HealthyGatorFan GCP Setup Script
# This script sets up all necessary GCP services for the Django backend

set -e  # Exit on any error

PROJECT_ID="healthygator-fan"
REGION="us-central1"
SERVICE_NAME="healthygator-backend"
DB_INSTANCE_NAME="healthygator-db"
DB_NAME="healthygator_db"
DB_USER="postgres"

echo "🚀 Setting up HealthyGatorFan on Google Cloud Platform"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Authenticate and set project
echo "🔐 Authenticating with Google Cloud..."
gcloud auth login --account=smashresearchlabs@gmail.com
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable container.googleapis.com

# Create Cloud SQL PostgreSQL instance
echo "🗄️  Creating Cloud SQL PostgreSQL instance..."
gcloud sql instances create $DB_INSTANCE_NAME \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION \
    --storage-type=SSD \
    --storage-size=10GB \
    --backup \
    --enable-ip-alias \
    --network=default \
    --no-assign-ip

# Set root password for the database
echo "🔑 Setting database password..."
DB_PASSWORD=$(openssl rand -base64 32)
gcloud sql users set-password postgres \
    --instance=$DB_INSTANCE_NAME \
    --password=$DB_PASSWORD

# Create the database
echo "📊 Creating database..."
gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE_NAME

# Get the connection name
CONNECTION_NAME=$(gcloud sql instances describe $DB_INSTANCE_NAME --format="value(connectionName)")
echo "Connection name: $CONNECTION_NAME"

# Create Redis instance
echo "🔴 Creating Redis instance..."
gcloud redis instances create healthygator-redis \
    --size=1 \
    --region=$REGION \
    --redis-version=redis_6_x

# Get Redis IP
REDIS_IP=$(gcloud redis instances describe healthygator-redis --region=$REGION --format="value(host)")
REDIS_PORT=$(gcloud redis instances describe healthygator-redis --region=$REGION --format="value(port)")

echo "Redis connection: $REDIS_IP:$REDIS_PORT"

# Create Cloud Build trigger
echo "🔨 Setting up Cloud Build trigger..."
gcloud builds triggers create github \
    --repo-name=HealthyGatorFan \
    --repo-owner=smashresearchlabs \
    --branch-pattern="^main$" \
    --build-config=cloudbuild.yaml \
    --name=healthygator-cd-trigger

# Create environment variables file
echo "📝 Creating environment variables..."
cat > .env.production << EOF
DEBUG=False
SECRET_KEY=$(openssl rand -base64 32)
DATABASE_NAME=$DB_NAME
DATABASE_USER=$DB_USER
DATABASE_PASSWORD=$DB_PASSWORD
CLOUD_SQL_CONNECTION_NAME=$CONNECTION_NAME
REDIS_URL=redis://$REDIS_IP:$REDIS_PORT/0
DJANGO_SETTINGS_MODULE=project.settings
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Summary:"
echo "  Project ID: $PROJECT_ID"
echo "  Database: $DB_INSTANCE_NAME"
echo "  Redis: healthygator-redis"
echo "  Connection Name: $CONNECTION_NAME"
echo "  Redis URL: redis://$REDIS_IP:$REDIS_PORT/0"
echo ""
echo "🔧 Next steps:"
echo "  1. Push your code to the main branch to trigger deployment"
echo "  2. The first deployment will fail until you run migrations"
echo "  3. Connect to Cloud SQL and run Django migrations manually"
echo ""
echo "📄 Environment variables saved to .env.production"
echo "🔐 Database password: $DB_PASSWORD"
