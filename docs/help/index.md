# Resolvers

## Giới thiệu
Project sử dụng: Node.js 13 (Typescript), GraphQL, MongooseDB, Redis 
Đây là hướng dẫn cách cài đặt source code cho developer.
## Cài đặt
### Hướng dẫn cài đặt

1. Clone source code

```
git clone https://github.com/huypham0508/graphql_jwt_project.git
cd graphql_jwt_project
```

2. Chạy lệnh bash scripts/setup/started.sh để kéo các package cần thiết để start

```shell
bash scripts/setup/started.sh
```

3. Sau đó chạy npm start

```shell
npm run dev
```

### Mô tả các công nghệ sử dụng trong dự án
- Typescript: Thay thế cho Javascript, giúp kiểm tra lỗi trước khi chạy mã và cung cấp tính năng mới như kiểu dữ liệu tĩnh và các tính năng ECMAScript mới
- nodemon: Nodemon là một công cụ giúp theo dõi các thay đổi trong mã nguồn và tự động khởi động lại máy chủ Node.js mỗi khi có thay đổi, giúp quá trình phát triển trở nên linh hoạt và nhanh chóng.
- graphql: GraphQL là một ngôn ngữ truy vấn dành cho API và một runtime cho thực thi các truy vấn với dữ liệu có tự mô tả. Nó cho phép các khách hàng yêu cầu chỉ các dữ liệu mà họ cần và không gì nhiều hơn.
- mongoose: Mongoose là một thư viện ODM (Object Data Modeling) cho Node.js và MongoDB. Nó cho phép bạn định nghĩa các mô hình dữ liệu và tương tác với cơ sở dữ liệu MongoDB
- apollo-server: Apollo Server là một thư viện mã nguồn mở được sử dụng để xây dựng các GraphQL server trong các ứng dụng Node.js. Nó cung cấp các tính năng như truy vấn, mutation, và subscription, cũng như các công cụ để phân tích và thực thi truy vấn GraphQL.

### Hướng dẫn cài đặt các dependencies
- [Cài đặt Redis cho Windows](redis.md)

## Documents chi tiết của tài nguyên
- [Redis](https://redis.io/docs/latest/operate/)
- [Typescript](https://www.typescriptlang.org/docs/)
- [Nodemon](https://github.com/remy/nodemon#nodemon)
- [GraphQL](https://graphql.org/learn/)
- [Mongoose](https://mongoosejs.com/docs/api/document.html)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server)
