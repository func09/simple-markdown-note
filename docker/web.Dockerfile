FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "-w", "apps/web", "--", "--host"]
