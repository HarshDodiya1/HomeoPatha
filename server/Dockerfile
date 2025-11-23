# Stage 1: ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app
COPY package.json package-lock.json ./

ENV NODE_ENV=production
RUN npm ci --omit=dev
COPY . .

# Stage 2: ---------- Runtime stage ----------
FROM node:20-alpine AS runtime

# Create non-root user and group to run the app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /usr/src/app

# Install tini for signal handling and curl for healthchecks
RUN apk add --no-cache tini curl

# Copy only what's needed from build stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app ./

# Ensure app files are owned by non-root user
RUN chown -R appuser:appgroup /usr/src/app

# Set environment defaults (override at runtime with docker run -e or in your orchestration)
ENV NODE_ENV=production
ENV PORT=5000

USER appuser

EXPOSE 5000

# Optional: small healthcheck hitting your server root or a /health endpoint.
# If your app has no /health route, either add one or remove the HEALTHCHECK.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Use tini to forward signals and reap zombies, then start the app
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/server.js"]
