docker run -d --name redis-stack-server -p 6379:6379 redis/redis-stack-server:latest
docker run -d -p 27017:27017 --name database_graph_ql mongo:latest

OS="$(uname -s)"
path_tool="mongodb-database-tools-macos-arm64-100.11.0" # Mặc định macOS

case "$OS" in
    Linux*) echo "Chạy trên Linux" ;;
    Darwin*) echo "Chạy trên macOS" ;;
    CYGWIN*|MINGW*|MSYS*) path_tool="mongodb-database-tools-windows-x86_64-100.11.0" ;;
esac

# Backup & Restore MongoDB
./tools/$path_tool/bin/mongodump --uri "mongodb+srv://admin2:oORArVKaZaSxgjfb@cluster0.37vmswz.mongodb.net/test" \
    --out ./backup_database/

./tools/$path_tool/bin/mongorestore \
    --uri "mongodb://localhost:27017/database_graph_ql" \
    --dir ./backup_database/test

npm install
npm run build
