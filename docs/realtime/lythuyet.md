# Lý thuyết realtime

### Realtime là gì ?

- Realtime (thời gian thực) trong phát triển web là khả năng truyền tải dữ liệu ngay lập tức giữa client (trình duyệt) và server mà không cần phải tải lại trang. Điều này thường được sử dụng trong các ứng dụng như:

  - Chat trực tuyến (Messenger, Zalo, Slack)
  - Thông báo tức thì (Facebook Notifications)
  - Cập nhật dữ liệu liên tục (giá cổ phiếu, số liệu thống kê)

### Ưu và nhược điểm của Realtime
- Ưu điểm:
    - Trải nghiệm người dùng tốt hơn nhờ cập nhật dữ liệu ngay lập tức
    - Tăng hiệu suất trong các ứng dụng yêu cầu tương tác liên tục

- Nhược điểm:
    - Tốn tài nguyên server do kết nối liên tục
    - Phức tạp hơn trong việc triển khai và bảo trì

### Cách hoạt động của Realtime

- Realtime hoạt động dựa trên việc duy trì một kết nối mở giữa client và server, cho phép dữ liệu được gửi và nhận ngay lập tức. Có một số phương pháp phổ biến để thực hiện realtime:

- Long Polling:

  - Client gửi yêu cầu tới server và giữ kết nối mở cho đến khi có dữ liệu mới. Nếu không có dữ liệu, server sẽ giữ kết nối trong một khoảng thời gian trước khi trả về phản hồi rỗng, sau đó client lại gửi yêu cầu mới.
  - Nhược điểm: Tốn băng thông và tài nguyên server vì phải liên tục gửi yêu cầu.

- Server-Sent Events (SSE):
  - Server có thể gửi dữ liệu tới client bất cứ khi nào có sự kiện mới. Tuy nhiên, SSE chỉ hỗ trợ truyền một chiều từ server tới client.
  - Sử dụng: Phù hợp với các ứng dụng cần cập nhật dữ liệu thường xuyên như tin tức, giá cổ phiếu.
- WebSocket:
  - WebSocket thiết lập một kết nối hai chiều liên tục giữa client và server. Sau khi kết nối được thiết lập, cả hai bên có thể gửi dữ liệu bất cứ lúc nào mà không cần thiết lập lại kết nối.
  - Ưu điểm: Hiệu suất cao hơn Long Polling vì không cần gửi yêu cầu HTTP liên tục.
  - Sử dụng: Phổ biến trong các ứng dụng chat, trò chơi trực tuyến, thông báo thời gian thực.

### Cách sử dụng WebSocket với Socket.IO

- Socket.IO là một thư viện phổ biến để triển khai WebSocket trong Node.js. Nó hỗ trợ cả WebSocket và tự động chuyển sang Long Polling khi cần thiết.

1. Cài đặt

- Trên server Node.js

```
npm install socket.io
```

- Trên client (HTML/JS)

```
<script src="/socket.io/socket.io.js"></script>
```

2. Thiết lập trên Server

```
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
 console.log('User connected: ' + socket.id);

 // Nhận dữ liệu từ client
 socket.on('chat message', (msg) => {
   console.log('Message: ' + msg);
   // Gửi lại dữ liệu cho tất cả client
   io.emit('chat message', msg);
 });

 socket.on('disconnect', () => {
   console.log('User disconnected: ' + socket.id);
 });
});

server.listen(8000, () => {
 console.log('Server is running on port 8000');
});
```

3. Thiết lập trên Client

```
<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <title>Chat Realtime</title>
</head>
<body>
 <ul id="messages"></ul>
 <input id="input" autocomplete="off" />
 <button onclick="sendMessage()">Send</button>

 <script src="/socket.io/socket.io.js"></script>
 <script>
   const socket = io(); // Tự động kết nối tới server

   // Nhận tin nhắn từ server
   socket.on('chat message', function(msg) {
     const item = document.createElement('li');
     item.textContent = msg;
     document.getElementById('messages').appendChild(item);
   });

   function sendMessage() {
     const input = document.getElementById('input');
     socket.emit('chat message', input.value); // Gửi tin nhắn lên server
     input.value = '';
   }
 </script>
</body>
</html>
```

#### Giải thích cách hoạt động của đoạn mã trên

- Server:
  - Tạo một server bằng Express và sử dụng Socket.IO để quản lý kết nối WebSocket.
  - Khi một client kết nối, sự kiện connection sẽ được kích hoạt.
  - Server lắng nghe sự kiện chat message từ client và phát lại tin nhắn đó tới tất cả các client bằng io.emit.
- Client:
  - Kết nối tới server bằng io() khi trang được tải.
  - Khi nhấn nút "Send", tin nhắn sẽ được gửi lên server thông qua sự kiện chat message.
  - Client lắng nghe sự kiện chat message từ server để hiển thị tin nhắn trên giao diện.

4. Import và sử dụng trong các framework khác

- Angular: Sử dụng ngx-socket-io

```
npm install ngx-socket-io
```

- React: Sử dụng socket.io-client

```
npm install socket.io-client
```

- Import vào js

```
import { io } from 'socket.io-client';
const socket = io('http://localhost:8000');
```
