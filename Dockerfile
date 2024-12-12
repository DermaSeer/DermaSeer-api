FROM node:20.18.1-bullseye

WORKDIR /app

RUN chown -R node:node /app

COPY . .

RUN npm install
RUN npx prisma generate
RUN npx prisma migrate deploy

USER node

EXPOSE 5001

CMD [ "npm", "run", "start" ]