

FROM node:14

WORKDIR /app

COPY . .

RUN npm install
COPY --chown=node-red:root .npmrc ./
RUN echo "@vv-conversation-platform:registry=https://europe-central2-npm.pkg.dev/vv-conversation-platform/conversation-vv/" >> .npmrc
RUN npm install @vv-conversation-platform/cnv-dialog@1.61.0 && npm install @vv-conversation-platform/cnv-server@1.31.0



RUN npm run build

WORKDIR /app/dist

EXPOSE 3000
EXPOSE 1880

CMD ["npm", "run", "start:prod"]
