FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --silent
COPY . .
EXPOSE 3001
CMD ["node", "rooms-service.js"]
