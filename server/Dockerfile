FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY bun.lock package.json tsconfig.json turbo.json /temp/dev/
COPY client /temp/dev/client
COPY server /temp/dev/server
COPY shared /temp/dev/shared
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY bun.lock package.json tsconfig.json turbo.json /temp/prod/
COPY client /temp/prod/client
COPY server /temp/prod/server
COPY shared /temp/prod/shared
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

RUN bun --version
RUN bunx tsc --version

# [optional] tests & build
ENV NODE_ENV=production
# RUN bun test
RUN bun run build:server

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/server ./server
COPY --from=prerelease /usr/src/app/package.json .

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "server/src/index.ts" ]
