# Tài liệu cho AuthResolver

## Tổng quan

Tệp này định nghĩa và xây dựng một GraphQL schema bằng cách sử dụng thư viện `type-graphql`. Nó tập hợp các resolver và middleware cần thiết để xử lý các truy vấn và đột biến trong ứng dụng.

## Import các thành phần cần thiết

```typescript
import { buildSchema } from "type-graphql";

import { AuthorizationMiddleware } from "../../core/middleware/auth";
import { AuthResolver } from "./auth.resolver";
import { ChatResolver } from "./chat.resolver";
import { EmitEventResolver } from "./emit_events.resolver";
import { PostResolver } from "./post.resolver";
import { ReactionResolver } from "./reaction.resolver";
import { RelationshipResolver } from "./relationship.resolver";
import { SystemResolver } from "./system.resolver";
```

- `buildSchema`: Hàm từ `type-graphql` để tạo schema cho GraphQL.
- `AuthorizationMiddleware`: Middleware để kiểm tra quyền truy cập trước khi thực hiện truy vấn.
- Các resolver (`AuthResolver`, `ChatResolver`, `EmitEventResolver`, `PostResolver`, `ReactionResolver`, `RelationshipResolver`, `SystemResolver`) chịu trách nhiệm xử lý logic cho từng loại tài nguyên.

## Biến `publicFunctions`

```typescript
export const publicFunctions = ["AuthResolver"];
```

- Danh sách chứa các resolver có thể được sử dụng công khai mà không cần xác thực.
- Trong trường hợp này, `AuthResolver` là resolver công khai (có thể là để đăng nhập, đăng ký tài khoản, v.v.).

## Xây dựng Schema

```typescript
export default buildSchema({
  validate: false,
  resolvers: [
    SystemResolver,
    EmitEventResolver,
    AuthResolver,
    PostResolver,
    ReactionResolver,
    RelationshipResolver,
    ChatResolver,
  ],
  globalMiddlewares: [AuthorizationMiddleware],
});
```

- `validate: false`: Vô hiệu hóa validation schema tự động của `type-graphql`.
- `resolvers`: Danh sách các resolver được sử dụng trong schema.
- `globalMiddlewares`: Middleware áp dụng cho tất cả các resolver, trong trường hợp này là `AuthorizationMiddleware` để kiểm tra quyền truy cập trên toàn hệ thống.

## AuthResolver

### Tổng quan

`AuthResolver` là resolver xử lý các chức năng liên quan đến xác thực và người dùng, bao gồm đăng nhập, đăng ký, xác thực OTP, đặt lại mật khẩu, đăng xuất và cập nhật thông tin người dùng.

### Các truy vấn và đột biến chính

#### `hello`
- Kiểm tra xem người dùng có tồn tại không.
- Trả về chuỗi chào kèm theo tên người dùng.

#### `getUsers`
- Lấy danh sách tất cả người dùng trong hệ thống.

#### `register`
- Đăng ký người dùng mới.
- Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu.
- Gán quyền mặc định `member` cho người dùng mới.

#### `login`
- Xác thực người dùng dựa trên email và mật khẩu.
- Nếu thông tin hợp lệ, trả về `accessToken` và `refreshToken`.

#### `forgotPassword`
- Gửi mã OTP đến email người dùng để đặt lại mật khẩu.

#### `submitOTP`
- Xác nhận mã OTP do người dùng nhập.
- Nếu hợp lệ, tạo token để đặt lại mật khẩu.

#### `resetPassword`
- Đặt lại mật khẩu mới sau khi xác thực OTP.

#### `logout`
- Xóa token của người dùng và làm sạch cookie `refreshToken`.

#### `updateUser`
- Cập nhật thông tin cá nhân của người dùng như tên hoặc avatar.

## Kết luận

- `AuthResolver` cung cấp các chức năng xác thực và quản lý người dùng trong hệ thống.
- Middleware được sử dụng để bảo vệ các endpoint yêu cầu xác thực.
- Các quy trình như đăng ký, đăng nhập, quên mật khẩu đều được xử lý an toàn với mã hóa mật khẩu và mã OTP.

Tài liệu này giúp bạn hiểu rõ hơn về cách tổ chức và hoạt động của resolver trong dự án.

