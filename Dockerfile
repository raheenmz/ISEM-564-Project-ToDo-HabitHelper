FROM node:24-slim

WORKDIR /app

COPY . .

RUN corepack enable
RUN pnpm install --frozen-lockfile

ENV PORT=8080
ENV BASE_PATH=/
ENV NODE_ENV=production

RUN pnpm --filter @workspace/task-force run build
RUN pnpm --filter @workspace/api-server run build

EXPOSE 8080

CMD ["node", "artifacts/api-server/dist/index.mjs"]
