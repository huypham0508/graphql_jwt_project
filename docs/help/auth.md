# Tài liệu Xác thực và Quản lý Token

## 1. Giới thiệu về Authentication

Authentication (xác thực) là quá trình xác minh danh tính người dùng trong hệ thống. Trong dự án này, authentication được thực hiện thông qua JWT (JSON Web Token).

## 2. Các thư viện và module hỗ trợ

Hệ thống sử dụng các thư viện và module sau để hỗ trợ xác thực:

```typescript
import { AuthenticationError } from "apollo-server-express";
import { decode, Secret, sign, verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import { ConfigJWT } from "../../config";
import User from "../models/user/user.model";
import { Context } from "../types/Context";
import { UserAuthPayload } from "../types/UserAuthPayload";
```

## 3. Cấu trúc Token

Token bao gồm 3 phần chính:

- **Header**: Chứa thông tin về loại token và thuật toán mã hóa
- **Payload**: Chứa các claims (thông tin) về người dùng
- **Signature**: Được tạo bằng cách mã hóa header và payload

## 4. Tạo Token

Token được tạo trong `AuthMiddleware.createToken`:

```typescript
const token = sign(user, ConfigJWT.JWT_ACCESS_PRIVATE_KEY as Secret, {
  expiresIn: "365d",
});
```

## 5. Gắn Token vào Header

Để sử dụng token trong các request GraphQL, cần gắn token vào header Authorization theo định dạng:

```
Authorization: Bearer <token>
```

Ví dụ:

```javascript
fetch("/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer <token>",
  },
  body: JSON.stringify({ query: `{ hello }` }),
});
```

## 6. Xác thực Token

Token được xác thực trong `AuthMiddleware.verifyToken`:

```typescript
const authHeader = context.req.header("Authorization");
const token = authHeader?.split(" ")[1];
const decoded = verify(token, ConfigJWT.JWT_ACCESS_PRIVATE_KEY);
```

## 7. Refresh Token

Hệ thống sử dụng refresh token để cấp mới access token:

```typescript
res.cookie(ConfigJWT.REFRESH_TOKEN_COOKIE_NAME, token, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
});
```

## 8. Xử lý lỗi

Các lỗi phổ biến:

- `No token provided`: Không có token trong request
- `Invalid token`: Token không hợp lệ
- `Unauthorized role`: Người dùng không có quyền truy cập

## 9. Best Practices

1. Luôn sử dụng HTTPS để truyền token
2. Đặt thời gian hết hạn hợp lý cho token
3. Sử dụng refresh token để tăng tính bảo mật
4. Xóa token khi người dùng đăng xuất
5. Kiểm tra tính hợp lệ của token trước khi sử dụng

## 10. Kết luận

Quản lý token an toàn là một phần quan trọng trong việc bảo vệ hệ thống xác thực của ứng dụng. Việc sử dụng JWT giúp đơn giản hóa quy trình xác thực và cung cấp một cách an toàn để truyền thông tin giữa client và server. Đảm bảo rằng các token được tạo, xác thực và quản lý đúng cách sẽ giúp bảo vệ dữ liệu người dùng và ngăn chặn các truy cập trái phép.
