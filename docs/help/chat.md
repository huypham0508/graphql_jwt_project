# ChatResolver - GraphQL Resolver cho Chat

## Giới thiệu
`ChatResolver` là một resolver GraphQL xử lý các truy vấn (`Query`) và thay đổi (`Mutation`) liên quan đến tính năng trò chuyện trong hệ thống. Resolver này sử dụng TypeGraphQL kết hợp với Mongoose để quản lý dữ liệu.

## Import các thư viện cần thiết
```ts
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
```
- `Arg`: Nhận tham số từ request GraphQL.
- `Ctx`: Truy xuất context chứa thông tin người dùng hiện tại.
- `Mutation`: Định nghĩa các phương thức thay đổi dữ liệu.
- `Query`: Định nghĩa các phương thức truy vấn dữ liệu.
- `Resolver`: Đánh dấu class là một resolver GraphQL.
- `UseMiddleware`: Áp dụng middleware để xác thực hoặc kiểm soát truy cập.

## Import các module hỗ trợ
```ts
import { doEvents } from "../controllers/events.controller";
import { VerifyTokenAll } from "../../core/middleware/auth";
import { MessageModel } from "../../core/models/chat/message.model";
import ConversationModel, { getConversationOrCreate } from "../../core/models/chat/conversation.model";
import SubscriptionModel, { createSubscriptions } from "../../core/models/chat/subscription.model";
import { Context } from "../../core/types/Context";
import { MessageInput } from "../../core/types/input/chat/MessageInput";
import { NewMessageInput } from "../../core/types/input/chat/NewMessageInput";
import { GetConversationsResponse } from "../../core/types/response/chat/GetConversationsResponse";
import { MessageData, MessageResponse } from "../../core/types/response/chat/MessageResponse";
import { SendNewMessageResponse } from "../../core/types/response/chat/SendNewMessageResponse";
import { ResponseData } from "../../core/types/response/IMutationResponse";
```
Các import này giúp kết nối resolver với các model, controller, middleware, và kiểu dữ liệu cần thiết.

---

## 1. Gửi tin nhắn mới (`sendNewMessage`)
```ts
@UseMiddleware(VerifyTokenAll)
@Mutation(() => SendNewMessageResponse)
async sendNewMessage(
  @Arg("newMessageInput") messageInput: NewMessageInput,
  @Ctx() { req, user }: Context
): Promise<SendNewMessageResponse> {
```
- Middleware `VerifyTokenAll` xác thực người dùng trước khi xử lý mutation.
- `@Mutation(() => SendNewMessageResponse)`: Xác định đây là một mutation.
- Nhận `newMessageInput` (nội dung tin nhắn, người nhận) và `Context` chứa thông tin người dùng.

```ts
const { content, recipientId } = messageInput;
if (recipientId === null) {
  return {
    success: false,
    code: 404,
    message: req.t("Recipient not found!"),
  };
}
```
- Kiểm tra xem người nhận có tồn tại không. Nếu không, trả về lỗi 404.

```ts
const participants = [...new Set([recipientId, user.id])];
let conversation = await getConversationOrCreate(participants);
```
- Tạo danh sách `participants` chứa người gửi và người nhận.
- Gọi `getConversationOrCreate` để lấy cuộc trò chuyện hiện có hoặc tạo mới.

```ts
const maxMessage = new MessageModel({
  sender: user.id,
  content,
  conversation: conversation._id.toString(),
});
await maxMessage.save();
conversation.maxMessage = maxMessage;
await conversation.save();
```
- Tạo một tin nhắn mới và lưu vào database.
- Cập nhật tin nhắn mới nhất (`maxMessage`) trong cuộc trò chuyện.

```ts
doEvents({
  eventData: {
    type: "message",
    op: "add",
    event: maxMessage,
    recipients: [recipientId],
  },
});
```
- Gửi sự kiện real-time để thông báo có tin nhắn mới đến người nhận.

```ts
return {
  success: true,
  code: 200,
  conversation: conversation,
  message: req.t("Message sent successfully!"),
};
```
- Trả về kết quả thành công.

---

## 2. Lấy danh sách tin nhắn (`getMessagesByConversationId`)
```ts
@UseMiddleware(VerifyTokenAll)
@Query(() => MessageResponse)
async getMessagesByConversationId(
  @Arg("conversationId") conversationId: string,
  @Ctx() { req, user }: Context
): Promise<MessageResponse> {
```
- Nhận `conversationId` và `Context`.
- Middleware xác thực quyền truy cập.

```ts
const messages = await MessageModel.find({ conversation: conversationId })
  .sort({ timestamp: 1 })
  .populate({ path: "conversation", populate: { path: "participants" } })
  .populate({ path: "sender", populate: { path: "role" } });
```
- Lấy danh sách tin nhắn theo `conversationId`, sắp xếp theo thời gian.
- Populate thông tin người gửi và cuộc trò chuyện.

```ts
return {
  success: true,
  code: 200,
  message: req.t("Successfully!"),
  data: messages,
};
```
- Trả về danh sách tin nhắn.

---

## 3. Lấy danh sách cuộc trò chuyện (`getAllConversations`)
```ts
@UseMiddleware(VerifyTokenAll)
@Query(() => GetConversationsResponse)
async getAllConversations(@Ctx() { req, user }: Context): Promise<GetConversationsResponse> {
```
- Middleware kiểm tra quyền truy cập.
- Truy xuất danh sách cuộc trò chuyện của người dùng hiện tại.

```ts
const conversations = await ConversationModel.find({ participants: user.id })
  .populate({ path: "participants", populate: { path: "role" } })
  .populate({ path: "maxMessage", populate: { path: "sender" } });
```
- Tìm tất cả cuộc trò chuyện mà người dùng có mặt.
- Populate thông tin người tham gia và tin nhắn cuối cùng.

```ts
return {
  code: 200,
  success: true,
  data: conversations,
};
```
- Trả về danh sách cuộc trò chuyện.

---

## 4. Tạo cuộc trò chuyện mới (`createConversation`)
```ts
@UseMiddleware(VerifyTokenAll)
@Mutation(() => ResponseData)
async createConversation(
  @Arg("participantIds", () => [String]) participantIds: string[],
  @Arg("conversationName") conversationName: string,
  @Ctx() { req, user }: Context
): Promise<ResponseData> {
```
- Nhận danh sách `participantIds` và `conversationName`.
- Middleware đảm bảo người dùng hợp lệ.

```ts
const newConversation = new ConversationModel({
  name: conversationName,
  participants: [...participantIds, user.id],
});
await newConversation.save();
```
- Tạo một cuộc trò chuyện mới với các người tham gia được chỉ định.

```ts
return {
  success: true,
  code: 200,
  message: req.t("Conversation created successfully {{name}}", { name: conversationName }),
};
```
- Trả về kết quả thành công.

---

## Kết luận
`ChatResolver` cung cấp API mạnh mẽ cho tính năng chat, bao gồm:
- Gửi tin nhắn mới.
- Lấy danh sách tin nhắn trong cuộc trò chuyện.
- Lấy danh sách cuộc trò chuyện của người dùng.
- Tạo cuộc trò chuyện mới.

Tất cả các API đều sử dụng middleware để xác thực và bảo mật dữ liệu.

