# syntax=docker/dockerfile:1
FROM node:18
WORKDIR /app
COPY . /app/
RUN yarn install && yarn build:mod

ENTRYPOINT [ "node", "./dist/moderator/index.js" ]
