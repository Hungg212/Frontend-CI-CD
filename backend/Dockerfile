# Backend Dockerfile for Render
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

# Auto-run schema init and seed (idempotent) on start
CMD ["sh", "-c", "node src/seed.js && node src/server.js"]
