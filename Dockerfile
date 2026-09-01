# SPA estática (Vite + React). nginx sirve dist/ en el puerto 80.
# Container Port en Dokploy = 80.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Vite hornea la base en los assets durante el build, así que esto NO se puede
# configurar como env var en Dokploy: tiene que estar acá. En GitHub Pages la
# app vive bajo /2fs-twofactorsorteo/; en Dokploy vive en la raíz del dominio.
ENV BASE_PATH=/
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
