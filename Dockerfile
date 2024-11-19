FROM node:20.18-alpine

WORKDIR /app

RUN chown -R node:node /app

COPY . .

RUN npm install
RUN npx prisma generate

USER node

EXPOSE 5001

CMD [ "npm", "run", "start" ]