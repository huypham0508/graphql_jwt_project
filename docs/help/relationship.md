### Các thư viện cần thiết

- import {Arg,Ctx,Mutation,Query,Resolver,UseMiddleware} from "type-graphql";
- import { FriendStatus } from "../../core/enum/friend.enum";
- import { VerifyTokenAll } from "../../core/middleware/auth";
- import { FriendModel, IFriend } from "../../core/models/friend/friend.model";
- import UserModel, { IUser } from "../../core/models/user/user.model";
- import { Context } from "../../core/types/Context";
- import { FindFriendsResponse, FindUserResponse} from "../../core/types/response/relationship/FindFriendsResponse";
- import { GetFriendsResponse } from "../../core/types/response/relationship/GetFriendResponse";
- import { RelationshipResponse } from "../../core/types/response/relationship/RelationshipResponse";

### Middleware
- Mô tả: Xác thực người dùng trước khi thực hiện các hành động liên quan đến hệ thống.
- Cơ chế hoạt động:
- Kiểm tra token của người dùng.
    - Nếu token hợp lệ, cho phép tiếp tục.
    - Nếu không, trả về lỗi và dừng truy vấn/mutation.

### allResolvers()
- Mô tả: Truy vấn danh sách tất cả các resolver có trong hệ thống (Query, Mutation, Subscription).
- Biến: Không có biến truyền vào.
- Kết quả trả về:
    - Code 200: Thành công.
    - Success: Trạng thái thành công (true/false).
    - Data: Mảng danh sách resolver, gồm:
        - name: Tên method.
        - resolver: Tên resolver.
        - type: Loại resolver (Query, Mutation, Subscription).
    ```
        query {
            allResolvers {
                code
                success
                data {
                    name
                    resolver
                    type
                }
            }
        }
    ```

### roles()
- Mô tả: Truy vấn danh sách tất cả các vai trò (roles) trong hệ thống.
- Biến: Không có biến truyền vào.
- Kết quả trả về:
    - Code 200: Thành công.
    - Code 200 (nếu danh sách rỗng): "roles is empty".
    - Success: Trạng thái thành công (true/false).
    - Message: Thông báo phản hồi.
    - Data: Mảng danh sách vai trò, bao gồm:
        - id: ID của vai trò.
        - name: Tên vai trò.
        - permissions: Danh sách quyền hạn của vai trò.
    ```
    query {
        roles {
            code
            success
            message
            data {
                id
                name
                permissions
            }
        }
    }
    ```

### addPermissionToRole()
- Mô tả: Thêm quyền (permission) vào một vai trò (role).
- Biến:
    - roleId: ID của vai trò cần thêm quyền.
    - permission: Tên quyền cần thêm.
- Context:
    - Kiểm tra xem vai trò có tồn tại không trước khi thêm quyền.
    - Nếu vai trò không tồn tại, trả về lỗi 404.
    - Nếu quyền đã tồn tại trong vai trò, trả về lỗi 400.
- Kết quả trả về:
    - Code 200: Thành công.
    - Code 404: Không tìm thấy vai trò.
    - Code 400: Quyền đã tồn tại.
    - Code 500: Lỗi hệ thống.
    - Success: Trạng thái thành công (true/false).
    - Message: Thông báo phản hồi.
    ```
    mutation {
        addPermissionToRole(roleId: "654321", permission: "MANAGE_USERS") {
            code
            success
            message
        }
    }
    ```




### Middleware
- Mô tả: Xác thực người dùng trước khi thực hiện các hành động liên quan đến reaction.
- Nếu người dùng không đăng nhập hoặc token không hợp lệ, middleware sẽ trả về lỗi và ngừng hoạt động.

### findFriendByEmail()
- Mô tả: Tìm kiếm bạn bè theo email và trả về danh sách người dùng phù hợp kèm trạng thái quan hệ.
- Tham số đầu vào:
- email (String, bắt buộc): Email cần tìm kiếm.
- Kết quả trả về:
- code: HTTP Status Code (200 nếu thành công).
- success: Trạng thái thành công (true/false).
- message: Thông báo kết quả.
- data: Danh sách người dùng kèm trạng thái quan hệ (nothing, PENDING, ACCEPTED).

    ```
        query {
            findFriendByEmail(email: "example@email.com") {
                code
                success
                message
                data {
                    id
                    email
                    userName
                    avatar
                    status
                }
            }
        }

    ```

### getFriendRequests()
- Mô tả: Trả về danh sách yêu cầu kết bạn đang chờ xử lý của người dùng.
- Kết quả trả về:
    - code: HTTP Status Code (200 nếu thành công).
    - success: Trạng thái thành công.
    - message: Thông báo kết quả.
    - data: Danh sách yêu cầu kết bạn.
    ```
    query {
        getFriendRequests {
            code
            success
            message
            data {
                id
                userName
                email
                avatar
            }
        }
    }
    ```

### getFriendList()

- Mô tả: Trả về danh sách tất cả bạn bè của người dùng.
- Kết quả trả về:
    - code: HTTP Status Code (200 nếu thành công).
    - success: Trạng thái thành công.
    - message: Thông báo kết quả.
    - data: Danh sách bạn bè.
    ```
    query {
        getFriendList {
            code
            success
            message
            data {
                id
                userName
                email
                avatar
            }
        }
    }

    ```

### sendFriendRequest(friendId: String)
- Mô tả: Gửi yêu cầu kết bạn đến một người dùng khác.
- Tham số đầu vào:
    - friendId (String, bắt buộc): ID của người dùng cần gửi yêu cầu.
- Kết quả trả về:
    - code: HTTP Status Code (200 nếu thành công).
    - success: Trạng thái thành công.
    - message: Thông báo kết quả.

    ```
        mutation {
            sendFriendRequest(friendId: "654321") {
                code
                success
                message
            }
        }       

    ```


- Chức năng: 
    - Chấp nhận yêu cầu kết bạn mà người dùng nhận được.
    - Kiểm tra xem người dùng có quyền chấp nhận yêu cầu này không.
    - Cập nhật trạng thái của yêu cầu kết bạn thành "ACCEPTED".
- Diễn giải: 
    - FriendModel.findById(): Tìm kiếm yêu cầu kết bạn bằng requestId để lấy thông tin yêu cầu kết bạn.
    - if (friendRequest.user.toString() !== user.id): Kiểm tra nếu người gửi yêu cầu kết bạn không phải là người dùng hiện tại, nếu đúng hiển thị thông báo "Unauthorized to accept friend request".
    - if (friendRequest.status === FriendStatus.ACCEPTED): Kiểm tra nếu trạng thái của yêu cầu kết bạn là ACCEPTED sẽ hiển thị thông báo "Friend request already accepted".

    ```
        mutation {
            acceptFriendRequest(requestId: "123456") {
                code
                success
                message
            }
        }

    ```

### acceptFriendRequest(requestId: String)
- Mô tả: Chấp nhận yêu cầu kết bạn.
- Tham số đầu vào:
    -requestId (String, bắt buộc): ID của yêu cầu kết bạn.
- Kết quả trả về:
    - code: HTTP Status Code (200 nếu thành công).
    - success: Trạng thái thành công.
    - message: Thông báo kết quả.
    ```
    mutation {
        acceptFriendRequest(requestId: "123456") {
            code
            success
            message
        }
    }

    ```

### rejectedFriendRequest(requestId: String)
- Mô tả: Từ chối và xóa yêu cầu kết bạn khỏi danh sách.
- Tham số đầu vào:
    - requestId (String, bắt buộc): ID của yêu cầu kết bạn.
- Kết quả trả về:
    - code: HTTP Status Code (200 nếu thành công).
    - success: Trạng thái thành công.
    - message: Thông báo kết quả.
    ```
    mutation {
        rejectedFriendRequest(requestId: "123456") {
            code
            success
            message
        }
    }
    ```