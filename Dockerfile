# ETAPA 1: Construcción de la Documentación
FROM node:20-alpine AS build-docs
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run docs:build

# ETAPA 2: Servidor Web Securizado
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Limpiamos archivos por defecto
RUN rm -rf ./*

# Copiamos la aplicación
COPY . .

# Copiamos la documentación generada en la etapa anterior
COPY --from=build-docs /app/documentacion ./documentacion

# Copiamos la configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Permisos y Seguridad
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

USER nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
