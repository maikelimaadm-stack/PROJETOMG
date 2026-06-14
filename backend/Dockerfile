FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV SEED_SKIP=true
ENV HOST=0.0.0.0
ENV DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres
ENV DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres

COPY package*.json ./
COPY prisma.config.ts ./
RUN npm ci

COPY prisma ./prisma
RUN npm run prisma:generate

COPY src ./src
COPY scripts ./scripts
COPY config ./config

EXPOSE 3001

# Sobe direto — bootProduction só atrasa healthcheck
CMD ["node", "src/server.js"]
