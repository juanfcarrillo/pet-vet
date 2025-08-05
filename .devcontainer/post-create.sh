#!/bin/bash

# Script de post-creación para DevContainer
# Se ejecuta una vez cuando se crea el contenedor

set -e

echo "🐾 Configurando Pet-Vet DevContainer..."

# Configurar colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[DevContainer Setup]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Verificando ubicación..."
    cd /workspaces/pet-vet || exit 1
fi

print_status "Instalando dependencias del monorepo..."
npm install

print_status "Configurando librerías compartidas..."

# Configurar libs/types
if [ -d "libs/types" ]; then
    cd libs/types
    npm install
    npm run build 2>/dev/null || print_warning "No se pudo hacer build de types"
    cd ../..
fi

# Configurar libs/common
if [ -d "libs/common" ]; then
    cd libs/common
    npm install
    npm run build 2>/dev/null || print_warning "No se pudo hacer build de common"
    cd ../..
fi

# Configurar libs/database
if [ -d "libs/database" ]; then
    cd libs/database
    npm install
    npm run build 2>/dev/null || print_warning "No se pudo hacer build de database"
    cd ../..
fi

print_status "Configurando servicios backend..."

# Servicios backend
for service in gateway auth-service appointment-service chat-service; do
    if [ -d "apps/$service" ]; then
        print_status "Configurando $service..."
        cd "apps/$service"
        
        # Instalar dependencias base
        npm install
        
        # Instalar dependencias específicas para microservicios
        npm install --save \
            @nestjs/typeorm \
            @nestjs/jwt \
            @nestjs/passport \
            @nestjs/websockets \
            @nestjs/platform-socket.io \
            typeorm \
            pg \
            passport \
            passport-jwt \
            bcrypt \
            class-validator \
            class-transformer \
            dotenv \
            helmet \
            compression \
            winston \
            2>/dev/null || print_warning "Algunas dependencias de $service no se pudieron instalar"
        
        npm install --save-dev \
            @types/bcrypt \
            @types/passport-jwt \
            @types/pg \
            2>/dev/null || print_warning "Algunas dev dependencies de $service no se pudieron instalar"
        
        cd ../..
        print_success "$service configurado"
    fi
done

print_status "Configurando frontend..."

if [ -d "apps/frontend" ]; then
    cd apps/frontend
    
    # Instalar dependencias
    npm install
    
    # Instalar dependencias específicas del frontend
    npm install --save \
        react-router-dom \
        @tanstack/react-query \
        axios \
        tailwindcss \
        @headlessui/react \
        @heroicons/react \
        react-hook-form \
        @hookform/resolvers \
        yup \
        socket.io-client \
        date-fns \
        react-hot-toast \
        2>/dev/null || print_warning "Algunas dependencias del frontend no se pudieron instalar"
    
    npm install --save-dev \
        @types/node \
        autoprefixer \
        postcss \
        2>/dev/null || print_warning "Algunas dev dependencies del frontend no se pudieron instalar"
    
    # Configurar Tailwind CSS si no existe
    if [ ! -f "tailwind.config.js" ]; then
        npx tailwindcss init -p 2>/dev/null || print_warning "No se pudo inicializar Tailwind CSS"
    fi
    
    cd ../..
    print_success "Frontend configurado"
fi

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    print_status "Creando archivo .env..."
    cp .env.example .env 2>/dev/null || print_warning "No se pudo crear .env desde .env.example"
fi

# Configurar Git si no está configurado
if [ -z "$(git config --global user.name)" ]; then
    print_status "Configurando Git para DevContainer..."
    git config --global user.name "DevContainer User"
    git config --global user.email "devcontainer@petvet.local"
    git config --global init.defaultBranch main
fi

# Esperar a que las bases de datos estén listas
print_status "Esperando a que las bases de datos estén disponibles..."
for i in {1..30}; do
    if pg_isready -h auth-db -p 5432 -U postgres >/dev/null 2>&1; then
        print_success "Bases de datos están listas"
        break
    fi
    
    if [ $i -eq 30 ]; then
        print_warning "Las bases de datos están tardando en iniciar"
    fi
    
    sleep 2
done

print_success "🎉 ¡DevContainer configurado exitosamente!"
print_status "Para comenzar a desarrollar, ejecuta: npm run dev"

echo
echo "📋 URLs disponibles:"
echo "  - Frontend: http://localhost:5173"
echo "  - API Gateway: http://localhost:3000"
echo "  - Auth Service: http://localhost:3001"
echo "  - Appointment Service: http://localhost:3002"
echo "  - Chat Service: http://localhost:3003"
echo "  - PgAdmin: http://localhost:8080 (admin@petvet.com / admin)"
