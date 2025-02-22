### Các thư viện cần thiết

- import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
- import { VerifyTokenAll } from "../../core/middleware/auth";
- import Post from "../../core/models/post/post.model";
- import Reaction from "../../core/models/reaction/reaction.model.ts";
- import User from "../../core/models/user/user.model";
- import { Context } from "../../core/types/Context";
- import { CreateReactionInput } from "../../core/types/input/reaction/CreateReactionInput";
- import { CreateReactionResponse } from "../../core/types/response/reaction/CreateReactionResponse";
- import { GetReactionsResponse } from "../../core/types/response/reaction/GetReactionsResponse";

### Middleware

- Mô tả: Xác thực người dùng trước khi thực hiện các hành động liên quan đến reaction.
- Nếu người dùng không đăng nhập hoặc token không hợp lệ, middleware sẽ trả về lỗi và ngừng hoạt động.

### reactions()

- Mô tả: Truy vấn danh sách tất cả reactions có trong hệ thống.
- Biến: Không có biến truyền vào.
- Kết quả trả về:
- Code 200: Thành công.
- Code 400: Lỗi hệ thống.
- Success: Trạng thái thành công (true/false).
- Message: Thông báo phản hồi.
- Data: Mảng danh sách reaction.
    ```
        query {
            reactions {
                code
                success
                message
                    data {
                    id
                    name
                    imageURL
                    }
            }
        }
    ```

### createReaction()
- Mô tả: Tạo mới một reaction trong hệ thống.
- Biến:
- reactionInput: Đối tượng chứa dữ liệu reaction.
- name: Tên của reaction.
- imageURL: URL hình ảnh của reaction.
- Context:
- Kiểm tra người dùng có tồn tại không trước khi tạo reaction.
- Kết quả trả về:
    - Code 200: Thành công.
    - Code 404: Không tìm thấy người dùng.
    - Code 500: Lỗi hệ thống.
    - Success: Trạng thái thành công (true/false).
    - Message: Thông báo phản hồi.
    - Data: Thông tin reaction vừa tạo.

    ```
        mutation {
            createReaction(reactionInput: { name: "Love", imageURL: "https://www.example.com/love.png" }) {
                code
                success
                message
                    data {
                    id
                    name
                    imageURL
                    }
            }
        }
    ```
