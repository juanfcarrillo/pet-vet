#!/bin/bash

# Script de setup completo para Pet-Vet Microservices
# Este script configura todo el proyecto de desarrollo

set -e  # Salir si cualquier comando falla

echo "🐾 Configurando Pet-Vet Microservices System..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Verificar requisitos
check_requirements() {
    print_status "Verificando requisitos del sistema..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js 18 o superior."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Se requiere Node.js 18 o superior. Versión actual: $(node --version)"
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado."
        exit 1
    fi
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker no está instalado. Necesitarás Docker para ejecutar las bases de datos."
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_warning "Docker Compose no está disponible."
    fi
    
    print_success "Requisitos verificados correctamente"
}

# Instalar dependencias principales
install_dependencies() {
    print_status "Instalando dependencias del monorepo..."
    npm install
    print_success "Dependencias principales instaladas"
}

# Configurar servicios backend
setup_backend_services() {
    print_status "Configurando servicios backend..."
    
    services=("gateway" "auth-service" "appointment-service" "chat-service")
    
    for service in "${services[@]}"; do
        print_status "Configurando $service..."
        cd "apps/$service"
        
        # Instalar dependencias
        npm install
        
        # Agregar dependencias específicas para microservicios
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
            @sentry/node
        
        npm install --save-dev \
            @types/bcrypt \
            @types/passport-jwt \
            @types/pg
        
        cd ../..
        print_success "$service configurado"
    done
}

# Configurar frontend
setup_frontend() {
    print_status "Configurando frontend..."
    cd "apps/frontend"
    
    # Instalar dependencias
    npm install
    
    # Agregar dependencias para el frontend
    npm install --save \
        @types/react \
        @types/react-dom \
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
        @sentry/react
    
    npm install --save-dev \
        @types/node \
        autoprefixer \
        postcss \
        eslint \
        @typescript-eslint/eslint-plugin \
        @typescript-eslint/parser
    
    # Configurar Tailwind CSS
    npx tailwindcss init -p
    
    cd ../..
    print_success "Frontend configurado"
}

# Configurar librerías compartidas
setup_shared_libraries() {
    print_status "Configurando librerías compartidas..."
    
    # Configurar types
    cd "libs/types"
    npm install
    npm install --save-dev typescript @types/node
    npm run build
    cd ../..
    
    # Configurar common
    cd "libs/common"
    npm install
    npm install --save-dev typescript @types/node @types/bcrypt
    npm run build
    cd ../..
    
    # Configurar database
    cd "libs/database"
    npm install
    npm install --save-dev typescript @types/node @types/pg
    npm run build
    cd ../..
    
    print_success "Librerías compartidas configuradas"
}

# Configurar variables de entorno
setup_environment() {
    print_status "Configurando variables de entorno..."
    
    if [ ! -f ".env" ]; then
        cp ".env.example" ".env"
        print_success "Archivo .env creado desde .env.example"
        print_warning "Por favor, revisa y actualiza las variables de entorno en .env"
    else
        print_warning "El archivo .env ya existe, no se sobrescribirá"
    fi
}

# Levantar servicios de base de datos
start_databases() {
    print_status "Levantando servicios de base de datos..."
    
    if command -v docker &> /dev/null && (command -v docker-compose &> /dev/null || docker compose version &> /dev/null); then
        if command -v docker-compose &> /dev/null; then
            docker-compose up -d
        else
            docker compose up -d
        fi
        
        print_success "Servicios de base de datos iniciados"
        print_status "Esperando a que las bases de datos estén listas..."
        sleep 10
        
        # Verificar que las bases de datos estén funcionando
        for i in {1..30}; do
            if docker exec $(docker ps -q -f "name=auth-db") pg_isready -U postgres > /dev/null 2>&1; then
                print_success "Bases de datos están listas"
                break
            fi
            
            if [ $i -eq 30 ]; then
                print_warning "Las bases de datos están tardando en iniciar. Puedes verificar su estado con 'docker-compose ps'"
            fi
            
            sleep 2
        done
    else
        print_warning "Docker no está disponible. Necesitarás configurar PostgreSQL y Redis manualmente."
    fi
}

# Función principal
main() {
    echo "🚀 Iniciando configuración de Pet-Vet Microservices..."
    echo
    
    check_requirements
    echo
    
    install_dependencies
    echo
    
    setup_shared_libraries
    echo
    
    setup_backend_services
    echo
    
    setup_frontend
    echo
    
    setup_environment
    echo
    
    start_databases
    echo
    
    print_success "🎉 ¡Configuración completada!"
    echo
    echo "📋 Próximos pasos:"
    echo "1. Revisa y actualiza las variables de entorno en .env"
    echo "2. Ejecuta 'npm run dev' para iniciar todos los servicios"
    echo "3. Visita http://localhost:5173 para el frontend"
    echo "4. Visita http://localhost:8080 para PgAdmin (admin@petvet.com / admin)"
    echo
    echo "📚 URLs de desarrollo:"
    echo "  - Frontend: http://localhost:5173"
    echo "  - API Gateway: http://localhost:3000"
    echo "  - Auth Service: http://localhost:3001"
    echo "  - Appointment Service: http://localhost:3002"
    echo "  - Chat Service: http://localhost:3003"
    echo "  - PgAdmin: http://localhost:8080"
    echo
    echo "🔧 Comandos útiles:"
    echo "  - npm run dev: Ejecutar todos los servicios"
    echo "  - npm run docker:up: Levantar bases de datos"
    echo "  - npm run docker:down: Bajar bases de datos"
    echo "  - npm run build: Build de todos los servicios"
    echo "  - npm run test: Ejecutar tests"
}

# Ejecutar función principal
main "$@"
