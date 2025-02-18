# Tài liệu ChatResolver

Tài liệu chi tiết về lớp ChatResolver xử lý các hoạt động GraphQL liên quan đến chat bao gồm gửi tin nhắn, tạo cuộc trò chuyện và truy xuất dữ liệu chat.

## Tổng quan

Lớp `ChatResolver` là một resolver GraphQL xử lý các chức năng chat bao gồm:
- Gửi tin nhắn mới đến người dùng
- Quản lý cuộc trò chuyện
- Truy xuất lịch sử tin nhắn
- Tạo cuộc trò chuyện nhóm

## Các phụ thuộc

```typescript
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { MessageModel } from "../../core/models/chat/message.model";
import ConversationModel from "../../core/models/chat/conversation.model";
import SubscriptionModel from "../../core/models/chat/subscription.model";
```

Resolver sử dụng:
- `type-graphql` để định nghĩa schema GraphQL
- Các model tùy chỉnh cho Tin nhắn, Cuộc trò chuyện và Đăng ký
- Middleware xác thực
- Các kiểu và giao diện input/response tùy chỉnh

## Các phương thức

### sendNewMessage

Tạo cuộc trò chuyện mới và gửi tin nhắn ban đầu đến người nhận.

```typescript
@UseMiddleware(VerifyTokenAll)
@Mutation(() => SendNewMessageResponse)
async sendNewMessage(
  @Arg("newMessageInput") messageInput: NewMessageInput,
  @Ctx() { req, user }: Context
): Promise<SendNewMessageResponse>
```

Tham số:
- `messageInput`: Chứa nội dung tin nhắn và ID người nhận
- `context`: Chứa thông tin request và người dùng đã xác thực

Quy trình:
1. Xác thực sự tồn tại của người nhận
2. Tạo hoặc lấy cuộc trò chuyện giữa các người tham gia
3. Tạo và lưu tin nhắn mới
4. Cập nhật cuộc trò chuyện với tin nhắn mới nhất
5. Kích hoạt thông báo sự kiện
6. Tạo đăng ký tin nhắn cho người tham gia

### sendMessage

Gửi tin nhắn trong cuộc trò chuyện hiện có.

```typescript
@UseMiddleware(VerifyTokenAll)
@Mutation(() => ResponseData)
async sendMessage(
  @Arg("messageInput") messageInput: MessageInput,
  @Ctx() { req, user }: Context
): Promise<ResponseData>
```

Tham số:
- `messageInput`: Chứa nội dung tin nhắn và ID cuộc trò chuyện
- `context`: Chứa thông tin request và người dùng đã xác thực

Quy trình:
1. Xác thực sự tồn tại của cuộc trò chuyện
2. Tạo và lưu tin nhắn mới
3. Cập nhật tin nhắn mới nhất của cuộc trò chuyện
4. Kích hoạt thông báo sự kiện
5. Tạo đăng ký tin nhắn cho tất cả người tham gia

### getMessagesByConversationId

Lấy tất cả tin nhắn trong cuộc trò chuyện cùng với trạng thái đã đọc.

```typescript
@UseMiddleware(VerifyTokenAll)
@Query(() => MessageResponse)
async getMessagesByConversationId(
  @Arg("conversationId") conversationId: string,
  @Ctx() {req, user}: Context
): Promise<MessageResponse>
```

Tham số:
- `conversationId`: ID của cuộc trò chuyện cần lấy tin nhắn
- `context`: Chứa thông tin request và người dùng đã xác thực

Quy trình:
1. Xác thực sự tồn tại của cuộc trò chuyện
2. Kiểm tra đăng ký của người dùng vào cuộc trò chuyện
3. Lấy tất cả tin nhắn với dữ liệu người gửi và cuộc trò chuyện đã được populate
4. Ánh xạ trạng thái đăng ký cho mỗi tin nhắn
5. Trả về tin nhắn với trạng thái đã đọc

### getAllConversations

Lấy tất cả cuộc trò chuyện của người dùng hiện tại.

```typescript
@UseMiddleware(VerifyTokenAll)
@Query(() => GetConversationsResponse)
async getAllConversations(
  @Ctx() { req, user }: Context
): Promise<GetConversationsResponse>
```

Quy trình:
1. Tìm tất cả cuộc trò chuyện mà người dùng là người tham gia
2. Populate dữ liệu người tham gia và tin nhắn mới nhất
3. Định dạng tên cuộc trò chuyện:
   - Với chat 1-1: Sử dụng tên người dùng của người kia
   - Với chat nhóm: Sử dụng tên cuộc trò chuyện hoặc nối tên người dùng
4. Loại bỏ người tham gia trùng lặp
5. Đính kèm trạng thái đăng ký cho tin nhắn mới nhất

### createConversation

Tạo cuộc trò chuyện nhóm mới.

```typescript
@UseMiddleware(VerifyTokenAll)
@Mutation(() => ResponseData)
async createConversation(
  @Arg("participantIds", () => [String]) participantIds: string[],
  @Arg("conversationName") conversationName: string,
  @Ctx() { req, user }: Context
): Promise<ResponseData>
```

Tham số:
- `participantIds`: Mảng ID người dùng để thêm vào cuộc trò chuyện
- `conversationName`: Tên của cuộc trò chuyện nhóm
- `context`: Chứa thông tin request và người dùng đã xác thực

Quy trình:
1. Xác thực danh sách người tham gia
2. Tạo cuộc trò chuyện mới với người tham gia đã chỉ định
3. Tạo tin nhắn hệ thống ban đầu
4. Cập nhật cuộc trò chuyện với tin nhắn ban đầu
5. Kích hoạt thông báo sự kiện
6. Tạo đăng ký tin nhắn cho tất cả người tham gia

## Xử lý lỗi

Tất cả các phương thức đều bao gồm khối try-catch:
- Trả về phản hồi lỗi phù hợp cho các mutation
- Ném lỗi cho các query
- Bao gồm thông báo lỗi đã được dịch sử dụng `req.t()`

## Xác thực

Tất cả các phương thức được bảo vệ bằng `@UseMiddleware(VerifyTokenAll)` để đảm bảo chỉ người dùng đã xác thực mới có thể truy cập chức năng chat.

## Sự kiện và Đăng ký

Resolver triển khai cập nhật thời gian thực thông qua:
- `doEvents()`: Kích hoạt sự kiện thời gian thực cho tin nhắn và cuộc trò chuyện mới
- `createSubscriptions()`: Tạo bản ghi đăng ký để theo dõi trạng thái đã đọc tin nhắn

