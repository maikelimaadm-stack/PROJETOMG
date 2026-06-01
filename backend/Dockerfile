FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npm run prisma:generate

COPY src ./src
COPY scripts ./scripts

EXPOSE 3001

CMD ["npm", "run", "start:prod"]

