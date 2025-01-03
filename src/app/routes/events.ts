import { Request, Response, Router } from "express";

const events = Router();

events.post("/register", async (_: Request, res: Response): Promise<any> => {
  try {
    return res.status(200).json({
        success: true,
        message: "success",
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({
      success: false,
      message: "error" + error,
    });
  }
});

// events.get("events", async (req, res): Promise<any> => {
    //   console.log("sending refresh token...");
    //   const nameCookie = ConfigJWT.REFRESH_TOKEN_COOKIE_NAME;
    //   let refreshToken = await req?.cookies[nameCookie];
    //   if (!refreshToken) {
    //     refreshToken = req.header(nameCookie);
    //   }

    //   if (!refreshToken) {
    //     return res.status(403).json({
    //       success: false,
    //       message: "No refresh token found",
    //     });
    //   }

    //   try {
    //     const decoded = verify(
    //       refreshToken,
    //       ConfigJWT.JWT_REFRESH_PRIVATE_KEY as Secret
    //     ) as UserAuthPayload;

    //     const existingUser = await User.findOne({
    //       _id: decoded.id,
    //     });

    //     if (!existingUser) {
    //       return res.status(401).json({
    //         success: false,
    //         message: "User not found",
    //       });
    //     }

    //     if (decoded.tokenVersion !== existingUser.tokenVersion) {
    //       return res.status(401).json({
    //         success: false,
    //         message: "Token Version exp",
    //       });
    //     }

    //     const tokenPayload: TokenPayLoad = {
    //       id: existingUser._id,
    //       email: existingUser.email,
    //       userName: existingUser.userName,
    //       tokenVersion: existingUser.tokenVersion ?? 0,
    //       role: Role.ALL,
    //     };

    //     return res.status(200).json({
    //       success: true,
    //       message: "Successfully!!!",
    //       accessToken: Auth.createToken(ConfigJWT.create_token_type, tokenPayload),
    //       // refreshToken: Auth.sendRefreshToken(res, tokenPayload),
    //     });
    //   } catch (error) {
    //     console.log(error);
    //     return res.status(403).json({
    //       success: false,
    //       message: "error" + error,
    //     });
    //   }
// });

export default events;
