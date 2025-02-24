# Cài đặt Redis

Đây là phần cài đặt Redis cho Windows, nếu bạn sử dụng hệ điều hành khác, hãy xem [Install Redis](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/)

## Cài đặt Redis cho Windows thông qua WSL2

Redis không được hỗ trợ chính thức trên Windows. Tuy nhiên, bạn có thể cài đặt Redis trên Windows để phát triển ứng dụng bằng cách làm theo hướng dẫn bên dưới.

Để cài đặt Redis trên Windows, trước tiên bạn cần bật WSL2 (Windows Subsystem for Linux). WSL2 cho phép bạn chạy các tệp nhị phân Linux gốc trên Windows. Để phương pháp này hoạt động, bạn cần chạy Windows 10 phiên bản 2004 trở lên hoặc Windows 11.

### Cài đặt hoặc bật WSL2

Cài đặt hoặc bật WSL2
Microsoft cung cấp [hướng dẫn chi tiết để cài đặt WSL](https://learn.microsoft.com/en-us/windows/wsl/install). Thực hiện theo các hướng dẫn này và lưu ý bản phân phối Linux mặc định mà nó cài đặt. Hướng dẫn này giả định là Ubuntu.

### Cài đặt Redis

Khi bạn đang chạy Ubuntu được trên Windows, bạn có thể làm theo các bước chi tiết tại [Cài đặt trên Ubuntu/Debian](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-linux/#install-on-ubuntu-debian) để cài đặt các phiên bản ổn định gần đây của Redis từ kho lưu trữ chính thức packages.redis.io APT. Thêm kho lưu trữ vào chỉ mục apt, cập nhật kho lưu trữ và sau đó cài đặt:
```
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list

sudo apt-get update
sudo apt-get install redis
```

Cuối cùng, chạy server Redis bằng lệnh: 
```
sudo service redis-server start
```

## Cài đặt Redis bằng gói cài đặt sẵn

Tải và cài đặt/giải nén phiên bản Windows:

- [Tải Redis cho Windows](https://github.com/tporadowski/redis/releases)

Chạy server Redis bằng lệnh: 
```
sudo service redis-server start
```

## Kết nối với Redis
Sau khi Redis chạy, bạn có thể kiểm tra bằng cách chạy lệnh 
```
redis-cli
```
Kiểm tra kết nối bằng lệnh ping:
```
127.0.0.1:6379> ping
PONG
```
Bạn cũng có thể kiểm tra xem máy chủ Redis của mình có đang chạy hay không bằng Redis Insight.