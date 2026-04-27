# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy sources
COPY . .

# Accept build-time API urls
ARG VITE_API_URL_WA="http://localhost:3000"
ARG VITE_API_URL_GY="http://localhost:4000"
ARG VITE_API_URL_ROOMS="http://localhost:3001"
RUN export VITE_API_URL_WA=${VITE_API_URL_WA} && export VITE_API_URL_GY=${VITE_API_URL_GY} && export VITE_API_URL_ROOMS=${VITE_API_URL_ROOMS} && npm run build


# Production image
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]