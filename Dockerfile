# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy all source code
COPY . .

# Build the Next.js production app
# Set ENV to production so Next knows it's a prod build
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy built assets and required files from the builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js

# Expose port (Cloud Run sets PORT env var)
EXPOSE 8080

# Start the custom socket server
CMD ["node", "server.js"]
