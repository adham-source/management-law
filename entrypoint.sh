
#!/bin/sh
# This script is the entrypoint for the Docker container.
# It runs the database seed command and then starts the main application.

echo "Container is starting..."

# Run the database seed script
# Since the script is now idempotent, it's safe to run on every start.
echo "Running DB seed to ensure database is up to date..."
npm run db:seed

echo "DB seed finished. Starting server..."

# Execute the main command (starts the server)
exec "$@"
