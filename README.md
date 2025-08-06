# Pet-Vet Microservices System

Sistema de gestión veterinaria desarrollado con arquitectura de microservicios usando NestJS y React.

## 📚 Tabla de Contenidos

- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Inicio Rápido](#-inicio-rápido)
- [Bases de Datos](#-bases-de-datos)
- [Testing](#-testing)
- [Build](#-build)
- [Requerimientos Funcionales](#-requerimientos-funcionales)
- [Desarrollo con DevContainers](#-desarrollo-con-devcontainers)
- [Monitoreo](#-monitoreo)
- [Despliegue](#-despliegue)
- [Contribución](#-contribución)
- [Scripts Disponibles](#-scripts-disponibles)
- [Soporte](#-soporte)
- [Licencia](#-licencia)

## 🏗️ Arquitectura

Este proyecto implementa una arquitectura de microservicios que incluye:

- **API Gateway**: Punto de entrada único y load balancer
- **Auth Service**: Gestión de autenticación y autorización (HU01, HU02)
- **Appointment Service**: Gestión de citas veterinarias (HU03-HU06, HU08)
- **Chat Service**: Comunicación en tiempo real (HU07)
- **Frontend**: Aplicación React con TypeScript

## 🚀 Tecnologías

### Backend
- **NestJS**: Framework de Node.js
- **TypeScript**: Lenguaje de programación
- **PostgreSQL**: Base de datos (una por microservicio)
- **TypeORM**: ORM para bases de datos
- **JWT**: Autenticación y autorización
- **WebSockets**: Comunicación en tiempo real

### Frontend
- **React**: Librería de UI
- **TypeScript**: Lenguaje de programación
- **Vite**: Build tool y dev server
- **Tailwind CSS**: Framework de CSS

### DevOps y Herramientas
- **Docker**: Containerización
- **Docker Compose**: Orquestación local
- **DevContainers**: Ambiente de desarrollo consistente
- **GitHub Actions**: CI/CD
- **Sentry**: Monitoreo y logging
- **Redis**: Cache y sesiones

## 📁 Estructura del Proyecto

```
pet-vet/
├── apps/                    # Aplicaciones
│   ├── gateway/            # API Gateway (Puerto 3000)
│   ├── auth-service/       # Servicio de autenticación (Puerto 3001)
│   ├── appointment-service/ # Servicio de citas (Puerto 3002)
│   ├── chat-service/       # Servicio de chat (Puerto 3003)
│   └── frontend/           # Frontend React (Puerto 5173)
├── libs/                   # Librerías compartidas
│   ├── common/            # Utilidades comunes
│   ├── database/          # Configuración de BD
│   └── types/             # Tipos TypeScript
├── docker/                # Configuraciones Docker
├── .devcontainer/         # DevContainer config
├── docker-compose.yml     # BD y servicios auxiliares
└── package.json           # Configuración monorepo
```

## 🏃‍♂️ Inicio Rápido

### Prerequisitos
- Node.js 18+
- Docker y Docker Compose
- Git

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd pet-vet
```

2. **Instalar dependencias**
```bash
npm install
npm run setup
```

3. **Levantar servicios de base de datos**
```bash
npm run docker:up
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

### URLs de desarrollo

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Appointment Service**: http://localhost:3002
- **Chat Service**: http://localhost:3003
- **PgAdmin**: http://localhost:8080 (admin@petvet.com / admin)

## 🗄️ Bases de Datos

Cada microservicio tiene su propia base de datos PostgreSQL:

- **auth-db**: Puerto 5432 - Base de datos de autenticación
- **appointment-db**: Puerto 5433 - Base de datos de citas
- **chat-db**: Puerto 5434 - Base de datos de chat
- **Redis**: Puerto 6379 - Cache y sesiones

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Test por servicio
npm run test:auth
npm run test:appointments
npm run test:chat
npm run test:gateway
```

## 🏗️ Build

```bash
# Build completo
npm run build

# Build por servicio
npm run build:auth
npm run build:appointments
npm run build:chat
npm run build:gateway
npm run build:frontend
```

## 📋 Requerimientos Funcionales

### HU01 - Registro de Usuario
- Formulario con validación de campos obligatorios
- Hash de contraseñas y respuestas de seguridad
- Validación de roles (Cliente/Veterinario)
- Redirección automática post-registro

### HU02 - Inicio de Sesión
- Autenticación con JWT
- Recuperación de contraseña via pregunta de seguridad
- Manejo de credenciales incorrectas
- Redirección a dashboard

### HU03 - Agendar Cita
- Calendario visual con disponibilidad
- Formulario completo de cita
- Validación de horarios disponibles
- Estado inicial "Programada"

### HU04 - Editar Cita
- Solo citas en estado "Programada"
- Formulario prellenado
- Confirmación de cambios
- Actualización en tiempo real

### HU05 - Eliminar Cita
- Modal de confirmación
- Liberación de horario
- Eliminación completa del sistema

### HU06 - Ver Citas (Cliente)
- Dashboard personalizado
- Vista de citas pendientes
- Confirmación de citas
- Información detallada

### HU07 - Chat en Tiempo Real
- WebSockets para comunicación instantánea
- Indicadores de estado
- Notificaciones visuales y sonoras
- Límite de 500 caracteres por mensaje

### HU08 - Ver Citas (Veterinario)
- Dashboard veterinario
- Gestión de agenda profesional
- Confirmación de citas
- Vista de información del cliente

## 🔧 Desarrollo con DevContainers

El proyecto está completamente configurado para usar DevContainers, lo que garantiza un ambiente de desarrollo consistente para todo el equipo.

### Opción 1: Usar DevContainer (Recomendado)

1. **Prerequisitos**
   - Docker y Docker Compose instalados
   - Visual Studio Code
   - Extensión "Dev Containers" para VS Code

2. **Configuración automática**
   ```bash
   # Clonar el repositorio
   git clone <repository-url>
   cd pet-vet
   
   # Abrir en VS Code
   code .
   ```

3. **Abrir en DevContainer**
   - Presionar `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
   - Seleccionar "Dev Containers: Reopen in Container"
   - Esperar a que se configure el ambiente (5-10 minutos la primera vez)

4. **Verificar configuración**
   ```bash
   # Dentro del DevContainer
   ./.devcontainer/verify.sh
   ```

5. **Iniciar desarrollo**
   ```bash
   npm run dev
   ```

### Características del DevContainer

- ✅ **Ambiente preconfigurado**: Node.js 20, PostgreSQL, Redis
- ✅ **Extensiones VS Code**: TypeScript, ESLint, Prettier, PostgreSQL, etc.
- ✅ **Bases de datos automáticas**: 3 instancias PostgreSQL + Redis
- ✅ **PgAdmin incluido**: Administración visual de BD
- ✅ **Hot reload**: Cambios en tiempo real en todos los servicios
- ✅ **Port forwarding**: Acceso directo desde el host
- ✅ **Configuración compartida**: Variables de entorno y settings

### Estructura del DevContainer

```
.devcontainer/
├── devcontainer.json      # Configuración principal
├── docker-compose.yml     # Servicios y bases de datos
├── Dockerfile            # Imagen custom del DevContainer
├── post-create.sh        # Setup inicial (dependencias)
├── post-start.sh         # Setup en cada inicio
├── verify.sh             # Verificación del ambiente
├── pgadmin-servers.json  # Configuración PgAdmin
└── .env.devcontainer     # Variables de entorno
```

### Opción 2: Desarrollo Local (Sin DevContainer)

- **JWT Tokens**: Autenticación stateless
- **Hash de contraseñas**: bcrypt con salt rounds altos
- **Validación de entrada**: class-validator en todos los endpoints
- **Rate limiting**: Protección contra ataques de fuerza bruta
- **CORS**: Configuración segura para producción

## 📊 Monitoreo

- **Sentry**: Tracking de errores y performance
- **Logs estructurados**: Winston con formato JSON
- **Health checks**: Endpoints de salud en cada servicio
- **Métricas**: Prometheus (futuro)

## 🚀 Despliegue

### Desarrollo Local
```bash
npm run docker:up
npm run dev
```

### Producción
- CI/CD con GitHub Actions
- Containerización con Docker
- Orquestación con Docker Compose o Kubernetes

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit los cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev                 # Ejecutar todos los servicios
npm run dev:gateway         # Solo API Gateway
npm run dev:auth           # Solo Auth Service
npm run dev:appointments   # Solo Appointment Service
npm run dev:chat          # Solo Chat Service
npm run dev:frontend      # Solo Frontend

# Setup
npm run setup             # Setup completo
npm run setup:services    # Solo servicios backend
npm run setup:frontend    # Solo frontend

# Docker
npm run docker:up         # Levantar servicios
npm run docker:down       # Bajar servicios

# Build
npm run build             # Build completo
npm run build:gateway     # Build API Gateway
npm run build:auth        # Build Auth Service
npm run build:appointments # Build Appointment Service
npm run build:chat        # Build Chat Service
npm run build:frontend    # Build Frontend

# Testing
npm run test              # Test completo
npm run test:gateway      # Test API Gateway
npm run test:auth         # Test Auth Service
npm run test:appointments # Test Appointment Service
npm run test:chat         # Test Chat Service
```

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, crear un issue en el repositorio.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
