# CHAT RESOLVER

### Hàm sendNewMessage

- Chức năng: Gửi tin nhắn mới và cập nhật trong thời gian thực cho người nhận.
- Cách hoạt động:
  - Tạo tin nhắn mới và lưu vào MessageModel.
  - Cập nhật cuộc trò chuyện với tin nhắn mới nhất (maxMessage).
  - Gửi sự kiện realtime thông qua doEvents() để thông báo cho người nhận về tin nhắn mới.
  - Tạo đăng ký (subscriptions) bằng createSubscriptions() để quản lý trạng thái đọc tin nhắn.

```
 doEvents({
 eventData: {
   type: "message",
   op: "add",
   event: maxMessage,
   recipients: [recipientId],
 },
});
createSubscriptions({
 messageId: maxMessage.id,
 recipientIds: participants,
 conversationId: conversation.id,
 senderId: user.id,
});

```

- Cách hoạt động của realtime:
  - doEvents() phát ra sự kiện kiểu message với hành động add.
  - Người nhận (recipients) sẽ nhận được thông báo qua WebSocket hoặc các kênh realtime khác.

### Hàm sendMessage

- Chức năng: Gửi tin nhắn trong một cuộc trò chuyện đã tồn tại và cập nhật realtime.
- Cách hoạt động:
  - Tạo tin nhắn mới và lưu vào MessageModel.
  - Cập nhật cuộc trò chuyện với tin nhắn mới nhất (maxMessage).
  - Gửi sự kiện realtime thông qua doEvents() cho tất cả các người tham gia trong cuộc trò chuyện (ngoại trừ người gửi).
  - Tạo đăng ký (subscriptions) để cập nhật trạng thái đọc tin nhắn.

```
   doEvents({
 eventData: {
   type: "message",
   op: "add",
   event: maxMessage,
   recipients: recipients.filter((participant) => participant !== user.id),
 },
});
createSubscriptions({
 messageId: maxMessage.id,
 recipientIds: recipients,
 conversationId: findConversation.id,
 senderId: user.id,
});

```

- Cách hoạt động của realtime:
  - doEvents() gửi sự kiện message với hành động add.
  - Người tham gia trong recipients (ngoại trừ người gửi) sẽ nhận thông báo về tin nhắn mới.

### Hàm createConversation

- Chức năng: Tạo cuộc trò chuyện mới và thông báo realtime cho tất cả người tham gia.
- Cách hoạt động:
  - Tạo cuộc trò chuyện mới và lưu vào ConversationModel.
  - Tạo tin nhắn hệ thống thông báo cuộc trò chuyện mới được tạo.
  - Gửi sự kiện realtime cho tất cả người tham gia ngoại trừ người tạo cuộc trò chuyện.
  - Tạo đăng ký (subscriptions) cho tất cả người tham gia.

```
doEvents({
 eventData: {
   type: "conversation",
   op: "add",
   event: newConversation,
   recipients: recipients.filter((participant) => participant !== user.id),
 },
});
createSubscriptions({
 messageId: maxMessage.id,
 recipientIds: recipients,
 conversationId: newConversation.id,
 senderId: user.id,
});

```

- Cách hoạt động của realtime:
  - doEvents() gửi sự kiện conversation với hành động add.
  - Tất cả người tham gia (ngoại trừ người tạo) nhận thông báo về cuộc trò chuyện mới.

### Hàm createSubscriptions

- Chức năng: Quản lý trạng thái đọc của tin nhắn cho các người tham gia.
- Cách hoạt động:
  - Nhận recipientIds, messageId, conversationId, và senderId.
  - Tạo bản ghi trong SubscriptionModel để theo dõi trạng thái đọc của mỗi người tham gia.
  - Hỗ trợ cập nhật realtime trạng thái đã đọc (read status) của tin nhắn.

```
import SubscriptionModel from "../../core/models/chat/subscription.model";

export const createSubscriptions = ({
 messageId,
 recipientIds,
 conversationId,
 senderId,
}) => {
 const subscriptions = recipientIds
   .filter((id) => id !== senderId)
   .map((id) => ({
     user: id,
     message: messageId,
     conversation: conversationId,
     read: false,
   }));
 return SubscriptionModel.insertMany(subscriptions);
};

```
