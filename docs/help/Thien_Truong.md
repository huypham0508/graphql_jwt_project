# README

## ` CẤU TRÚC FILE DỰ ÁN `

### DOCS
Nơi lưu trữ các file giới thiệu, ghi chú, hướng dẫn, setup của dự án.

### NODE_MODULE
- Chứa tất cả các package (thư viện) mà dự án cần để chạy.
- Cách để tạo chạy lệnh: ```npm install``` hoặc ```yarn install``` (nếu sử dụng yarn).

### SCRIPTS
- Cài đặt kết nối ```docker, redis, mongoose```
- Tạo mới phiên bản cho app.

###  SRC
    ## File app.ts
        - Kết nối các thư viện, đồng thời khởi tạo Express App và HTTP Server để chạy API.
        - Tạo kết nối để có thể chấp nhận các request từ domain khác (app.use(cors())).
        - Hỗ trợ đọc cookie từ request (app.use(cookieParser())).
        - Giúp Express xử lý dữ liệu Json từ request (app.use(bodyParser.json())).

    ## File graphql_app.ts
        - Kết nối thư viện Apollo Server.
        - Khởi tạo Apollo Server.
        - Xuất hàm để sử dụng ở file cần kết nối.

1/ App

- File config: Cấu hình những thứ cần thiết cho dự án.

    - ``` Cấu hình đường dẫn mongodb ```
    - ``` Cấu hình server, port, window_ms, max_requests ```
    - ``` Cấu hình jwt, token, private_key, cookie ```
    - ``` Cấu hình role ```
    - ``` Cấu hình bcrypt, hashpassword ```
    - ``` Cấu hình otp ```
    - ``` Cấu hình redis ```

2/ Core: Thư mục chứa thành phần cốt lõi của dự án.

- Bcrypt: Tạo hàm để phân mảnh mật khẩu và kiểm tra mật khẩu sau khi được phân mảnh.
- Contants: Khai báo các giá trị hằng số trong toàn bộ ứng dụng.
- Enum: Khai báo các giá trị hằng số theo nhóm, dễ quản lý và tránh được sai sót khi sử dụng.
- Middleware: File trung gian để xử lý các yêu cầu của Client trước khi đến route hoặc response.
- Models: Khai báo các mô hình kiểu dữ liệu có trong dự án.
- Queue: Xử lý các công việc bất đồng bộ mà không làm ảnh hưởng đến hiệu suất của server.
- Services: Kết nối dữ liệu từ database và redis.
- Types: Định nghĩa các kiểu dữ liệu, interface (input, response, system)
- Utils: Khai báo các hàm có thể tái sử dụng nhiều lần trong dự án.

3/ V1: File chứa API phiên bản 1.

- Controllers: Chứa các file xử lý logic API.
    - Xử lý logic liên quan đến các sự kiện.
    - Xử lý logic liên quan đến JWT (refresh_token).
    - Xử lý logic upload hình ảnh.

- Resolvers: Chứa các file điều khiển và xử lý tác vụ.

    ``` index.ts là file tập hợp và xuất dữ liệu của tất cả các resolvers để sử dụng ```
    - Xử lý Authencation (đăng nhập, đăng ký).
    - Xử lý tin nhắn chat.
    - Xử lý các bài viết.
    - Xử lý phân loại mối quan hệ người dùng.
    - Xử lý thông tin hệ thống

- Routes: Chứa các định nghĩa route
    - Định nghĩa route cho sự kiện.
    - Định nghĩa route cho việc xử lý refresh_token.