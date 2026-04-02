FROM node:alpine AS building_phase
WORKDIR /notes-api-build
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
# removing any dev dependencies that were previously installed
RUN npm prune --production

FROM node:alpine AS production_phase
WORKDIR /notes-api
COPY --from=building_phase /notes-api-build/node_modules ./node_modules
COPY --from=building_phase /notes-api-build/server.js ./
CMD [ "node", "server.js" ]