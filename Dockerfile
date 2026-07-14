FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install
FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
FROM node:22-alpine AS prod
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY .env.example ./.env.example
EXPOSE 3001
CMD ["node","dist/server.js"]
