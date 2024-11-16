FROM node:20-alpine3.20

WORKDIR /app

COPY . .

RUN npm install
RUN npx prisma migrate

USER node

EXPOSE 5001

CMD [ "npm", "run", "start" ]