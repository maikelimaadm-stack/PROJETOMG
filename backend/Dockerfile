FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV SEED_SKIP=true
ENV HOST=0.0.0.0

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npm run prisma:generate

COPY src ./src
COPY scripts ./scripts
COPY config ./config

EXPOSE 3001

# Migrations bloqueantes ANTES do servidor — proibido aceitar tráfego sem DDL
CMD ["node", "scripts/bootProduction.js"]
