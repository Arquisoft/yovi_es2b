FROM node:22-alpine
ARG MONGO_URI
ENV MONGO_URI=${MONGO_URI}
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --silent

COPY . .
EXPOSE 3000
CMD ["node", "users-service.js"]
