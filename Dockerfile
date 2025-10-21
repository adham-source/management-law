
# 1. Use an official Node.js runtime as a parent image
FROM node:22-alpine

# 2. Set the working directory in the container
WORKDIR /usr/src/app

# 3. Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# 4. Install application dependencies
RUN npm install

# 5. Copy the rest of the application source code
COPY . .

# 6. Build the TypeScript code to JavaScript
RUN npm run build

# Copy the entrypoint script and make it executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Expose the port the app runs on
EXPOSE 3000

# Set the entrypoint script to be executed when the container starts
ENTRYPOINT ["./entrypoint.sh"]

# Define the command to run the application (which is passed to the entrypoint)
CMD [ "node", "dist/server.js" ]
