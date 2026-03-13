# Estágio 1: Build da aplicação
FROM node:20-alpine as build

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Executa o build de produção (Vite)
RUN npm run build

# Estágio 2: Servidor Web (Nginx)
FROM nginx:alpine

# Copia os arquivos compilados do estágio anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Configura o Nginx para rodar na porta 3000 e suportar rotas do React (SPA)
RUN echo 'server { \
    listen 3000; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expõe a porta 3000
EXPOSE 3000

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
