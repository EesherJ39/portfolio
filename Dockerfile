FROM node:22-bookworm-slim AS build

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-latex-base texlive-latex-recommended texlive-latex-extra lmodern poppler-utils
RUN npm install --global pnpm@11.19.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV WRANGLER_SEND_METRICS=false

RUN npm install --global pnpm@11.19.0
COPY --from=build /app ./

EXPOSE 3000

CMD ["pnpm", "exec", "vinext", "start", "--hostname", "0.0.0.0", "--port", "3000"]
