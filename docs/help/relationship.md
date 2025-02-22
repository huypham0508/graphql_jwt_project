### Các thư viện cần thiết
- type-graphql: Xây dựng GraphQL resolver.
- FriendModel, UserModel: Model dữ liệu người dùng và bạn bè.
- VerifyTokenAll: Middleware xác thực người dùng.
- Context: Chứa thông tin người dùng hiện tại.
- FriendStatus: Enum trạng thái quan hệ bạn bè.
- FindFriendsResponse, GetFriendsResponse, RelationshipResponse: Các kiểu phản hồi API.

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