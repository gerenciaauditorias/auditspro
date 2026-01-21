# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && \
    npm install typescript ts-node-dev @types/node && \
    npm cache clean --force

# Copy source code
COPY . .

# Set ownership
RUN chown -R node:node /app

USER node

EXPOSE 5000

CMD ["npm", "run", "dev"]
