export function ExceptionMiddleware({
  message,
  status,
}: {
  message: string;
  status?: number;
}) {
  return JSON.stringify({
    success: false,
    status: status ?? 500,
    message,
  });
}
