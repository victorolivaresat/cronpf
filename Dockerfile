# ===============================
# Etapa 1: Construccion
# ===============================
FROM node:20-alpine AS builder

WORKDIR /cronpf

# Copiar archivos de configuracion e instalacion
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar todo el codigo fuente
COPY . .

# Construir el proyecto Next.js
RUN npm run build

# ===============================
# Etapa 2: Servidor de produccion
# ===============================
FROM node:20-alpine AS runner

WORKDIR /cronpf

# Copiar solo lo necesario desde la etapa anterior
COPY --from=builder /cronpf/package*.json ./
COPY --from=builder /cronpf/.next ./.next

# Si existe carpeta public, se copia (seguro)
# Puedes descomentar si mas adelante agregas assets publicos:
# COPY --from=builder /cronpf/public ./public

# Instalar solo dependencias de produccion
RUN npm install --production --legacy-peer-deps

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=9002

# Exponer puerto
EXPOSE 9002

# Comando de inicio
CMD ["npm", "start"]
