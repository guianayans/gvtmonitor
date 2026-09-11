FROM node:20 AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
RUN npm run build

FROM node:20 AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend .
COPY --from=frontend /app/frontend/dist ./public
RUN npm run build && npm prune --omit=dev

ENV PORT=3030
EXPOSE 3030

CMD ["node", "dist/server.js"]
