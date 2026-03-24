FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "-w", "apps/api"]
