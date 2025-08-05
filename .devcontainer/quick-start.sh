#!/bin/bash

# Script de inicio rápido para Pet-Vet DevContainer
# Inicia todos los servicios y muestra el estado

set -e

echo "🚀 Iniciando Pet-Vet Microservices..."

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[QUICK START]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    cd /workspaces/pet-vet || exit 1
fi

# Verificar que las bases de datos están disponibles
print_status "Verificando servicios de base de datos..."

for i in {1..30}; do
    all_ready=true
    
    if ! pg_isready -h auth-db -p 5432 -U postgres >/dev/null 2>&1; then
        all_ready=false
    fi
    
    if ! pg_isready -h appointment-db -p 5432 -U postgres >/dev/null 2>&1; then
        all_ready=false
    fi
    
    if ! pg_isready -h chat-db -p 5432 -U postgres >/dev/null 2>&1; then
        all_ready=false
    fi
    
    if ! redis-cli -h redis ping >/dev/null 2>&1; then
        all_ready=false
    fi
    
    if [ "$all_ready" = true ]; then
        print_success "Todos los servicios de base de datos están listos"
        break
    fi
    
    if [ $i -eq 30 ]; then
        print_info "Algunos servicios están tardando en iniciar, pero continuamos..."
        break
    fi
    
    echo -n "."
    sleep 2
done

echo

# Mostrar información del sistema
print_status "Información del sistema:"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo "  PostgreSQL: $(psql --version | head -n1)"
echo "  Redis: $(redis-cli --version)"

echo

# Mostrar URLs disponibles
print_status "URLs de desarrollo disponibles:"
echo "  🌐 Frontend:           http://localhost:5173"
echo "  🔌 API Gateway:        http://localhost:3000"
echo "  🔐 Auth Service:       http://localhost:3001"
echo "  📅 Appointment Service: http://localhost:3002"
echo "  💬 Chat Service:       http://localhost:3003"
echo "  🗄️ PgAdmin:           http://localhost:8080"

echo

# Mostrar comandos útiles
print_status "Comandos útiles:"
echo "  npm run dev                    # Iniciar todos los servicios"
echo "  npm run dev:frontend           # Solo frontend"
echo "  npm run dev:gateway            # Solo API Gateway"
echo "  ./.devcontainer/verify.sh      # Verificar configuración"
echo "  ./.devcontainer/quick-start.sh # Este script"

echo

print_info "Para iniciar el desarrollo, ejecuta: npm run dev"
print_info "Para ver todos los comandos disponibles: cat .devcontainer/COMMANDS.md"

echo
print_success "🎉 ¡DevContainer listo para desarrollo!"
