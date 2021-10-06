

FROM node:14

WORKDIR /app

COPY . .

RUN npm install && \
    npm run build

WORKDIR /app/dist

EXPOSE 3000
EXPOSE 1880

CMD ["npm", "run", "start:prod"]
