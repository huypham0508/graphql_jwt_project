# Connection.ts

Tệp Connection.ts này chứa một lớp (class) có tên ConnectionManager, chịu trách nhiệm quản lý các kết nối.

## Import các module và kiểu dữ liệu

Import các module và kiểu dữ liệu
```
import { Event } from "src/app/core/types/system/Events";
import {RedisRepository, redisRepository as instanceRedisRepository} from "./redis_repository";
import { ConnectionType } from "../types/system/Connection";

```

## Class ConnectionManager

```
class ConnectionManager {
    private connectionMap = new Map<string, ConnectionType>();
    private redisRepository: RedisRepository;

    constructor() {
       this.redisRepository = instanceRedisRepository;
    }
}

```
`connectionMap`: Một Map lưu trữ kết nối theo queue_id.

`redisRepository`: Được khởi tạo từ một instance của RedisRepository.

## Kiểm tra phiên hoạt động (hasSession)

```
    public async hasSession(key: string): Promise<boolean> {
        return await this.redisRepository.getSession(key) !== null;
    }

```
Kiểm tra xem có phiên `(session)` nào đang hoạt động trong Redis hay không.

## Thêm kết nối (appendConnection)

```
    public appendConnection(queue_id: string, connection: ConnectionType) {
        this.connectionMap.set(queue_id, connection);
        this.redisRepository.resetTimeSession(queue_id)
    }

```

Lưu kết nối vào connectionMap.

Cập nhật thời gian phiên trong Redis.

## Xóa kết nối (removeConnection)

```
public removeConnection(queue_id: string) {
    this.connectionMap.delete(queue_id);
}

```
Xóa kết nối khỏi connectionMap.

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