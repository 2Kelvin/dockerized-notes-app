FROM node:alpine
WORKDIR /notes-app-api
COPY package.json package-lock.json ./
RUN npm ci
COPY server.js ./
CMD [ "npm", "start" ]