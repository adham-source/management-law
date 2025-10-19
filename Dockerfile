
# 1. Use an official Node.js runtime as a parent image
FROM node:18-alpine

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

# 7. Expose the port the app runs on
EXPOSE 3000

# 8. Define the command to run the application
CMD [ "node", "dist/server.js" ]
