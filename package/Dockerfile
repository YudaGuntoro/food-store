FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_STORE_WHATSAPP
ARG NEXT_PUBLIC_STORE_INSTAGRAM
ARG NEXT_PUBLIC_STORE_TIKTOK
ARG NEXT_PUBLIC_STORE_EMAIL
ENV NEXT_PUBLIC_STORE_WHATSAPP=${NEXT_PUBLIC_STORE_WHATSAPP} \
    NEXT_PUBLIC_STORE_INSTAGRAM=${NEXT_PUBLIC_STORE_INSTAGRAM} \
    NEXT_PUBLIC_STORE_TIKTOK=${NEXT_PUBLIC_STORE_TIKTOK} \
    NEXT_PUBLIC_STORE_EMAIL=${NEXT_PUBLIC_STORE_EMAIL}
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
