# Tài liệu cho EmitEventResolver

## Tổng quan

`EmitEventResolver` chịu trách nhiệm xử lý các sự kiện trong hệ thống, đặc biệt là các sự kiện liên quan đến cuộc trò chuyện (chat). Một ví dụ điển hình là sự kiện thông báo người dùng đang nhập văn bản (typing).

## Import các thành phần cần thiết

```typescript
import { ApolloError } from "apollo-server-core";
import {
  Arg,
  Ctx,
  Mutation,
  Resolver,
  UseMiddleware
} from "type-graphql";
import { doEvents } from "../controllers/events.controller";
import { VerifyTokenAll } from "../../core/middleware/auth";
import ChatConversationModel, { IConversation } from "../../core/models/chat/conversation.model";
import { Context } from "../../core/types/Context";
import { ResponseData } from "../../core/types/response/IMutationResponse";
```

- `ApolloError`: Xử lý lỗi trong Apollo Server.
- `type-graphql`:
  - `Resolver`: Định nghĩa một resolver.
  - `Mutation`: Định nghĩa một mutation.
  - `UseMiddleware`: Áp dụng middleware để kiểm tra xác thực.
- `doEvents`: Hàm xử lý và phát sự kiện trong hệ thống.
- `VerifyTokenAll`: Middleware xác thực người dùng trước khi xử lý yêu cầu.
- `ChatConversationModel`: Model của cuộc trò chuyện trong hệ thống.
- `Context`: Định nghĩa bối cảnh của yêu cầu.
- `ResponseData`: Kiểu dữ liệu phản hồi từ mutation.

## Đột biến (Mutation)

### `typing`

- Mô tả: Gửi sự kiện "typing" đến những người tham gia khác trong cuộc trò chuyện.
- Xác thực người dùng bằng middleware `VerifyTokenAll`.
- Kiểm tra tính hợp lệ của `conversationId`.
- Xác minh xem cuộc trò chuyện có tồn tại không.
- Gửi sự kiện "typing" đến những người tham gia khác ngoại trừ người gửi.

#### Cách hoạt động:

1. Khi người dùng bắt đầu nhập văn bản vào hộp chat, hệ thống gọi mutation `typing`.
2. Resolver kiểm tra xem cuộc trò chuyện có tồn tại không.
3. Nếu hợp lệ, sự kiện "typing" sẽ được gửi đến tất cả những người tham gia khác.
4. Các người tham gia khác nhận được thông báo rằng có người đang nhập tin nhắn.

#### Định nghĩa

```typescript
@Mutation((_return) => ResponseData)
@UseMiddleware(VerifyTokenAll)
async typing(
  @Arg("conversationId") conversationId: string,
  @Ctx() context: Context
): Promise<ResponseData> {
  const { user, req } = context;
  try {
    if (!conversationId) {
      throw new ApolloError(req.t("conversationId is required"));
    }
    
    const conversation: IConversation | null = await ChatConversationModel.findById(conversationId).lean();
    if (!conversation) {
      throw new ApolloError(req.t("Conversation not found"));
    }

    doEvents({
      eventData: {
        type: "typing",
        op: "add",
        event: {
          userTyping: user.id,
          conversationId: conversationId,
        },
        recipients: conversation.participants
          .filter((p) => p.toString() !== user.id)
          .map((p) => p.toString()),
      },
    });

    return {
      code: 200,
      success: true,
    };
  } catch (error) {
    return {
      code: 500,
      success: false,
      message: error.message,
    };
  }
}
```

## Kết luận

- `EmitEventResolver` giúp gửi sự kiện "typing" trong hệ thống chat.
- Middleware `VerifyTokenAll` đảm bảo rằng chỉ những người dùng đã xác thực mới có thể sử dụng tính năng này.
- Nếu cuộc trò chuyện hợp lệ, sự kiện sẽ được gửi đến những người tham gia khác.
- Giúp cải thiện trải nghiệm người dùng bằng cách hiển thị trạng thái nhập văn bản theo thời gian thực.

