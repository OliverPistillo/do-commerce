# Stage 1: Build dell'applicazione React
FROM node:18-alpine AS build

WORKDIR /app

# Copia i file di configurazione e installa le dipendenze
COPY package.json ./
RUN npm install

# Copia i file sorgente dell'applicazione
COPY . .

# Compila l'applicazione
RUN npm run build

# Stage 2: Immagine di produzione con Nginx
FROM nginx:alpine

# Copia i file compilati dal primo stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copia la configurazione Nginx personalizzata (se necessaria)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Espone la porta 80
EXPOSE 80

# Avvia Nginx
CMD ["nginx", "-g", "daemon off;"]