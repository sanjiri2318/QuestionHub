FROM node:22-alpine AS builder

WORKDIR /app
COPY server/package*.json ./
COPY server/prisma ./prisma
RUN npm install

COPY server/ ./
RUN npx prisma generate && npm run build

FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push && npm start"]