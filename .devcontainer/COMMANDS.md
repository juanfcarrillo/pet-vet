# Comandos Útiles para Pet-Vet DevContainer

## 🚀 Comandos de Desarrollo

### Iniciar servicios
```bash
# Todos los servicios
npm run dev

# Servicios individuales
npm run dev:gateway      # API Gateway (puerto 3000)
npm run dev:auth         # Auth Service (puerto 3001)
npm run dev:appointments # Appointment Service (puerto 3002)
npm run dev:chat         # Chat Service (puerto 3003)
npm run dev:frontend     # Frontend React (puerto 5173)
```

### Build y Testing
```bash
# Build completo
npm run build

# Build individual
npm run build:gateway
npm run build:auth
npm run build:appointments
npm run build:chat
npm run build:frontend

# Testing
npm run test              # Todos los tests
npm run test:auth         # Tests del auth service
npm run test:appointments # Tests del appointment service
npm run test:chat         # Tests del chat service
npm run test:gateway      # Tests del gateway
```

## 🗄️ Gestión de Base de Datos

### Conexiones PostgreSQL
```bash
# Conectar a Auth DB
psql -h auth-db -U postgres -d auth_db

# Conectar a Appointment DB  
psql -h appointment-db -U postgres -d appointment_db

# Conectar a Chat DB
psql -h chat-db -U postgres -d chat_db

# Verificar estado de las bases de datos
pg_isready -h auth-db -U postgres
pg_isready -h appointment-db -U postgres  
pg_isready -h chat-db -U postgres
```

### Redis
```bash
# Conectar a Redis
redis-cli -h redis

# Verificar estado de Redis
redis-cli -h redis ping

# Ver todas las claves
redis-cli -h redis keys "*"

# Limpiar cache
redis-cli -h redis flushall
```

## 🔍 Monitoreo y Debugging

### Verificar servicios
```bash
# Verificar configuración completa
./.devcontainer/verify.sh

# Ver procesos Node.js ejecutándose
ps aux | grep node

# Ver puertos en uso
lsof -i :3000-3003,5173

# Ver logs en tiempo real
tail -f apps/*/logs/*.log  # Si hay archivos de log

# Verificar conectividad de red
curl http://localhost:3000/health   # Gateway
curl http://localhost:3001/health   # Auth Service
curl http://localhost:3002/health   # Appointment Service
curl http://localhost:3003/health   # Chat Service
```

### Debugging
```bash
# Ejecutar con debugging habilitado
NODE_ENV=development npm run dev:auth

# Ver variables de entorno
env | grep -E "(DB_|REDIS_|JWT_|NODE_)"

# Logs de Docker
docker logs petvet-auth-db-1
docker logs petvet-appointment-db-1
docker logs petvet-chat-db-1
docker logs petvet-redis-1
```

## 🛠️ Mantenimiento

### Limpieza
```bash
# Limpiar node_modules
find . -name "node_modules" -type d -exec rm -rf {} +

# Limpiar builds
npm run clean  # Si está configurado
find . -name "dist" -type d -exec rm -rf {} +

# Reinstalar dependencias
npm run setup
```

### Reset de bases de datos
```bash
# Parar servicios
docker-compose down -v

# Eliminar volúmenes (CUIDADO: esto borra todos los datos)
docker volume prune

# Reiniciar servicios
docker-compose up -d

# Esperar y verificar
sleep 10
./.devcontainer/verify.sh
```

## 📊 URLs de Desarrollo

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001  
- **Appointment Service**: http://localhost:3002
- **Chat Service**: http://localhost:3003
- **PgAdmin**: http://localhost:8080 (admin@petvet.com / admin)

## 🔧 Configuración Avanzada

### Variables de entorno importantes
```bash
# Base de datos
export DB_HOST=auth-db
export DB_USERNAME=postgres
export DB_PASSWORD=postgres

# JWT
export JWT_SECRET=dev-super-secret-jwt-key
export JWT_EXPIRES_IN=1h

# Redis
export REDIS_HOST=redis
export REDIS_PORT=6379
```

### Aliases útiles
```bash
# Agregar al ~/.bashrc o ~/.zshrc del DevContainer
alias pv-dev="npm run dev"
alias pv-build="npm run build"
alias pv-test="npm run test"
alias pv-verify="./.devcontainer/verify.sh"
alias pv-logs="docker-compose logs -f"
alias pv-restart="docker-compose restart"
```

## 🆘 Troubleshooting

### Problemas comunes

1. **Puerto ocupado**
   ```bash
   lsof -ti:3000 | xargs kill -9  # Matar proceso en puerto 3000
   ```

2. **Base de datos no conecta**
   ```bash
   docker-compose restart auth-db
   pg_isready -h auth-db -U postgres
   ```

3. **Dependencias faltantes**
   ```bash
   npm run setup
   # O individualmente:
   cd apps/auth-service && npm install
   ```

4. **Cache corrupto**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **DevContainer no inicia**
   ```bash
   # Rebuild completo del DevContainer
   Ctrl+Shift+P -> "Dev Containers: Rebuild Container"
   ```
