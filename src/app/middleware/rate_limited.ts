import rateLimit from "express-rate-limit";
import { MiddlewareFn } from "type-graphql";
import { Request, Response } from "express";

declare module "express-serve-static-core" {
  interface Request {
    rateLimit?: {
      limit: number;
      current: number;
      remaining: number;
      resetTime?: Date;
    };
  }
}
const apiLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const retryAfter = req.rateLimit?.resetTime
      ? Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000)
      : 0;
    res.status(429).send({
      code: 500,
      success: false,
      second: retryAfter,
      message: `Too many requests. Please try again after ${retryAfter} seconds.`,
    });
  },
});

export const RateLimitMiddleware: MiddlewareFn<{
  req: Request;
  res: Response;
}> = async ({ context }, next) => {
  return new Promise((resolve, reject) => {
    apiLimiter(context.req, context.res, (result: any) => {
      if (result instanceof Error) {
        reject(result);
      } else {
        resolve(next());
      }
    });
  });
};
