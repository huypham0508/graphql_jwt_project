# Tài liệu: Cấu hình Schema GraphQL với Type-GraphQL

## Tổng quan
Module này định nghĩa và xây dựng một schema GraphQL bằng cách sử dụng gói `type-graphql`. Nó tích hợp nhiều resolver để xử lý các phần khác nhau của logic nghiệp vụ ứng dụng và áp dụng một middleware ủy quyền toàn cục.

## Các phụ thuộc
- `type-graphql`: Được sử dụng để định nghĩa và xây dựng schema GraphQL.
- Các resolver tùy chỉnh:
  - `AuthResolver`: Xử lý các hoạt động liên quan đến xác thực.
  - `ChatResolver`: Quản lý chức năng chat.
  - `EmitEventResolver`: Xử lý phát sự kiện theo thời gian thực.
  - `PostResolver`: Quản lý bài viết của người dùng.
  - `ReactionResolver`: Xử lý các phản ứng đối với bài viết.
  - `RelationshipResolver`: Quản lý mối quan hệ giữa người dùng (ví dụ: bạn bè, theo dõi).
  - `SystemResolver`: Quản lý các truy vấn và thay đổi liên quan đến hệ thống.
- `AuthorizationMiddleware`: Một middleware toàn cục được áp dụng cho tất cả các resolver để kiểm soát truy cập.

## Các chức năng công khai
Một mảng có tên `publicFunctions` được định nghĩa, liệt kê các resolver có thể truy cập công khai mà không cần xác thực. Hiện tại, chỉ có `AuthResolver` được đặt là công khai.

## Cấu hình Schema
Hàm `buildSchema` từ `type-graphql` được sử dụng để xây dựng schema GraphQL với các tùy chọn sau:
- `validate: false`: Tắt kiểm tra hợp lệ tự động của schema.
- `resolvers`: Liệt kê tất cả các resolver định nghĩa API GraphQL.
- `globalMiddlewares`: Áp dụng `AuthorizationMiddleware` để thực thi xác thực và ủy quyền trên toàn bộ schema.

## Phân tích mã nguồn
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

export const publicFunctions = ["AuthResolver"];

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

## Những điểm chính
- Module này xây dựng một schema GraphQL bằng `type-graphql`.
- Schema bao gồm nhiều resolver chịu trách nhiệm cho các chức năng khác nhau.
- `AuthorizationMiddleware` được áp dụng toàn cục để thực thi xác thực.
- `AuthResolver` có thể truy cập công khai, trong khi các resolver khác có thể yêu cầu xác thực.

## Cách sử dụng
Cấu hình schema này nên được nhập và sử dụng trong thiết lập máy chủ GraphQL để hiển thị các resolver đã định nghĩa và thực thi middleware xác thực.

---
Tài liệu này cung cấp cái nhìn tổng quan về mục đích, cấu trúc và chức năng của mã nguồn, giúp các nhà phát triển dễ dàng hiểu và duy trì thiết lập schema GraphQL.

