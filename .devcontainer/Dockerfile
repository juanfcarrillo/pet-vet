FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

# Instalar dependencias adicionales
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        postgresql-client \
        redis-tools \
        curl \
        wget \
        git \
        vim \
        nano \
    && apt-get autoremove -y && apt-get clean -y

# Instalar herramientas globales de Node.js
RUN npm install -g \
    @nestjs/cli \
    concurrently \
    nodemon \
    pm2

# Configurar Git (opcional)
RUN git config --global --add safe.directory /workspace

# Crear directorio de trabajo
WORKDIR /workspace

# Copiar package.json para pre-instalar dependencias (opcional para cache)
COPY package*.json ./

# Instalar dependencias del workspace principal
RUN npm install

# El resto de archivos se montarán como volumen
VOLUME /workspace

# Configurar usuario para evitar problemas de permisos
USER node

# Puerto por defecto (se sobreescribirá según el servicio)
EXPOSE 3000 3001 3002 3003 5173 5432 5433 5434 6379 8080
