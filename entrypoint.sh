#!/bin/sh
# This script is the entrypoint for the Docker container.
# It prepares the environment and then starts the main application.

echo "Container is starting..."

# Create logs directory and set permissions
echo "Ensuring logs directory exists and has correct permissions..."
mkdir -p logs
chown -R appuser:appgroup logs

# Run the database seed script
# Since the script is now idempotent, it's safe to run on every start.
echo "Running DB seed to ensure database is up to date..."
npm run db:seed

echo "DB seed finished. Starting server..."

# Execute the main command (starts the server)
exec "$@"