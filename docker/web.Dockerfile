FROM node:22-slim

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY packages/database/package*.json ./packages/database/
COPY packages/openapi/package*.json ./packages/openapi/

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "-w", "apps/web", "--", "--host"]
