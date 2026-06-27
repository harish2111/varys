# Multi-stage build for any Varys service. Build with:
#   docker build --build-arg SERVICE=qa-gateway -t varys/qa-gateway .
# doc-ingestor additionally needs Chromium (Playwright) — see the doc-ingestor overlay note.
ARG SERVICE=qa-gateway

FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps ./apps
RUN pnpm install --frozen-lockfile
RUN pnpm build
RUN pnpm deploy --filter "@varys/${SERVICE}" --prod /deploy

FROM base AS runtime
ARG SERVICE
ENV NODE_ENV=production
ENV SERVICE=${SERVICE}
COPY --from=build /deploy /app
USER node
CMD ["node", "dist/main.js"]
