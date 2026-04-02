FROM node:20-bookworm-slim

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY frontend/package.json frontend/package-lock.json ./frontend/
WORKDIR /app/frontend
RUN npm ci --ignore-scripts

WORKDIR /app
COPY frontend ./frontend
COPY backend ./backend

WORKDIR /app/frontend
RUN npm run postinstall && npm run build

EXPOSE 3000

CMD ["sh", "-c", "npm run prisma:push:docker && npm run ensure:admin && npm run start"]

