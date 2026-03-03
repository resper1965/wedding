FROM node:18-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx tsc

EXPOSE 8080

CMD ["node", "dist/index.js"]
