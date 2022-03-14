

FROM node:14

WORKDIR /app

COPY . .

RUN npm install
RUN npm install @cnv-platform/cnv-pluggins@latest

RUN npm run build

WORKDIR /app/dist

EXPOSE 3000
EXPOSE 1880

CMD ["npm", "run", "start:prod"]
