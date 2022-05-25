

FROM node:14 as builder

WORKDIR /app

COPY . .

RUN npm install
RUN npm install @cnv-platform/cnv-pluggins@latest

RUN npm run build


FROM node:14

COPY --from=builder /app/node_modules/ /app/node_modules
COPY --from=builder /app/dist/ /app/dist
COPY --from=builder /app/package.json /app/

WORKDIR /app/dist


EXPOSE 3000
EXPOSE 1880

CMD ["npm", "run", "start:prod"]

