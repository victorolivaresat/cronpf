# ===============================
# Etapa 1: Construcción
# ===============================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración e instalación
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Construir el proyecto Next.js
RUN npm run build

# ===============================
# Etapa 2: Servidor de producción
# ===============================
FROM node:20-alpine AS runner

WORKDIR /app

# Copiar los archivos necesarios del builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/tailwind.config.ts ./tailwind.config.ts
COPY --from=builder /app/postcss.config.mjs ./postcss.config.mjs

# Instalar solo dependencias de producción
RUN npm install --production --legacy-peer-deps

# Establecer variables de entorno para Next.js
ENV NODE_ENV=production
ENV PORT=9002

# Exponer el puerto del servidor
EXPOSE 9002

# Comando de inicio
CMD ["npm", "start"]
