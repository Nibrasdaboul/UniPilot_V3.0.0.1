# UniPilot — production image: build frontend + run Express server
# Build: docker build --build-arg VITE_BACKEND_URL=https://your-app.onrender.com -t unipilot .
# Run:   docker run -p 10000:10000 -e DATABASE_URL=... -e JWT_SECRET=... unipilot

# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_BACKEND_URL=
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
RUN npm run build

# ---------- Runner ----------
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node server ./server
COPY --chown=node:node --from=builder /app/dist ./dist

# مجلد الرفع (إن كان السيرفر يكتب فيه)
RUN mkdir -p /app/uploads && chown node:node /app/uploads

ENV NODE_ENV=production
EXPOSE 10000

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-10000}/health" || exit 1

CMD ["node", "server/index.js"]
