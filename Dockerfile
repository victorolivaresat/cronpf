# ===============================
# Etapa 1: Construcción
# ===============================
FROM node:20-alpine AS builder

WORKDIR /cronpf

# Copiar archivos de configuración e instalación
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar todo el código fuente
COPY . .

# Construir el proyecto Next.js
RUN npm run build

# ===============================
# Etapa 2: Servidor de producción
# ===============================
FROM node:20-alpine AS runner

WORKDIR /cronpf

# Copiar solo lo necesario desde la etapa anterior
COPY --from=builder /cronpf/package*.json ./
COPY --from=builder /cronpf/.next ./.next

# Si existe carpeta public, se copia (seguro)
# Puedes descomentar si más adelante agregas assets públicos:
# COPY --from=builder /cronpf/public ./public

# Instalar solo dependencias de producción
RUN npm install --production --legacy-peer-deps

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=9002

# Exponer puerto
EXPOSE 9002

# Comando de inicio
CMD ["npm", "start"]
