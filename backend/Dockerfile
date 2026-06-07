FROM node:20-alpine

RUN apk update && apk add --no-cache libstdc++ git

WORKDIR /app/backend
RUN chown -R node:node /app

USER node

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 8000

CMD ["npm", "run", "dev"]