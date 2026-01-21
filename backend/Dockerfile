# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript
RUN npm install typescript @types/node --save-dev && \
    npm run build && \
    npm prune --production

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Set ownership
RUN chown -R node:node /app

USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]
