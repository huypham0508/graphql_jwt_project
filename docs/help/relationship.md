# RESOLVERS RELATIONSHIP DOCUMENT

### Tổng quan 

- Mô tả: Relationship là chức năng dùng để quản lý các mối quan hệ bạn bè. Nó bao gồm các thao tác như tìm kiếm bạn bè, lấy danh sách bạn bè, gửi yêu cầu kết bạn, chấp nhận yêu cầu kết bạn và từ chối yêu cầu kết bạn.

### Tìm kiếm bạn bè theo Email (findFriendByEmail) 
- Chức năng:  
    - Tìm kiếm người dùng theo Email, không phân biệt chữ hoa thường.
    - Kiểm tra trạng thái mối quan hệ hiện tại giữa người dùng và kết quả tìm kiếm.
    - Trả về danh sách người dùng kèm theo trạng thái mối quan hệ với người dùng hiện tại.
- Diễn giải: 
    - UserModel.find(): Lọc tất cả người dùng có email phù hợp với chuỗi tìm kiếm email
    - $regex với tùy chọn "i": để tìm kiếm không phân biệt hoa thường 
    - .select("-password"): Loại bỏ password khỏi kết quả trả về.
    - FriendModel.findOne(): Kiểm tra xem có mối quan hệ bạn bè nào giữa người dùng hiện tại và người dùng được tìm thấy không (tìm bằng cách sử dụng user.id và _id khi tìm thấy). 
    - statuses: Mảng chứa trạng thái mối quan hệ (ACCEPTED, PENDING, hoặc nothing nếu không có quan hệ).
    - FindUserResponse[]: lưu trữ từng thông tin của người dùng kèm theo trạng thái quan hệ nếu tìm thấy bạn bè sẽ trả về danh sách kèm code 200 còn nếu không tìm thấy sẽ trả về lỗi code 400.
    - if (friendsRequests): kiểm tra xem danh sách yêu cầu kết bạn (friendsRequests) có tồn tại hay không, nếu có, nó sẽ trả về thành công chứa danh sách yêu cầu kết bạn (friendsWithStatus).

### Lấy danh sách yêu cầu kết bạn (getFriendRequests)
- Chức năng: 
    - Lấy danh sách yêu cầu kết bạn mà người dùng nhận được 
    - Hiển thị các yêu cầu có trạng thái PENDING
- Diễn giải: 
    - FriendModel.find(): Lấy tất cả các mối quan hệ bạn bè có trạng thái là PENDING với người dùng hiện tại.
    - .populate(): Lấy thông tin người dùng và bạn bè trong yêu cầu kết bạn thông qua populate, tránh trả về ObjectId mà thay vào đó là các đối tượng đầy đủ.
    - Sau khi lấy dữ liệu, formatFriends sẽ được tạo ra, trong đó sẽ xác định người dùng nào đã gửi yêu cầu kết bạn dựa trên id người gửi và người nhận.
    - Trả về danh sách các bạn bè dưới dạng GetFriendsResponse với mã code 200 nếu thành công, nếu có lỗi trả về 400.
    - if (relationship.user.id === user.id): kiểm tra xem người dùng hiện tại (user.id) có phải là user.id trong mối quan hệ (relationship.user.id) hay không.

### Lấy danh sách bạn bè (getFriendList)
- Chức năng: 
    - Lấy danh sách bạn bè của người dùng với trạng thái mối quan hệ là "ACCEPTED".
- Diễn giải: 
    - FriendModel.find(): Tìm kiếm tất cả các mối quan hệ bạn bè giữa người dùng và bạn bè với trạng thái ACCEPTED.
    - .populate(): Sử dụng phương thức populate để lấy đầy đủ thông tin của người dùng và bạn bè, thay vì chỉ trả về ID. 
    - formatFriend: Dựng lại danh sách bạn bè đã được kết bạn từ dữ liệu lấy được. Nếu người dùng hiện tại là user, sẽ lấy bạn của họ (relationship.friend), ngược lại là relationship.user.
    - if (existingRequest): Kiểm tra xem đã có yêu cầu kết bạn trước đó hay chưa.
    - Trả về danh sách bạn bè với mã code 200 nếu thành công., nếu lỗi trả về mâ code 400.

### Gửi yêu cầu kết bạn (sendFriendRequest)
- Chức năng: 
    - Gửi yêu cầu kết bạn đến một người dùng khác.
    - Kiểm tra xem người nhận yêu cầu có tồn tại trong hệ thống hay không.
    - Kiểm tra xem yêu cầu kết bạn đã được gửi trước đó chưa.
- Diễn giải: 
    - UserModel.exists(): Kiểm tra xem người dùng với friendId có tồn tại không.
    - FriendModel.findOne(): Kiểm tra xem đã có yêu cầu kết bạn nào giữa người dùng hiện tại và người dùng được chỉ định chưa. Nếu đã có, trả về thông báo yêu cầu đã được gửi.
    - Nếu chưa có yêu cầu kết bạn, tạo mới một bản ghi trong FriendModel với trạng thái PENDING và lưu vào cơ sở dữ liệu.
    - Trả về mã 200 và thông báo "Gửi yêu cầu kết bạn thành công" nếu yêu cầu đã được gửi đi, Nếu có lỗi hoặc yêu cầu đã tồn tại, trả về lỗi với mã 404 hoặc 400.

### Chấp nhận yêu cầu kết bạn (acceptFriendRequest)
- Chức năng: 
    - Chấp nhận yêu cầu kết bạn mà người dùng nhận được.
    - Kiểm tra xem người dùng có quyền chấp nhận yêu cầu này không.
    - Cập nhật trạng thái của yêu cầu kết bạn thành "ACCEPTED".
- Diễn giải: 
    - FriendModel.findById(): Tìm kiếm yêu cầu kết bạn bằng requestId để lấy thông tin yêu cầu kết bạn.
    - if (friendRequest.user.toString() !== user.id): Kiểm tra nếu người gửi yêu cầu kết bạn không phải là người dùng hiện tại, nếu đúng hiển thị thông báo "Unauthorized to accept friend request".
    - if (friendRequest.status === FriendStatus.ACCEPTED): Kiểm tra nếu trạng thái của yêu cầu kết bạn là ACCEPTED sẽ hiển thị thông báo "Friend request already accepted"
    - Cập nhật trạng thái của yêu cầu kết bạn thành ACCEPTED và lưu lại thay đổi vào cơ sở dữ liệu.
    - Trả về mã 200 và thông báo thành công nếu yêu cầu được chấp nhận, nếu có lỗi trả về mã 400 


### Từ chối yêu cầu kết bạn (rejectedFriendRequest)
- Chức năng: 
    - Từ chối yêu cầu kết bạn mà người dùng nhận được.
    - Xoá yêu cầu kết bạn khỏi cơ sở dữ liệu nếu người dùng quyết định từ chối.
- Diễn giải: 
    - FriendModel.findById(): Tìm yêu cầu kết bạn theo ID.
    - if (friendRequest.user.toString() !== user.id): Kiểm tra nếu người gửi yêu cầu kết bạn sẽ thông báo "Unauthorized to accept friend request" 
    - if (friendRequest.status === FriendStatus.REJECTED): kiểm tra nếu trạng thái của yêu cầu kết bạn là REJECTED không phải là người dùng hiện tại, nếu đúng sẽ thông báo "Friend request already REJECTED".
    - Xóa yêu cầu kết bạn khỏi cơ sở dữ liệu bằng cách sử dụng deleteOne().
    - trả về mã 200 và thông báo thành công nếu yêu cầu đã được từ chối, nếu có lỗi trả về mã 400.
