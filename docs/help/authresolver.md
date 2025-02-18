# **AuthResolver - Quản lý xác thực người dùng trong GraphQL**

## **1. Giới thiệu**
`AuthResolver` là một `GraphQL Resolver` chịu trách nhiệm **xác thực người dùng**, **quản lý đăng nhập/đăng ký**, và **xử lý quên mật khẩu** trong hệ thống. Nó hoạt động bằng cách sử dụng **JSON Web Token (JWT)** để xác thực và bảo mật thông tin người dùng.

### **Các chức năng chính:**
- **Quản lý tài khoản người dùng:** Đăng ký, đăng nhập, đăng xuất, cập nhật thông tin cá nhân.
- **Quản lý bảo mật:** Quên mật khẩu, đặt lại mật khẩu bằng OTP.
- **Bảo vệ API:** Chỉ cho phép người dùng có token hợp lệ truy cập dữ liệu.
- **Phân quyền người dùng:** Kiểm tra quyền hạn thông qua JWT.

---

## **2. Query - Truy vấn dữ liệu người dùng**
### **2.1. Kiểm tra kết nối API (`hello`)**
```typescript
@Query((_return) => String)
@UseMiddleware(VerifyTokenAll)
async hello(@Ctx() context: Context): Promise<String> {
  const id = context.user.id;
  const data = await User.findOne({ _id: id });

  if (!data) {
    return `data not found`;
  }
  return `hello ${data.userName ?? "world"}`;
}
```
- **Middleware `VerifyTokenAll`**: Chỉ người dùng có **JWT hợp lệ** mới được truy cập.
- **Lấy `id` từ `context.user`** (do middleware xác thực JWT trước đó).
- **Tìm người dùng trong database bằng `User.findOne({ _id: id })`**.
- **Trả về `hello {userName}`** nếu tìm thấy, ngược lại trả về `"data not found"`

### **2.2. Lấy danh sách người dùng (`getUsers`)**
```typescript
@Query((_return) => [IUser])
@UseMiddleware(VerifyTokenAll)
async getUsers(@Ctx() _: Context): Promise<IUser[]> {
  const data = await User.find();
  return data;
}
```
- Chỉ **người dùng đã xác thực** mới có thể lấy danh sách người dùng.
- Lấy tất cả người dùng từ database (`User.find()`).

---

## **3. Mutation - Quản lý tài khoản**
### **3.1. Đăng ký tài khoản (`register`)**
```typescript
@Mutation((_return) => UserMutationResponse)
async register(
  @Arg("registerInput") registerInput: RegisterInput,
  @Ctx() { req }: Context
): Promise<UserMutationResponse> {
```
#### **🛠 Cách hoạt động:**
1. **Nhận dữ liệu đăng ký từ `registerInput`** gồm `email`, `userName`, `password`, `avatar`.
```sh
export class RegisterInput {
  @Field()
  email: string;
  @Field()
  userName: string;
  @Field()
  password: string;
  @Field({ nullable: true })
  avatar?: string;
}

```
2. **Kiểm tra email đã tồn tại chưa**:
```typescript
   const existingUser = await User.findOne({ email });
   if (existingUser) { return { code: 400, success: false, message: req.t("Email already exists!") }; }
```
- Tìm kiếm email trong database `(User.findOne({ email }))`.
- Nếu email đã tồn tại, trả về lỗi 400 cùng thông báo "Email already exists!".
```sh
const defaultRole = await RoleModel.findOne({ name: "member" });
```
- Tìm role mặc định (ví dụ: "member") để gán vào tài khoản mới.




3. **Tạo mật khẩu hash bằng `Bcrypt.hashPassword(password)`**.
```sh
const hashedPassword = await Bcrypt.hashPassword(password);
```
- Dùng class Bcrypt đã tạo trước đó để băm mật khẩu (hashPassword).
```sh 
public static hashPassword(plaintextPassword: string) {
        return bcrypt.hash(plaintextPassword, ConfigBcrypt.saltRounds);
    }
```
- Lý do: Không bao giờ lưu mật khẩu dạng text thuần trong database.
4. **Lưu tài khoản vào databasee**.
```sh
const newUser = new User({
  email,
  userName,
  password: hashedPassword,
  avatar: avatar,
  otp: undefined,
  otpExpirationTime: undefined,
  role: defaultRole,
});
await newUser.save();
```
5. **Trả về `"User registered successfully!"`**.

---

### **3.2. Đăng nhập (`login`)**
```typescript
@Mutation((_return) => UserMutationResponse)
async login(
  @Arg("loginInput") { email, password }: LoginInput,
  @Ctx() { req, res }: Context
): Promise<UserMutationResponse> {
```
#### **🛠 Cách hoạt động:**
1. **Tìm người dùng trong database bằng email**.
```sh
const checkAccount = await User.findOne({ email });

if (!checkAccount) {
  return {
    code: 400,
    success: false,
    message: req.t("Email not found!"),
  };
}

```
- `User.findOne({ email })`: Tìm kiếm tài khoản theo email trong database.
Nếu không tìm thấy, trả về lỗi 400 với thông báo "Email not found!".

2. **So sánh mật khẩu nhập vào với mật khẩu đã hash**.
```sh
let hashPassword = checkAccount?.password ?? "";
const checkPassword = await Bcrypt.comparePassword(password, hashPassword);

if (!checkPassword) {
  return {
    code: 400,
    success: false,
    message: req.t("Password error!"),
  };
}
```
```sh
public static comparePassword(plaintextPassword: string, hash: string) {
        return bcrypt.compare(plaintextPassword, hash);
    }
```

- hashPassword lấy mật khẩu đã mã hóa từ database (nếu có, nếu không thì là chuỗi rỗng "").
- Bcrypt.comparePassword(password, hashPassword): So sánh mật khẩu nhập vào với mật khẩu đã lưu (sử dụng bcrypt để hash và so sánh).
Nếu sai, trả về lỗi "Password error!".

3. **Nếu đúng**, tạo **Access Token** và **Refresh Token**.

```sh
const userModel: TokenPayLoad = {
      id: checkAccount.id,
      email: checkAccount.email,
      userName: checkAccount.userName,
      tokenPermissions: Role.ALL,
      role: checkAccount.role,
    };
const refreshToken = AuthMiddleware.sendRefreshToken(res, userModel);
```
`sendRefreshToken(res, userModel):`
- Gửi refresh token đến client (thường là qua cookie HTTP-Only để bảo mật).
- Refresh token giúp user tự động làm mới accessToken mà không cần đăng nhập lại.
4. **Trả về thông tin người dùng và token**.
```sh
return {
      code: 200,
      success: true,
      message: req.t("Logged in successfully!"),
      accessToken: AuthMiddleware.createToken(ConfigJWT.create_token_type, userModel),
      refreshToken: refreshToken ?? "",
      user: {
        id: checkAccount._id,
        email: checkAccount.email,
        userName: checkAccount.userName,
        password: "",
        avatar: checkAccount.avatar,
        role: checkAccount.role
      },
```
---

### **3.3. Đăng xuất (`logout`)**
```typescript
@Mutation((_return) => UserMutationResponse)
async logout(
  @Arg("id", (_type) => ID) id: any,
  @Ctx() { req, res }: Context
): Promise<UserMutationResponse> {
```
#### **🛠 Cách hoạt động:**
1. **Xác thực người dùng bằng ID**.
2. **Xóa token** khỏi database.
```sh
existingUser.token = "";
await existingUser.save();

```
3. **Xóa cookie `refreshToken` trong cookie**.
```sh
res.clearCookie(ConfigJWT.REFRESH_TOKEN_COOKIE_NAME, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/refresh_token",
});
```
- `res.clearCookie()`: Xóa cookie chứa refresh token để user bị đăng xuất.
- `httpOnly: true`: Ngăn chặn JavaScript truy cập cookie.
- `secure: true`: Chỉ gửi cookie qua HTTPS (chặn tấn công MITM).
- `sameSite: "lax"`: Chặn tấn công CSRF nhưng vẫn cho phép trong một số trường hợp cần thiết.
- `path: "/refresh_token"`: Chỉ xóa cookie có path /refresh_token.

4. **Trả về thông báo đăng xuất thành công**.
```sh
return {
  code: 200,
  success: true,
  message: req.t("Logged out successfully!"),
};
```
- Trả về trạng thái thành công (`200`), xác nhận đăng xuất.

---

## **4. Quên mật khẩu & Đặt lại mật khẩu**
### **4.1. Yêu cầu mã OTP để đặt lại mật khẩu (`forgotPassword`)**
```typescript
@Mutation((_return) => ForgotPasswordResponse)
async forgotPassword(
  @Arg("email") email: string,
  @Ctx() { req }: Context
): Promise<ForgotPasswordResponse> {
```
#### **🛠 Cách hoạt động:**
1. **Kiểm tra xem email có tồn tại không**.
2. **Tạo mã OTP ngẫu nhiên bằng `generateOTP()`**.
3. **Gửi OTP đến email của người dùng bằng `sendEmail()`**.
4. **Lưu OTP vào database với thời gian hết hạn**.

---

### **4.2. Xác thực mã OTP (`submitOTP`)**
```typescript
@Mutation((_return) => ForgotPasswordResponse)
async submitOTP(
  @Arg("email") email: string,
  @Arg("otp") otp: string,
  @Ctx() { req }: Context
): Promise<ForgotPasswordResponse> {
```
#### **🛠 Cách hoạt động:**
1. **Tìm người dùng bằng email**.
2. **So sánh OTP nhập vào với OTP trong database**.
3. **Kiểm tra OTP có hết hạn không**.
4. **Nếu hợp lệ, tạo Access Token tạm thời để đặt lại mật khẩu**.

---

### **4.3. Đặt lại mật khẩu (`resetPassword`)**
```typescript
@UseMiddleware(VerifyTokenForgotPassword)
@Mutation((_return) => ForgotPasswordResponse)
async resetPassword(
  @Arg("newPassword") newPassword: string,
  @Ctx() { req, user: payloadVerify }: Context
): Promise<ForgotPasswordResponse> {
```
#### **🛠 Cách hoạt động:**
1. **Middleware `VerifyTokenForgotPassword`** đảm bảo chỉ người dùng có token hợp lệ mới có thể đặt lại mật khẩu.
2. **Tạo mật khẩu hash mới bằng `Bcrypt.hashPassword()`**.
3. **Lưu mật khẩu mới vào database**.
4. **Trả về thông báo đặt lại mật khẩu thành công**.

---

## **5. Cập nhật thông tin cá nhân (`updateUser`)**
```typescript
@UseMiddleware(VerifyTokenAll)
@Mutation((_return) => UserMutationResponse)
async updateUser(
  @Arg("updateUserInput") updateUserInput: UpdateUserInput,
  @Ctx() context: Context
): Promise<UserMutationResponse> {
```
#### **🛠 Cách hoạt động:**
1. **Middleware `VerifyTokenAll` đảm bảo chỉ người dùng đã đăng nhập mới có thể cập nhật thông tin**.
2. **Tìm người dùng trong database bằng ID**.
3. **Cập nhật thông tin `userName` hoặc `avatar` nếu có**.
4. **Lưu thay đổi vào database**.
5. **Trả về thông tin mới của người dùng**.

---

## **6. Tổng kết**
| Chức năng | Mô tả |
|-----------|------------|
| `hello` | Kiểm tra API hoạt động |
| `getUsers` | Lấy danh sách người dùng |
| `register` | Đăng ký tài khoản mới |
| `login` | Đăng nhập và cấp Access Token |
| `logout` | Xóa token và đăng xuất |
| `forgotPassword` | Gửi OTP để đặt lại mật khẩu |
| `submitOTP` | Xác thực OTP |
| `resetPassword` | Đặt lại mật khẩu |
| `updateUser` | Cập nhật thông tin cá nhân |

🚀 **Hệ thống `AuthResolver` cung cấp giải pháp bảo mật toàn diện cho xác thực người dùng trên GraphQL!**
