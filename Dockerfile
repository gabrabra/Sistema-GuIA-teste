# Estágio 1: Build da aplicação
FROM node:22-alpine as build

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Executa o build de produção (Vite)
RUN npm run build

# Estágio 2: Execução (Node.js)
FROM node:22-alpine

WORKDIR /app

# Copia as dependências e arquivos necessários
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.ts ./
COPY --from=build /app/server ./server
COPY --from=build /app/node_modules ./node_modules

# Define a variável de ambiente para produção
ENV NODE_ENV=production

# Expõe a porta 3000
EXPOSE 3000

# Inicia o servidor Node.js
CMD ["npm", "start"]
