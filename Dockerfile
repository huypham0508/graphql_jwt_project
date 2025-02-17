FROM node:20.10.0

WORKDIR /app_node_with_graphql

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p dist/public && npm run build

EXPOSE 4000

CMD ["npm", "run", "start"]
