# README

<h1 align="center" style="font-size: 30px; color: green">Node.js 13 (Typescript) + GraphQL + MongooseDB</h1>

### Quy định về việc sử dụng GitHub

1. Tạo tên nhánh mới sẽ được branch từ nhánh develop, nếu là tính năng mới thì đặt features/ten-tinh-nang-moi (không đặt tên theo cá nhân), nếu là bugs của tính năng đó thì cần đặt features/ten-tinh-nang-moi/ten-hoac-ma-bug
2. Xong task, cần tạo pull request (PR) đến nhánh develop (tránh tự merge vào nhánh develop).
3. Vì hệ thống sẽ setup CI/CD, ai tự merge hệ thống sẽ auto-deploy.

## `HƯỚNG DẪN SETUP`

### Setup

1. clone source code

```
git clone https://github.com/huypham0508/graphql_jwt_project.git
cd graphql_jwt_project
```

2. chạy lệnh npm i để kéo các package cần thiết để start

```shell
npm i
```

3. sau đó chạy npm start

```shell
npm start
```

### Mô tả các lệnh trong dự án

Trong dự án này, chúng ta có một số lệnh scripts được định nghĩa trong tệp `package.json` để giúp quản lý và phát triển ứng dụng Node.js.

- `npm run server` : Lệnh này khởi động máy chủ bằng file server.js trong thư mục dist/src(Thư mục đã được build) bằng nodemon.
- `npm run production` : Lệnh này khởi động máy chủ trong môi trường sản phẩm (production) bằng file server.js trong thư mục dist/src bằng node.
- `npm run build` : Lệnh này dùng để xây dựng ứng dụng bằng TypeScript Compiler (tsc). Nó xóa thư mục dist trước khi biên dịch lại toàn bộ mã nguồn từ TypeScript sang JavaScript.

### Mô tả các công nghệ sử dụng trong dự án

- `Typescript`: Thay thế cho Javascript, giúp kiểm tra lỗi trước khi chạy mã và cung cấp tính năng mới như kiểu dữ liệu tĩnh và các tính năng ECMAScript mới
- `nodemon`: Nodemon là một công cụ giúp theo dõi các thay đổi trong mã nguồn và tự động khởi động lại máy chủ Node.js mỗi khi có thay đổi, giúp quá trình phát triển trở nên linh hoạt và nhanh chóng.
- `graphql`: GraphQL là một ngôn ngữ truy vấn dành cho API và một runtime cho thực thi các truy vấn với dữ liệu có tự mô tả. Nó cho phép các khách hàng yêu cầu chỉ các dữ liệu mà họ cần và không gì nhiều hơn.
- `mongoose`: Mongoose là một thư viện ODM (Object Data Modeling) cho Node.js và MongoDB. Nó cho phép bạn định nghĩa các mô hình dữ liệu và tương tác với cơ sở dữ liệu MongoDB
- `apollo-server`: Apollo Server là một thư viện mã nguồn mở được sử dụng để xây dựng các GraphQL server trong các ứng dụng Node.js. Nó cung cấp các tính năng như truy vấn, mutation, và subscription, cũng như các công cụ để phân tích và thực thi truy vấn GraphQL.
