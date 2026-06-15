# ===== Build stage =====
FROM node:22-alpine AS build
WORKDIR /app

# Instala dependências (cache eficiente)
COPY package*.json ./
RUN npm ci

# Copia o código e gera o build de produção
COPY . .
RUN npm run build

# ===== Runtime stage (Nginx) =====
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80