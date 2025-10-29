# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Create the production image
FROM node:22-alpine

WORKDIR /usr/src/app

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only production dependencies definitions
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy the entrypoint script and give ownership to the new user
COPY --chown=appuser:appgroup entrypoint.sh .
RUN chmod +x entrypoint.sh

# Switch to the non-root user
USER appuser

# Expose the port
EXPOSE 3000

# Set the entrypoint
ENTRYPOINT ["./entrypoint.sh"]

# Define the default command
CMD [ "node", "dist/server.js" ]
