# Development stage
FROM node:current-alpine3.21 AS development

WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage
FROM development AS build
RUN npm run build

# Production stage
FROM node:current-alpine3.21 AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]
