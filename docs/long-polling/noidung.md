# Long-Polling

## AJAX POLLING

Polling là một kỹ thuật được sử dụng trong các ứng dụng AJAX, ý tưởng của nó là client sẽ liên tục gọi tới server để yêu cầu dữ liệu mới (polls/requests data). Client sẽ tạo ra một request và đợi kết quả trả về từ Server, nếu Server không tìm thấy hoặc trả kết quả về hoặc kết quả là rỗng (empty), thì một empty response sẽ được gửi về.

Client sẽ mở một connection và request dữ liệu từ Server thông qua cổng kết nối HTTP.
Những request trên sẽ được gửi đến Server theo định kỳ (intervals), ví dụ mỗi 1 giây sẽ có một request gửi đi.
Server sẽ tính toán và trả về dữ liệu cũng thông qua kết nối HTTP.
![architecture-simple](https://edwardthienhoang.wordpress.com/wp-content/uploads/2020/05/11-2.png?w=756)
Client sẽ lặp lại cả 3 bước trên để liên tục cập nhật được dữ liệu mới nhất từ Server.

## HTTP Polling

Polling bao gồm việc gửi một thông điệp từ phía máy khách đến máy chủ để yêu cầu một thông tin dữ liệu nào đó. Thực ra đây chỉ là một yêu cầu HTTP của Ajax. Để có được các sự kiện từ máy chủ càng sớm thì khoảng thời gian polling (thời gian giữa các yêu cầu) phải càng ngắn càng tốt.

![architecture-simple](https://ik.imagekit.io/ably/ghost/prod/2021/10/http-long-polling.png?tr=w-1520,q-50)

Có một nhược điểm là: nếu khoảng thời gian này càng ngắn, trình duyệt của máy khách sẽ đưa ra nhiều yêu cầu hơn, trong đó có những yêu cầu sẽ không trả về bất kỳ dữ liệu có ích nào khiến cho băng thông bị hao tốn và xử lý tài nguyên vô ích.

Bảng thời gian cho thấy cách mà máy khách gửi các yêu cầu polling nhưng chẳng có thông tin nào được trả về cả. Máy khách phải chờ đến lần polling tiếp theo để có được hai sự kiện do máy chủ thu nhận được.

## HTTP Long-Polling

Như đã nói về một nhược điểm của polling thì long-poling được sinh ra để giải quyết nhược điểm này bằng cách giảm thiểu việc yêu cầu liên tiếp trong khi không có dữ liệu hữu ích trả về. 

![architecture-simple](https://images.viblo.asia/4c28c4c7-9806-4ad0-9b63-9d7b8fb2baef.png)
Ý tưởng: Client gửi 1 request và server sẽ giữ lại request đó và sẽ hồi đáp nó khi có một sự kiện tương ứng diễn ra ( nhưng sẽ có 1 trường hợp là request từ client đã đến timeout nhưng vẫn chưa có sự kiện mong đợi nào, khi đó, server sẽ buộc phải trả về 1 response nhưng có thể là không kèm theo bất kỳ dữ liệu có ích nào.)
- Client gửi 1 yêu cầu.
- Server tiếp nhận yêu cầu và xửa lý yêu cầu trên dữ liệu mong đợi liên tục trong 1 khoản thời gian nhất định.
- Khi có sự kiện diễn ra(ví dụ: thay đổi trên dữ liệu mong đợi) server sẽ hồi đáp lại client thông qua phương thức http truyền thống.
- Client sau khi nhận được response tử server, sẽ xử lý và bắt đầu tiếp tục lắng nghe server bằng việc bắt đầu lại bước 1 với 1 http request. Ưu điểm:
- Đơn giản, dễ hiểu, dễ tiếp cận.
- Làm việc với mọi trình duyệt.
- Không yêu cầu đặc biết phía server.
- Giảm thiểu tiêu thụ tài nguyên. Nhược điểm:
- Bạn sẽ không biết khi nào mà các sự kiện ở phía máy chủ được gửi tới máy khách vì nó đòi - - hỏi phải có một hành động từ phía máy khách để yêu cầu chúng.