FROM --platform=linux/arm64 node:18-alpine
 
# Install dependencies needed for bcrypt
RUN apk add --no-cache make gcc g++ python3
 
# Create app directory
WORKDIR /app
 
# Copy package.json and package-lock.json
COPY package*.json ./
 
# Install dependencies
RUN npm ci
 
# Rebuild bcrypt specifically for ARM architecture
RUN npm rebuild bcrypt --build-from-source
 
# Install development tools
RUN npm install -g nodemon
 
# Copy application code
COPY . .
 
# Expose port
EXPOSE 5001
 
# Command to run the application
CMD ["npx", "nodemon", "server.js"]FROM --platform=linux/arm64 node:18-alpine
 
# Install dependencies needed for bcrypt
RUN apk add --no-cache make gcc g++ python3
 
# Create app directory
WORKDIR /app
 
# Copy package.json and package-lock.json
COPY package*.json ./
 
# Install dependencies
RUN npm ci
 
# Rebuild bcrypt specifically for ARM architecture
RUN npm rebuild bcrypt --build-from-source
 
# Install development tools
RUN npm install -g nodemon
 
# Copy application code
COPY . .
 
# Expose port
EXPOSE 5001
 
# Command to run the application
CMD ["npx", "nodemon", "server.js"]