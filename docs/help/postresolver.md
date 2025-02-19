
# README

<h1 align="center" style="font-size: 30px; color: green">PostResolver - Quản lý bài đăng trong GraphQL</h1>

## **1. Giới thiệu**

`PostResolver` là một `GraphQL Resolver` chịu trách nhiệm **quản lý bài đăng**, **tương tác với bài đăng** và **phản ứng của người dùng** trong hệ thống. Resolver này cho phép người dùng **lấy danh sách bài đăng**, **tạo bài đăng mới**, và **thực hiện các reactons với bài đăng**.

### **Các chức năng chính:**
- **Quản lý bài đăng:** Lấy danh sách bài đăng, bài đăng của bạn bè, bài đăng của người dùng.
- **Tạo bài đăng mới:** Cho phép người dùng tạo bài đăng mới với hình ảnh và mô tả.
- **Quản lý tương tác:** Tăng/giảm số lượng tương tác của bài đăng.
- **Bảo mật API:** Chỉ cho phép người dùng có token hợp lệ truy cập dữ liệu bài đăng.

---

## **2. Query - Truy vấn bài đăng**

### **2.1. Lấy tất cả bài đăng (`allPosts`)**
  ```sh
    @Query((_return) => GetListPostResponse)
    async allPosts(
      @Arg("pageSize", { defaultValue: 10 }) pageSize: number,
      @Arg("pageNumber", { defaultValue: 1 }) pageNumber: number
    ): Promise<GetListPostResponse>
  ```

- `@Query()`: Đây là decorator của type-graphql để đánh dấu phương thức này là một query trong GraphQL. Nó sẽ trả về kiểu dữ liệu GetListPostResponse.
- `allPosts`: Đây là phương thức của resolver, mục đích lấy danh sách bài viết từ cơ sở dữ liệu.
- `@Arg("pageSize")` và `@Arg("pageNumber")`:  `pageSize` xác định số lượng bài viết trên mỗi trang, và `pageNumber` xác định trang hiện tại. Các tham số này có giá trị mặc định là 10 và 1 nếu client không cung cấp.

```sh
const posts = await Post.find()
      .populate("user")
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
```

- `Post.find()`: Đây là phương thức của mô hình Post (trong MongoDB, find() tìm tất cả các bài viết).
- `populate("user")`: Nếu trường user trong bài viết là một tham chiếu đến một tài liệu người dùng `(user), populate()` sẽ tự động thay thế tham chiếu này bằng dữ liệu người dùng thực tế.
- `skip()`: Phương thức này dùng để bỏ qua một số bài viết từ trang trước đó, hỗ trợ phân trang. Cụ thể,`(pageNumber - 1) * pageSize` tính toán số lượng bài viết cần bỏ qua.
- `limit()`: Giới hạn số lượng bài viết được trả về theo pageSize.
```sh
if (posts.length === 0) {
  return {
    code: 200,
    success: true,
    message: "No posts found.",
    data: posts,
  };
}
```
- Nếu không có bài viết nào trong kết quả (mảng posts trống), trả về thông báo "No posts found" kèm theo mã trạng thái 200 (thành công).

#### **🛠 Cách hoạt động:**
- Lấy tất cả bài đăng từ database với phân trang (`pageSize`, `pageNumber`).
- Trả về danh sách bài đăng cùng với thông tin người dùng.
- Nếu không có bài đăng, trả về thông báo `"post is empty"`.

---

### **2.2. Lấy bài đăng của bạn bè (`postsOfFriends`)**

```typescript
@UseMiddleware(VerifyTokenAll)
@Query((_return) => GetListPostResponse)
async postsOfFriends(
  @Arg("pageSize", { defaultValue: 10 }) pageSize: number,
  @Arg("pageNumber", { defaultValue: 1 }) pageNumber: number,
  @Ctx() { user }: Context
): Promise<GetListPostResponse>
```
- `@UseMiddleware(VerifyTokenAll)`:Middleware này sẽ kiểm tra tính hợp lệ của token người dùng (chắc chắn `VerifyTokenAll` xác thực người dùng đã đăng nhập và token của họ hợp lệ).
```sh
const friends: IFriend[] = await FriendModel.find({
  $or: [
    { user: user.id, status: FriendStatus.ACCEPTED },
    { friend: user.id, status: FriendStatus.ACCEPTED },
  ],
});
```
- `FriendModel.find()`: Tìm tất cả các bản ghi bạn bè trong cơ sở dữ liệu mà có trạng thái bạn bè là ACCEPTED. 
- Lệnh `$or` giúp tìm cả hai mối quan hệ: người dùng là user hoặc friend trong bảng bạn bè.
```sh
const friendIds: string[] = friends.map((friend) => {
  return friend.user.toString() === user.id
    ? friend.friend.toString()
    : friend.user.toString();
});

```
- `friendIds`: Lấy danh sách ID của những người bạn của người dùng. Câu lệnh này kiểm tra xem nếu `user.id` là `friend.user`, thì lấy ID của `friend.friend`, ngược lại lấy ID của `friend.user`.

#### **🛠 Cách hoạt động:**
- Kiểm tra danh sách bạn bè của người dùng qua bảng `FriendModel` với trạng thái kết bạn là `ACCEPTED`.
- Lấy bài đăng của bạn bè dựa trên danh sách bạn bè với phân trang.
- Trả về danh sách bài đăng của bạn bè hoặc thông báo nếu không có bài đăng.

---

### **2.3. Lấy bài đăng của người dùng (`yourPosts`)**

```typescript
@UseMiddleware(VerifyTokenAll)
@Query(() => GetListPostResponse)
async yourPosts(
  @Arg("pageSize", { defaultValue: 10 }) pageSize: number,
  @Arg("pageNumber", { defaultValue: 1 }) pageNumber: number,
  @Ctx() { user }: Context
): Promise<GetListPostResponse>
```

#### **🛠 Cách hoạt động:**
- Lấy bài đăng của người dùng hiện tại.
- Chỉ cho phép người dùng truy cập bài đăng của chính mình.
- Trả về danh sách bài đăng của người dùng hoặc thông báo nếu không có bài đăng.

---

## **3. Mutation - Quản lý bài đăng và tương tác**

### **3.1. Tạo bài đăng mới (`createPost`)**

```typescript
@UseMiddleware(VerifyTokenAll)
  @Mutation(() => PostMutationResponse)
  async createPost(
    @Arg("postInput") postInput: CreatePostInput,
    @Ctx() { user }: Context
  ): Promise<PostMutationResponse> {
    try {
      const existingUser = await User.findById(user.id);
      if (!existingUser) {
        return {
          code: 404,
          success: false,
          message: "User not found!",
        };
      }

```
- `User.findById(user.id)`: Kiểm tra xem người dùng có tồn tại trong cơ sở dữ liệu hay không. Nếu không tìm thấy người dùng, trả về thông báo lỗi với mã 404 (Không tìm thấy) và thông báo "User not found!".
```sh
const reactions = await Reaction.find();

const postReactions = reactions.map((reaction) => ({
  name: reaction.name,
  count: reaction.count,
  imageURL: reaction.imageURL,
}));
```
- `Reaction.find()`: Truy vấn tất cả các reactions có trong cơ sở dữ liệu.
- `postReactions`: Mảng `postReactions` lưu các reaction dưới dạng đối tượng, bao gồm tên, số lượng, và URL ảnh của phản ứng. Mỗi bài viết sẽ có các reaction này đi kèm.

#### **🛠 Cách hoạt động:**
1. Kiểm tra người dùng có hợp lệ không**.
2. Tạo bài đăng mới** với thông tin như `imageUrl`, `description`.
3. Tạo phản ứng mặc định (ví dụ: "like", "love").
4. Lưu bài đăng vào database và trả về thông tin bài đăng.

---

### **3.2. Tăng số lượng reaction của bài đăng (`increaseReactionCount`)**

```typescript
@UseMiddleware(VerifyTokenAll)
@Mutation(() => PostMutationResponse)
async increaseReactionCount(
  @Arg("postId") postId: string,
  @Arg("reactName") reactName: string,
  @Ctx() { user }: Context
): Promise<PostMutationResponse>
```

#### **🛠 Cách hoạt động:**
1. Kiểm tra người dùng có hợp lệ không.
2. Tìm bài đăng dựa trên `postId`.
3. Tăng số lượng phản ứng của bài đăng với tên phản ứng (`reactName`).
4. Lưu thay đổi và trả về bài đăng với phản ứng đã thay đổi.

---

### **3.3. Giảm số lượng reaction của bài đăng (`decreaseReactionCount`)**

```typescript
@UseMiddleware(VerifyTokenAll)
@Mutation(() => PostMutationResponse)
async decreaseReactionCount(
  @Arg("postId") postId: string,
  @Arg("reactName") reactName: string,
  @Ctx() { user }: Context
): Promise<PostMutationResponse>
```

#### **🛠 Cách hoạt động:**
1. Kiểm tra người dùng có hợp lệ không.
2. Tìm bài đăng và xác minh phản ứng có tồn tại.
3. Giảm số lượng reaction nếu có (số lượng reaction không thể giảm dưới 0).

  ```sh
    if (reaction.count > 0) {
            reaction.count--;
          }
  ```
  
4. **Lưu thay đổi** và trả về bài đăng với phản ứng đã thay đổi.

---


## **4. Tổng kết**

| Chức năng | Mô tả |
|-----------|------------|
| `allPosts` | Lấy danh sách tất cả bài đăng |
| `postsOfFriends` | Lấy bài đăng của bạn bè |
| `yourPosts` | Lấy bài đăng của người dùng hiện tại |
| `createPost` | Tạo bài đăng mới |
| `increaseReactionCount` | Tăng số lượng reaction của bài đăng |
| `decreaseReactionCount` | Giảm số lượng reaction của bài đăng |

🚀 **Hệ thống `PostResolver` cung cấp giải pháp quản lý bài đăng và reaction người dùng mạnh mẽ trong GraphQL!**

--- 

