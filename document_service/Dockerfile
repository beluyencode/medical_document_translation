# Use the official Node.js image
FROM node:22-bullseye

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Create necessary directories
RUN mkdir -p uploads pdf public

# Copy the rest of the application
COPY . .

# Ensure node_modules exists
RUN ls -la node_modules || npm install --production

# Expose the app port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]