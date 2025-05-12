FROM node:current-alpine3.21

# 1. lay down a writable working directory
WORKDIR /app

# 2. copy *only* manifests first => cacheable npm ci layer
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# 3. copy the rest of the source so tsx can find *.ts files
COPY . .

# 4. developer conveniences
ENV NODE_ENV=development
EXPOSE 3000

# 5. default entrypoint (compose can still override)
CMD ["npm","run","dev"]
