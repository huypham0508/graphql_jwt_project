FROM node:lts-alpine

WORKDIR /app_node_with_graphql

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 4000

CMD ["node", "./dist/src/server.js"]
