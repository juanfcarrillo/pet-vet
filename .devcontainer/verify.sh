#!/bin/bash

# Script de verificación para DevContainer
# Verifica que todos los servicios estén funcionando correctamente

set -e

echo "🔍 Verificando Pet-Vet DevContainer..."

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[VERIFY]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Función para verificar si un puerto está abierto
check_port() {
    local host=$1
    local port=$2
    local service=$3
    
    if timeout 5 bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
        print_success "$service está disponible en $host:$port"
        return 0
    else
        print_error "$service NO está disponible en $host:$port"
        return 1
    fi
}

# Función para verificar servicio HTTP
check_http_service() {
    local url=$1
    local service=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        print_success "$service responde en $url"
        return 0
    else
        print_warning "$service no responde en $url (puede estar iniciando)"
        return 1
    fi
}

# Verificar estructura del proyecto
print_status "Verificando estructura del proyecto..."

required_dirs=("apps/gateway" "apps/auth-service" "apps/appointment-service" "apps/chat-service" "apps/frontend" "libs/types" "libs/common" "libs/database")

for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        print_success "Directorio $dir existe"
    else
        print_error "Directorio $dir NO existe"
    fi
done

# Verificar archivos importantes
print_status "Verificando archivos de configuración..."

required_files=("package.json" "docker-compose.yml" ".env.example" "README.md")

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "Archivo $file existe"
    else
        print_error "Archivo $file NO existe"
    fi
done

# Verificar node_modules
print_status "Verificando instalación de dependencias..."

if [ -d "node_modules" ]; then
    print_success "Dependencias principales instaladas"
else
    print_error "Dependencias principales NO están instaladas"
fi

# Verificar bases de datos
print_status "Verificando bases de datos..."

check_port "auth-db" "5432" "Auth Database"
check_port "appointment-db" "5432" "Appointment Database" 
check_port "chat-db" "5432" "Chat Database"

# Verificar Redis
print_status "Verificando Redis..."
check_port "redis" "6379" "Redis"

# Verificar conectividad a bases de datos
print_status "Verificando conectividad a bases de datos..."

if command -v pg_isready >/dev/null 2>&1; then
    if pg_isready -h auth-db -p 5432 -U postgres >/dev/null 2>&1; then
        print_success "Conexión a Auth DB exitosa"
    else
        print_error "No se pudo conectar a Auth DB"
    fi
    
    if pg_isready -h appointment-db -p 5432 -U postgres >/dev/null 2>&1; then
        print_success "Conexión a Appointment DB exitosa"
    else
        print_error "No se pudo conectar a Appointment DB"
    fi
    
    if pg_isready -h chat-db -p 5432 -U postgres >/dev/null 2>&1; then
        print_success "Conexión a Chat DB exitosa"
    else
        print_error "No se pudo conectar a Chat DB"
    fi
else
    print_warning "pg_isready no está disponible"
fi

# Verificar Redis
if command -v redis-cli >/dev/null 2>&1; then
    if redis-cli -h redis ping >/dev/null 2>&1; then
        print_success "Conexión a Redis exitosa"
    else
        print_error "No se pudo conectar a Redis"
    fi
else
    print_warning "redis-cli no está disponible"
fi

# Verificar herramientas de desarrollo
print_status "Verificando herramientas de desarrollo..."

tools=("node" "npm" "git" "curl" "wget")

for tool in "${tools[@]}"; do
    if command -v "$tool" >/dev/null 2>&1; then
        version=$($tool --version 2>/dev/null | head -n1 || echo "versión no disponible")
        print_success "$tool está instalado ($version)"
    else
        print_error "$tool NO está instalado"
    fi
done

# Verificar Node.js y npm más detalladamente
if command -v node >/dev/null 2>&1; then
    node_version=$(node --version)
    if [[ $node_version =~ v([0-9]+) ]]; then
        major_version=${BASH_REMATCH[1]}
        if [ "$major_version" -ge 18 ]; then
            print_success "Node.js versión es compatible ($node_version)"
        else
            print_error "Node.js versión es muy antigua ($node_version). Se requiere 18+"
        fi
    fi
fi

# Verificar variables de entorno importantes
print_status "Verificando variables de entorno..."

important_vars=("NODE_ENV" "DB_HOST" "REDIS_HOST" "JWT_SECRET")

for var in "${important_vars[@]}"; do
    if [ -n "${!var}" ]; then
        print_success "Variable $var está definida"
    else
        print_warning "Variable $var NO está definida"
    fi
done

echo
print_status "🎯 Verificación completada"
echo
echo "🚀 Para iniciar el desarrollo:"
echo "  npm run dev              # Todos los servicios"
echo "  npm run dev:frontend     # Solo frontend"
echo "  npm run dev:gateway      # Solo API Gateway"
echo
echo "📊 Para verificar servicios en ejecución:"
echo "  ps aux | grep node       # Procesos Node.js"
echo "  lsof -i :3000-3003,5173  # Puertos en uso"
echo
echo "🔗 URLs útiles:"
echo "  http://localhost:5173     # Frontend"
echo "  http://localhost:3000     # API Gateway" 
echo "  http://localhost:8080     # PgAdmin"
