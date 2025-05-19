# ==========================================
# Build Stage
# ==========================================
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY .npmrc* ./

# Install all dependencies including devDependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application (if needed)
# RUN npm run build

# ==========================================
# Production Stage
# ==========================================
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -S nodejs && \
    adduser -S -G nodejs nodejs

# Create app directory with proper permissions
WORKDIR /usr/src/app

# Copy package files
COPY --from=builder /usr/src/app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application
COPY --from=builder /usr/src/app ./


# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max_old_space_size=1024

# Create necessary directories
RUN mkdir -p logs && \
    chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

# Expose the port the app runs on
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT:-8080}/health', (r) => {if(r.statusCode !== 200) throw new Error(r.statusCode)}).on('error', (e) => {console.error(e); process.exit(1)})"

# Command to run the application
CMD ["node", "src/server.js"]

# ==========================================
# Development Stage
# ==========================================
FROM node:18-alpine AS development

# Install development tools
RUN apk add --no-cache bash curl vim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY --from=builder /usr/src/app/package*.json ./

# Install all dependencies including devDependencies
RUN npm ci

# Copy application code
COPY --from=builder /usr/src/app .

# Set environment variables
ENV NODE_ENV=development
ENV DEBUG=gateway:*,http-proxy-middleware

# Create necessary directories
RUN mkdir -p logs && \
    chown -R node:node /usr/src/app

# Expose the port the app runs on
EXPOSE 8080 9229

# Command to run the application with debugging
CMD ["npm", "run", "dev"]
