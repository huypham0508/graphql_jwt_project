# Events.controllers.ts

Tệp events.controller.ts này chứa các handle sự kiện, chịu trách nhiệm quản lý xử lý sự kiện và Redis

## Import các module và kiểu dữ liệu

Import các module và các kiểu dữ liệu
```
import { Response } from "express";
import { v4 as uuidv4 } from "uuid";

import {redisRepository} from "../../core/queue/redis_repository";

import {connectionManager} from "../../core/queue/connection";

import { CustomRequest } from "../../core/types/Context";
import { Event, RedisSession } from "../../core/types/system/Events";

```

## Hàm handleEventRegister

```
export const handleEventRegister = async(req: CustomRequest, res: Response): Promise<Response> => {}

```
`handleEventRegister`: Đang sự dụng async await để chạy bất đồng bộ.

`Req`: Gán biến là `CustomRequest`.

`Res`: Gán biến là `Response`.

## Các chức năng trong hàm handleEventRegister

```
  try {
    const user = req.user;
    const userId = user?.id;
    if (!userId) {
      return res.status(400).json({ error: "user is required" });
    }

    const queue_id = uuidv4() + "-" + Date.now();
    const sessionData: RedisSession = { user_id: userId, queue_id };
    await redisRepository.setSession(queue_id, sessionData)

    return res.status(200).json({
        success: true,
        message: "success",
        queue_id
    });
  }

```
Chức năng:

Tạo một sự kiện mới và lưu thông tin vào Redis.
Trả về queue_id để sử dụng sau này.
Cách hoạt động:

Lấy userId từ req.user.
Kiểm tra nếu userId không tồn tại thì trả về lỗi 400 Bad Request.
Tạo queue_id bằng UUID và timestamp.
Lưu thông tin phiên (queue_id, user_id) vào Redis bằng redisRepository.setSession().
Trả về phản hồi chứa queue_id.

```
catch (error) {
    console.log(error);
    return res.status(403).json({
      success: false,
      message: "error" + error,
    });
  }
```

Nếu có lỗi, trả về 403 Forbidden.

## handleEvents

```
export const handleEvents = async(req: CustomRequest, res: Response): Promise<void | Response> => {}

```

`handleEvents`: Đang sự dụng async await để chạy bất đồng bộ.

`Req`: Gán biến là `CustomRequest`.

`Res`: Gán biến là `Response`.

## Xóa kết nối (removeConnection)

```
try {
    const queue_id = req.query.queue_id;
    console.log(`Client Connected: ${queue_id}`);

    if (typeof queue_id !== 'string') {
      return res.status(404).json({
        success: false,
        message: "queue_id must be a string",
      });
    }

    if (!(await connectionManager.hasSession(queue_id))) {
      return res.status(404).json({
        success: false,
        message: "queue_id not found session",
      });
    }

    let last_event_id: number | any = req.query.last_event_id;
    last_event_id = last_event_id ? Number(last_event_id) : -1

    const event = await connectionManager.getEventsFromConnection(queue_id, last_event_id)
    if (event.length > 0) {
      return res.json({success: true, data: event});
    }

    const timeoutId = setTimeout(() => {
      res.json({success: true, data: [] });
      connectionManager.removeConnection(queue_id);
    }, 30000);

    const userId = req.user?.id;
    connectionManager.appendConnection(queue_id, { timeoutId, res, queue_id, last_event_id, user_id: userId});

    req.on("close", () => {
      clearTimeout(timeoutId);
      connectionManager.removeConnection(queue_id);
      console.log(`Client disconnected: ${queue_id}`);
    });
  }

```
Chức năng:

Kiểm tra và lấy sự kiện từ hàng đợi dựa trên queue_id.

Duy trì kết nối SSE (Server-Sent Events) để gửi dữ liệu sự kiện.
Cách hoạt động:

- `Lấy queue_id từ req.query.queue_id.`
- `Kiểm tra nếu queue_id không phải string, trả về lỗi 404 Not Found.`
- `Kiểm tra xem queue_id có phiên hợp lệ trong connectionManager không. Nếu không, trả về lỗi 404.`
- `Lấy last_event_id từ request (nếu có), nếu không thì gán -1.`
- `Truy vấn sự kiện từ connectionManager.getEventsFromConnection().`
- `Nếu có sự kiện, trả về dữ liệu ngay. Nếu không, thiết lập setTimeout để đóng kết nối sau 30 giây nếu không có dữ liệu.`
- `Lưu thông tin kết nối vào connectionManager.appendConnection().`

```
catch (error) {
    console.log(error);
    return res.status(403).json({
      success: false,
      message: "error" + error,
    });
  }
```
Xử lý khi client đóng kết nối (req.on("close")).

## Lấy kết nối (getConnection)

```
public getConnection(queue_id: string): ConnectionType | undefined {
    return this.connectionMap.get(queue_id);
}
```
Trả về kết nối nếu tồn tại.

## Kết luận của tệp Connection.ts
`Mục đích`: Quản lý các kết nối theo queue_id và làm việc với Redis để xử lý phiên.

`Chức năng` chính: Kiểm tra phiên, thêm/xóa/lấy kết nối.

`Redis được sử dụng`: Để lưu phiên và làm mới thời gian sống (TTL).