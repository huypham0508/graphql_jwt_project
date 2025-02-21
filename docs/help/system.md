# Tài liệu về SystemResolver

## Tổng quan
`SystemResolver` là một GraphQL resolver cung cấp các chức năng liên quan đến metadata của hệ thống và kiểm soát truy cập dựa trên vai trò. Nó bao gồm các truy vấn để lấy danh sách resolver, danh sách vai trò, cũng như một mutation để thêm quyền vào vai trò.

## Phụ thuộc
- `type-graphql`: Dùng để định nghĩa các GraphQL resolver, query và mutation.
- `MetadataStorage`: Để truy cập thông tin metadata về các truy vấn, mutation và subscription.
- `VerifyTokenAll`: Middleware dùng để xác thực.
- `Role`: Mongoose model đại diện cho các vai trò trong hệ thống.
- `Context`, `ResponseData`, `AllResolverResponse`, `RolesResponse`: Các kiểu dữ liệu dùng để định nghĩa phản hồi và ngữ cảnh yêu cầu.

## Các Query

### `allResolvers`
Truy xuất tất cả các truy vấn, mutation và subscription có trong schema GraphQL.

#### Định nghĩa
```typescript
@Query((_return) => AllResolverResponse)
@UseMiddleware(VerifyTokenAll)
async allResolvers(@Ctx() _: Context): Promise<AllResolverResponse>
```

#### Middleware
- `VerifyTokenAll`: Đảm bảo chỉ có người dùng đã xác thực mới có thể truy cập truy vấn này.

#### Phản hồi
Trả về một đối tượng `AllResolverResponse` chứa danh sách tất cả các query, mutation và subscription có trong hệ thống.

#### Ví dụ phản hồi
```json
{
  "code": 200,
  "success": true,
  "data": [
    { "name": "roles", "resolver": "SystemResolver", "type": "Query" },
    { "name": "addPermissionToRole", "resolver": "SystemResolver", "type": "Mutation" }
  ]
}
```

---

### `roles`
Lấy danh sách tất cả các vai trò trong hệ thống.

#### Định nghĩa
```typescript
@Query((_return) => RolesResponse)
@UseMiddleware(VerifyTokenAll)
async roles(): Promise<RolesResponse>
```

#### Middleware
- `VerifyTokenAll`: Đảm bảo chỉ có người dùng đã xác thực mới có thể truy vấn dữ liệu.

#### Phản hồi
Trả về một đối tượng `RolesResponse` chứa danh sách các vai trò. Nếu không có vai trò nào, thông báo danh sách rỗng sẽ được trả về.

#### Ví dụ phản hồi
```json
{
  "code": 200,
  "success": true,
  "message": "Thành công",
  "data": [
    { "_id": "123", "name": "Admin", "permissions": ["read", "write"] }
  ]
}
```

---

## Mutation

### `addPermissionToRole`
Thêm một quyền vào vai trò có sẵn.

#### Định nghĩa
```typescript
@Mutation(() => ResponseData)
@UseMiddleware(VerifyTokenAll)
async addPermissionToRole(
  @Arg("roleId") roleId: string,
  @Arg("permission") permission: string
): Promise<ResponseData>
```

#### Middleware
- `VerifyTokenAll`: Đảm bảo chỉ có người dùng đã xác thực mới có thể thực hiện mutation này.

#### Tham số
| Tham số    | Kiểu   | Mô tả |
|------------|--------|-------------|
| `roleId`   | String | ID của vai trò cần sửa đổi. |
| `permission` | String | Quyền cần thêm vào vai trò. |

#### Phản hồi
Trả về một đối tượng `ResponseData` cho biết kết quả của thao tác.

#### Ví dụ phản hồi
- **Thành công:**
  ```json
  {
    "success": true,
    "code": 200,
    "message": "Thêm quyền thành công"
  }
  ```

- **Lỗi: Vai trò không tồn tại**
  ```json
  {
    "success": false,
    "code": 404,
    "message": "Không tìm thấy vai trò"
  }
  ```

- **Lỗi: Quyền đã tồn tại**
  ```json
  {
    "success": false,
    "code": 400,
    "message": "Quyền đã tồn tại"
  }
  ```

- **Lỗi: Lỗi máy chủ nội bộ**
  ```json
  {
    "success": false,
    "code": 500,
    "message": "Lỗi máy chủ nội bộ"
  }
  ```

## Xử lý lỗi
- **Khối Try-Catch**: Được sử dụng để xử lý lỗi trong truy vấn cơ sở dữ liệu.
- **Thông báo lỗi**: Các mã lỗi và thông báo thích hợp được trả về.

## Cân nhắc bảo mật
- **Middleware xác thực**: `VerifyTokenAll` đảm bảo rằng chỉ những người dùng được ủy quyền mới có thể truy cập các truy vấn và mutation.
- **Kiểm tra hợp lệ**: Đảm bảo vai trò tồn tại trước khi chỉnh sửa quyền.

## Kết luận
`SystemResolver` cung cấp một cách có cấu trúc để lấy metadata hệ thống và quản lý quyền truy cập vai trò một cách hiệu quả. Nó đảm bảo an toàn thông qua middleware xác thực và xử lý lỗi đúng cách.

