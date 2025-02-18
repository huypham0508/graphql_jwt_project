# RESOLVERS POST DOCUMENT

## Các thư viện cần thiết thêm vào file
``` 
- import {Arg, Ctx, Mutation, Query, Resolver, UseMiddleware,} from "type-graphql"
- import { FriendStatus } from "../../core/enum/friend.enum"
- import { VerifyTokenAll } from "../../core/middleware/auth"
- import { FriendModel, IFriend } from "../../core/models/friend/friend.model"
- import Post from "../../core/models/post/post.model";
- import Reaction from "../../core/models/reaction/reaction.model.ts"
- import User from "../../core/models/user/user.model"
- import { Context } from "../../core/types/Context"
- import { CreatePostInput } from "../../core/types/input/post/createPostInput"
- import { GetListPostResponse } from "../../core/types/response/post/GetAllPostResponse"
- import { PostMutationResponse } from "../../core/types/response/post/PostMutationResponse" 
```

### Middleware
- Mô tả: Kiểm tra xác thực người dùng trước khi thực hiện các hành động liên quan. 
- Nếu người dùng không đăng nhập và cung cấp token không hợp lệ, middleware sẽ trả về lỗi và ngừng hoạt động. 

### allPosts()
- Mô Tả: Truy vấn tất cả các post trong hệ thống, hỗ trợ phân trang.
- Các biến.
    - Biến pageSize với giá trị mặc định 10.
    - Biến pageNumber với giá trị mặc định là 1.
- Kết quả trả về.
    - Code 200: (Mã trạng thái HTTP thành công).
    - Sucess: Trạng thái thành công (true/false).
    - Message: Thông báo phản hồi.
    - Data: Dữ liệu của Post.

        ```Example:
            query{
                allPost (pageSize: 2, pageNumber : 1) {
                    code
                    success
                    message
                    data{
                        id
                        name
                        imageUrl
                    }
                }
            }
         ```     

### postOfFriends()
- Mô tả: Truy vấn các bài viết của bạn bè chấp nhận kết bạn với người dùng hiện tại, có hỗ trợ phân trang.
- Các biến:
    - Biến pageSize với giá trị mặc định 10.
    - Biến pageNumber với giá trị mặc định là 1.
- Context: lấy thông tin và dữ liệu người dùng.
- Tìm thông tin bạn của người dùng hiện tại và các bài post liên quan.
- Kết quả trả về: 
    - Kiểm tra mảng postOffreind có tồn tại hay không.
        - Nếu rỗng trả về thông báo postOfFriends rỗng
        - Nếu có trả về thông báo lấy tất cả các postOfFriends
    - Code 200: (Mã trạng thái HTTP thành công).
    - Sucess: Trạng thái thành công (true/false).
    - Message: Thông báo phản hồi.
    - Data: Dữ liệu của Post.

        ```Example:
            query{
                postOfFriend (pageSize: 2, pageNumber : 1) {
                    code
                    success
                    message
                    data{
                        id
                        name
                        imageUrl
                    }
                }
            }
        ```

### yourPosts()
- Mô tả: Truy vấn bài viết của người dùng hiện tại, có hỗ trợ phân trang.
- Các biến:
    - Biến pageSize với giá trị mặc định 10.
    - Biến pageNumber với giá trị mặc định là 1.
- Context: Lấy thông tin người dùng.
- Kiểm tra thông tin người dùng.
    - Code 200: (Mã trạng thái HTTP thành công).
    - Sucess: Trạng thái thành công (true/false).
    - Message: Thông báo phản hồi.
    - Data: Dữ liệu của Post.

        ```Example:
            query{
                yourPosts (pageSize: 5, pageNumber : 2) {
                    code
                    success
                    message
                    data{
                        id
                        name
                        imageUrl
                    }
                }
            }
        ```

### createPost()
- Mô tả: Tạo 1 bài viết mới với mô tả và hình ảnh
- Các biến: 
    - postInput: Đối tượng chứa dữ liệu bài viết
        - imageURL: URL của hình ảnh.
        - description: mô tả của bài viết.
- Context: Lấy thông tin người dùng. 
- Kiểm tra xem người dùng có tồn tại hay không.
    - Code 200: (Mã trạng thái HTTP thành công).
    - Code 404: (Mã trạng thái HTTP không tìm thấy).
    - Code 500: (Mã trạng thái HTTP lỗi hệ thống).
    - Sucess: Trạng thái thành công (true/false).
    - Message: Thông báo phản hồi.
    - Data: Dữ liệu của Post.

        ```Example:
            query{
                createPost (postInput: {imageURL: "https://www.example.jpg", description: "New Post"}) {
                    code
                    success
                    message
                    data{
                        id
                        name
                        imageUrl
                    }
                }
            }
        ```

# increaseReactionCount()
- Mô tả: Tăng số lượng đếm của bài viết.
- Các biến: 
    - postId: Id bài viết cần tăng.
    - reactName: tên bài viết cần tăng.
- Context: Lấy thông tin người dùng.
- Kiểm tra người dùng có tồn tại không.
- Tìm bài viết đã đăng.
- Tìm tên bài viết đó.
    - Nếu có sẽ tăng số lượng bài viết lên và lưu lại.
    - Code 200: (Mã trạng thái HTTP thành công).
    - Code 404: (Mã trạng thái HTTP không tìm thấy).
    - Code 500: (Mã trạng thái HTTP lỗi hệ thống).
    - Sucess: Trạng thái thành công (true/false).
    - Message: Thông báo phản hồi.
    - Data: Dữ liệu của Post.

        ```Example:
            query{
                increaseReactionCount (postId: "123", reactName: "Love") {
                    code
                    success
                    message
                    data{
                        id
                        name
                        imageUrl
                    }
                }
            }
        ```

# deccreaseReactionCount()
- Mô tả: Giảm số lượng đếm của bài viết.
- Các biến:
    - postId: Id bài viết cần giảm.
    - reactName: tên bài viết cần giảm.
- Context: Lấy thông tin người dùng.
- Kiểm tra người dùng có tồn tại không.
- Tìm bài viết đã đăng.
- Tìm tên bài viết đó.
- Nếu có sẽ giảm số lượng bài viết và lưu lại.
    - Code 200: (Mã trạng thái HTTP thành công).
    - Code 404: (Mã trạng thái HTTP không tìm thấy).
    - Code 500: (Mã trạng thái HTTP lỗi hệ thống).
    - Sucess: Trạng thái thành công (true/false).
    - Message: Thông báo phản hồi.
    - Data: Dữ liệu của Post.

        ```Example:
            query{
                deccreaseReactionCount (postId: "123", reactName: "Love") {
                    code
                    success
                    message
                    data{
                        id
                        name
                        imageUrl
                    }
                }
            }
        ```