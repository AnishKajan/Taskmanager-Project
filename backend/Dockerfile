FROM --platform=linux/arm64 node:18-alpine

# Install necessary tools to compile native modules like bcrypt
RUN apk add --no-cache make gcc g++ python3

WORKDIR /app

# Copy only dependency-related files first to cache this layer
COPY package*.json ./

# Use npm install since you may not have a lock file yet
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 5000
CMD ["npx", "nodemon", "server.js"]
