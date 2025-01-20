export default function generateOTP() {
  // Implement your logic to generate a random, secure OTP
  // Here's a basic example using Math.random():
  const digits = 6;
  return Math.floor(Math.random() * 10 ** digits)
    .toString()
    .padStart(digits, "0");
}
