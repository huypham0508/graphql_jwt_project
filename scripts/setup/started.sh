docker run -d --name redis-stack-server -p 6379:6379 redis/redis-stack-server:latest
docker run -d -p 27017:27017 --name database_graph_ql mongo:latest

npm i
npm run build
