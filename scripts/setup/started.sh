docker run -d --name redis-stack-server -p 6379:6379 redis/redis-stack-server:latest
docker run -d -p 27017:27017 --name database_graph_ql mongo:latest

./tools/mongodb-database-tools-macos-arm64-100.11.0/bin/mongodump --uri "mongodb+srv://admin2:oORArVKaZaSxgjfb@cluster0.37vmswz.mongodb.net/test" \
    --out ./backup_database/

./tools/mongodb-database-tools-macos-arm64-100.11.0/bin/mongorestore \
    --uri "mongodb://localhost:27017/database_graph_ql" \
    --dir ./backup_database/test

npm i
npm run build
