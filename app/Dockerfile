# Use a workdir other than /app so Vite's resolve.alias "/app" -> "<root>/app"
# does not double-map when React Router emits paths under /app/app/...
FROM node:20-alpine AS development-dependencies-env
COPY . /workspace
WORKDIR /workspace
RUN npm ci --include=dev

FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /workspace/
WORKDIR /workspace
RUN npm ci --omit=dev

FROM node:20-alpine AS build-env
ARG VITE_API_ENDPOINT=http://localhost:8090
ARG VITE_PUBLIC_POCKETBASE_URL=http://localhost:8090
ENV VITE_API_ENDPOINT=$VITE_API_ENDPOINT
ENV VITE_PUBLIC_POCKETBASE_URL=$VITE_PUBLIC_POCKETBASE_URL
COPY . /workspace/
COPY --from=development-dependencies-env /workspace/node_modules /workspace/node_modules
WORKDIR /workspace
RUN npm run build

FROM node:20-alpine
COPY ./package.json package-lock.json /workspace/
COPY --from=production-dependencies-env /workspace/node_modules /workspace/node_modules
COPY --from=build-env /workspace/build /workspace/build
WORKDIR /workspace
CMD ["npm", "run", "start"]
