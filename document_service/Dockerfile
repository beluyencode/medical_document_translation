# Use the official Node.js image from the Docker Hub
FROM node:22-bullseye

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

RUN mkdir -p uploads

RUN mkdir -p pdf

RUN mkdir -p public

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]