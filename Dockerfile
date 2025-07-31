# Dockerfile for StoreFlow (Next.js Application)

# ---- Base Stage ----
# Use a specific Node.js version for reproducibility.
# Alpine versions are smaller and more secure.\nFROM node:18-alpine AS base
WORKDIR /app

# ---- Dependencies Stage ----
# This stage is dedicated to installing npm dependencies.
# It\'s a separate stage to leverage Docker\'s layer caching.
# It will only be re-run if package.json or package-lock.json changes.\nFROM base AS deps
COPY package.json package-lock.json* ./
# Copy the .env file
COPY .env .env
RUN npm install --frozen-lockfile

# ---- Build Stage ----
# This stage builds the Next.js application.\nFROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Removed redundant .env copy
# COPY .env .env

# Next.js needs access to public environment variables at build time.
# You can pass them in during the `docker build` command.
# Example: docker build --build-arg NEXT_PUBLIC_API_URL=http://api.example.com -t storeflow .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}

RUN npm run build
# Removed ls -l /app
# RUN ls -l /app

# ---- Production Stage ----
# This is the final, optimized image that will be run.\nFROM base AS runner

ENV NODE_ENV=production
# The README mentions the app runs on port 8000.
# The `next start` command respects the PORT environment variable.
ENV PORT=8000

# Create a non-root user for better security.
RUN addgroup -S -g 1001 nodejs
RUN adduser -S -u 1001 nextjs

# Copy only necessary files from previous stages
# Attempt to copy public from both potential locations on separate lines
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/package.json /app/package-lock.json* ./

# Switch to the non-root user
USER nextjs

# Install only production dependencies.\nRUN npm install --production --frozen-lockfile

# Expose the port the app will run on
EXPOSE 8000

# The command to start the Next.js server
# Assumes your package.json has a \"start\": \"next start\" script.
CMD [\"npm\", \"start\"]
