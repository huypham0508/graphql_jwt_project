# Post Model

## Mục Đích 
File này định nghĩa model "Post" trong hệ thống bằng Mongoose (quản lý MongoDB) và TypeGraphQL (hỗ trợ GraphQL).
Mô hình này giúp quản lý bài viết của người dùng, có thể chứa ảnh, mô tả và các phản ứng (reactions) từ người dùng khác.

## Hoạt Động Của Code

### 1. Định nghĩa kiểu dữ liệu `IPost` cho Graphql

```ts
@ObjectType()
export class IPost {
  @Field((_type) => ID)
  id: any;

  @Field((_type) => IUser)
  user: IUser;

  @Field((_type) => [IReaction])
  reactions: IReaction[];

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  description?: string;
}
```
- `@ObjectType()`: Định nghĩa `IPost` là một ObjectType trong GraphQL.
- `@Field(() => ID) id`: ID của bài viết.
- `@Field(() => IUser) user`: Người dùng tạo bài viết.
- `@Field(() => [IReaction]) reactions`: Danh sách phản ứng của người dùng khác với bài viết này.
- `@Field({ nullable: true }) imageUrl?`: Ảnh đính kèm bài viết (nếu có).
- `@Field({ nullable: true }) description?`: Nội dung mô tả bài viết (nếu có).

🔹 Tại sao dùng `nullable: true`?
- Một bài viết có thể chỉ có hình ảnh mà không có mô tả.
- Hoặc bài viết chỉ có mô tả mà không có hình ảnh.

### 3. Định nghĩa Schema Mongoose
```ts
export const PostSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: ModelName.USER, required: true },
    imageUrl: {
      type: String,
    },
    description: {
      type: String,
    },
    reactions: [{ type: Schema.Types.ObjectId, ref: ModelName.REACTION, require: true }],
  },
  { timestamps: true }
);
```
- `user`:
    - Mỗi bài post phải thuộc về một người dùng (`ref: ModelName.USER`).
    - Kiểu ObjectId dùng để liên kết với `UserModel`.
    - `required: true` đảm bảo bài viết luôn phải có người tạo.
- `imageUrl`: Lưu đường dẫn ảnh bài viết (nếu có).
- `description`: Lưu mô tả bài viết (nếu có).
- `reactions`:
    - Là một mảng chứa ID của các phản ứng (`ref: ModelName.REACTION`).
    - Liên kết đến collection `Reaction`.
- `timestamps: true`

    - MongoDB tự động thêm `createdAt` và `updatedAt`.
    - Giúp theo dõi thời điểm tạo và cập nhật bài viết.

### 4. Khởi tạo Model Mongoose
```ts
const PostModel = model<IPost>(ModelName.POST, PostSchema);
export default PostModel;
```
- `model<IPost>(ModelName.POST, PostSchema)`
    - Tạo model Mongoose có tên POST từ `PostSchema`.
    - Cho phép thực hiện các thao tác CRUD trên collection `posts`.
- `export default PostModel`
    - Giúp có thể import `PostModel` ở các file khác để sử dụng.

## Mẫu sử dụng PostModel trong thực tế
### 1. Tạo một bài viết mới
```ts
const newPost = await PostModel.create({
  user: userId,
  description: "Đây là bài viết đầu tiên của tôi!",
  imageUrl: "https://example.com/image.jpg",
});
console.log("Bài viết mới:", newPost);
```
- `user`: ID của người đăng bài.
- `description`: Nội dung bài viết.
- `imageUrl`: Ảnh đính kèm.

### 2. Lấy danh sách tất cả bài viết
```ts
const posts = await PostModel.find().populate("user").populate("reactions");
console.log(posts);
```

- `.find()`: Lấy tất cả bài viết.
- `.populate("user")`: Lấy thêm thông tin của người đăng bài.
- `.populate("reactions")`: Lấy danh sách phản ứng trên bài viết.

