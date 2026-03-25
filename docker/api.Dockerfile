FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY packages/database/package*.json ./packages/database/
COPY packages/openapi/package*.json ./packages/openapi/

RUN npm install

COPY . .
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

EXPOSE 3000

CMD ["npm", "run", "dev", "-w", "apps/api"]
