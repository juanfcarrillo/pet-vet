#!/bin/bash

# Script de post-start para DevContainer
# Se ejecuta cada vez que se inicia el contenedor

set -e

echo "🚀 Iniciando servicios de Pet-Vet..."

# Configurar colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[DevContainer Start]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    cd /workspaces/pet-vet || exit 1
fi

# Verificar conectividad con bases de datos
print_status "Verificando conectividad con servicios..."

# Verificar PostgreSQL
for db in auth-db appointment-db chat-db; do
    port=5432
    if [ "$db" = "appointment-db" ]; then port=5433; fi
    if [ "$db" = "chat-db" ]; then port=5434; fi
    
    if pg_isready -h "$db" -p "$port" -U postgres >/dev/null 2>&1; then
        print_success "$db está disponible"
    else
        echo "⏳ Esperando a que $db esté disponible..."
    fi
done

# Verificar Redis
if redis-cli -h redis ping >/dev/null 2>&1; then
    print_success "Redis está disponible"
else
    echo "⏳ Esperando a que Redis esté disponible..."
fi

print_success "Servicios verificados. ¡Listo para desarrollar!"

echo
echo "🔧 Comandos útiles:"
echo "  npm run dev              - Ejecutar todos los servicios"
echo "  npm run dev:gateway      - Solo API Gateway"
echo "  npm run dev:auth         - Solo Auth Service"
echo "  npm run dev:appointments - Solo Appointment Service"
echo "  npm run dev:chat         - Solo Chat Service"
echo "  npm run dev:frontend     - Solo Frontend"
echo
echo "🗄️ Gestión de BD:"
echo "  npm run docker:up        - Levantar servicios adicionales"
echo "  npm run docker:down      - Bajar servicios"
echo
echo "🧪 Testing:"
echo "  npm run test             - Ejecutar todos los tests"
echo "  npm run build            - Build de todos los servicios"
